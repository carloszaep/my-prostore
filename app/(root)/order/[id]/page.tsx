import { getOrderById } from '@/lib/actions/order-actions';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderDetailsTable from './order-details-table';
import { ShippingAddress } from '@/types';
import { auth } from '@/auth';
import Stripe from 'stripe';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'Order Details Page',
};

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const order = await getOrderById(id);

  if (!order) notFound();

  const session = await auth();

  let client_secret = null;

  // check if is not paid and using stripe
  if (order.paymentMethod === 'Stripe' && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: 'usd',
      metadata: { orderId: order.id },
      payment_method_types: ['card'],
    });

    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
        user: order.user || undefined,
        guestUser: order.guestUser || undefined,
      }}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin' || false}
    />
  );
};

export default OrderDetailsPage;
