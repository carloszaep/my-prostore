import { auth } from '@/auth';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getMyCart } from '@/lib/actions/cart.actions';
import { formatCurrency } from '@/lib/utils';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PlaceOrderFrom from './place-order-form';
import { PAYMENT_METHODS } from '@/lib/constants';
import { userCheckoutInfo } from '@/lib/actions/user.actions';

export const metadata: Metadata = {
  title: 'Place Order',
  description: 'Place your order',
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();
  const userId = session?.user?.id;

  const { address, paymentMethod } = await userCheckoutInfo(
    userId || null,
    cart.guestId
  );

  if (!address) redirect('/shipping-address');
  if (!paymentMethod && PAYMENT_METHODS.length > 1) redirect('/payment-method');

  return (
    <>
      <CheckoutSteps current={PAYMENT_METHODS.length > 1 ? 3 : 2} />
      <h1 className='py-4 text-2xl'>Confirm Order</h1>
      <div className='grid md:grid-cols-3 gap-5'>
        <div className='md:col-span-2 overflow-x-auto space-y-4'>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Shipping Address</h2>
              <p>{address.fullName}</p>
              <p>
                {address.streetAddress}, {address.city} {address.postalCode},{' '}
                {address.country}{' '}
              </p>
              <div className='mt-3'>
                <Link href='/shipping-address'>
                  <Button variant='outline'>Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          {PAYMENT_METHODS.length > 1 && (
            <Card>
              <CardContent className='p-4 gap-4'>
                <h2 className='text-xl pb-4'>Payment Method</h2>
                <p>
                  {paymentMethod === 'Stripe' ? 'Credit Card' : paymentMethod}
                </p>

                <div className='mt-3'>
                  <Link href='/payment-method'>
                    <Button variant='outline'>Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
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
                  {cart.items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/products/${item.slug}`}
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
        </div>
        <div>
          <Card>
            <CardContent className='p-4 gap-4 space-y-4'>
              <div className='flex justify-between'>
                <div>Items</div>
                <div> {formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div> {formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping</div>
                <div> {formatCurrency(cart.shippingPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Total</div>
                <div> {formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderFrom />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderPage;
