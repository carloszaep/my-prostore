import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import PaymentMethodForm from './payment-method-form';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { getMyCart } from '@/lib/actions/cart.actions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Payment Method',
  description: 'Payment Method',
};

const PaymentMethodPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();
  const userId = session?.user?.id;

  let isSingIn = false;
  let paymentMethod: string | null = null;

  if (userId) {
    const user = await getUserById(userId);
    isSingIn = true;
    paymentMethod = user.paymentMethod || null;
  }

  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm
        preferredPaymentMethod={paymentMethod}
        isSingIn={isSingIn}
      />
    </>
  );
};

export default PaymentMethodPage;
