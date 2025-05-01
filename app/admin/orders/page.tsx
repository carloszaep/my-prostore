import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guard';
import {
  deleteOrder,
  deleteUnpaidOrders,
  getAllOrders,
} from '@/lib/actions/order-actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';

export const metadata: Metadata = {
  title: 'Admin Orders',
};

const AdminOrdersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = '1', query: searchText } = await props.searchParams;

  await requireAdmin();

  const orders = await getAllOrders({ page: Number(page), query: searchText });

  return (
    <div className='space-y-2'>
      <div className='flex-between'>
        <div className='flex items-center gap-3'>
          <h1 className='h2-bold'>Orders</h1>
          {searchText && (
            <div>
              Filter by <i>&quot;{searchText}&quot;</i>{' '}
              <Link href={'/admin/orders'}>
                <Button variant={'outline'} size={'sm'}>
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <DeleteDialog
          many={true}
          actionMany={deleteUnpaidOrders}
          text='Delete Not Paid Orders'
          additionalAlertText='This action will delete all unpaid orders that are more than a 24h old.'
        />
      </div>
      <div className='overflow-x-auto '>
        <Table>
          <TableHeader>
            <TableRow className='text-xs md:text-sm'>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>BUYER</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow className='text-xs md:text-sm' key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>
                  {order.user?.name || order.guestUser?.name}
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : 'Not Paid'}
                </TableCell>
                <TableCell>
                  {!order.isPaid && 'Not Paid'}
                  {order.isPaid && order.isDelivered && 'Delivered'}
                  {order.isPaid &&
                    !order.isDelivered &&
                    !order.trackingNumber &&
                    'Not Shipped'}
                  {order.isPaid &&
                    !order.isDelivered &&
                    order.trackingNumber &&
                    'Shipped'}
                </TableCell>
                <TableCell className='flex flex-col md:flex-row gap-2'>
                  <Button asChild variant={'outline'} size={'sm'}>
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPage={orders?.totalPages} />
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
