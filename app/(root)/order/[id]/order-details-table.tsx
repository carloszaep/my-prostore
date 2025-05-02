'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Order } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import {
  approvePayPalOrder,
  createPayPalOrder,
  updateOrderToPaidCOD,
  deliverOrder,
  removeTrackingNumber,
} from '@/lib/actions/order-actions';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import StripePayment from './stripe-payment';
import MarkAsShipped from './tracking-number';

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Omit<Order, 'paymentResult'>;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) => {
  const {
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    isDelivered,
    id,
    paidAt,
    deliveredAt,
    trackingNumber,
  } = order;

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(trackingNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const { toast } = useToast();

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);

    if (!res.success) {
      toast({
        variant: 'destructive',
        description: res.message,
      });
    }

    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);

    toast({
      variant: res.success ? 'default' : 'destructive',
      description: res.message,
    });
  };

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = '';

    if (isPending) {
      status = 'Loading PayPal...';
    } else if (isRejected) {
      status = 'Error Loading PayPal';
    }

    return status;
  };

  // button to mark order as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();

    const { toast } = useToast();

    return (
      <Button
        type='button'
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(order.id);

            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            });
          })
        }
      >
        {isPending ? 'processing...' : 'Mark As Paid'}
      </Button>
    );
  };
  // button to mark order as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();

    const { toast } = useToast();

    return (
      <Button
        type='button'
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id);

            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            });
          })
        }
      >
        {isPending ? 'processing...' : 'Mark As Delivered'}
      </Button>
    );
  };

  const RemoveTrackingNumber = () => {
    const [isPending, startTransition] = useTransition();

    const { toast } = useToast();

    return (
      <Button
        type='button'
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await removeTrackingNumber(order.id);

            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            });
          })
        }
      >
        {isPending ? 'processing...' : 'Remove'}
      </Button>
    );
  };

  return (
    <>
      {isPaid && <h1 className='py-444 text-2xl'>Order {formatId(id)}</h1>}
      <div className='grid md:grid-cols-3 md:gap-5'>
        <Card className='md:order-2'>
          <CardContent className='p-4 gap-4 space-y-4'>
            <div className='flex justify-between'>
              <div>Items</div>
              <div> {formatCurrency(itemsPrice)}</div>
            </div>
            <div className='flex justify-between'>
              <div>Tax</div>
              <div> {formatCurrency(taxPrice)}</div>
            </div>
            <div className='flex justify-between'>
              <div>Shipping</div>
              <div> {formatCurrency(shippingPrice)}</div>
            </div>
            <div className='flex justify-between'>
              <div>Total</div>
              <div> {formatCurrency(totalPrice)}</div>
            </div>
            {/* paypal payment */}
            {!isPaid && paymentMethod === 'PayPal' && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              </div>
            )}
            {/* stripe payment */}
            {!isPaid && paymentMethod === 'Stripe' && stripeClientSecret && (
              <StripePayment
                priceInCents={Number(order.totalPrice) * 100}
                orderId={order.id}
                clientSecret={stripeClientSecret}
              />
            )}

            {/* cash on delivery */}
            {isAdmin && !isPaid && <MarkAsPaidButton />}

            {isAdmin && isPaid && !trackingNumber && (
              <MarkAsShipped orderId={order.id} />
            )}
            {isAdmin && isPaid && trackingNumber && !isDelivered && (
              <MarkAsDeliveredButton />
            )}
          </CardContent>
        </Card>
        <div className='md:col-span-2 order-1 space-4-y overflow-x-auto'>
          {/* tracking number */}
          {trackingNumber && (
            <Card className='mb-2 mt-2'>
              <CardContent className='p-4 gap-4'>
                <h2 className='text-xl pb-4'>Tracking Number</h2>
                <span className='font-mono text-sm '>{trackingNumber}</span>
                <Button
                  variant='ghost'
                  onClick={copyToClipboard}
                  className=' hover:text-gray-800'
                >
                  <Copy size={16} />
                </Button>
                {copied && (
                  <span className='text-xs text-green-600'>Copied!</span>
                )}

                {isAdmin && <RemoveTrackingNumber />}
              </CardContent>
            </Card>
          )}

          <Card className='mt-2 mb-2'>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className='flex items-center'
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />

                          <span className='px-2'>
                            {item.name} {item.size && `(${item.size})`}
                          </span>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <span className='px-2'>{item.qty}</span>
                      </TableCell>
                      <TableCell>
                        <span className='text-right'>${item.price}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4 '>Order Status</h2>

              {isPaid ? (
                <Badge variant={'secondary'}>
                  Paid on {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant={'destructive'}>Not paid</Badge>
              )}
              <br />

              {isDelivered && (
                <Badge variant={'secondary'}>
                  Delivered on {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className='my-2'>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city}
              </p>
              <p className='mb-2'>
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
