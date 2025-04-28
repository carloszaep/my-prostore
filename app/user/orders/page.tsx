import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyOrders } from "@/lib/actions/order-actions";
import { formatCurrency, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Orders",
};

const OrderPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams;

  const orders = await getMyOrders({ page: Number(page) || 1 });

  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto ">
        <Table>
          <TableHeader>
            <TableRow className="text-xs md:text-sm">
              <TableHead>ID</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow
                className="text-xs md:text-sm"
                key={order.id}
              >
                <TableCell>{formatId(order.id)}</TableCell>

                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>

                <TableCell>
                  {!order.isPaid && "Not Paid"}
                  {order.isPaid && order.isDelivered && "Delivered"}
                  {order.isPaid &&
                    !order.isDelivered &&
                    !order.trackingNumber &&
                    "Waiting for shipment"}
                  {order.isPaid &&
                    !order.isDelivered &&
                    order.trackingNumber &&
                    "Shipped"}
                </TableCell>
                <TableCell>
                  <Button
                    asChild
                    variant={"outline"}
                    size={"sm"}
                  >
                    <Link href={`/order/${order.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination
            page={Number(page) || 1}
            totalPage={orders?.totalPages}
          />
        )}
      </div>
    </div>
  );
};

export default OrderPage;
