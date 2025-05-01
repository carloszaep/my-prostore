import { auth } from '@/auth';
import { Metadata } from 'next';
import PaymentMethodForm from './payment-method-form';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { getMyCart } from '@/lib/actions/cart.actions';
import { redirect } from 'next/navigation';
import { userCheckoutInfo } from '@/lib/actions/user.actions';

export const metadata: Metadata = {
  title: 'Payment Method',
  description: 'Payment Method',
};

const PaymentMethodPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();
  const userId = session?.user?.id;

  const { paymentMethod, isSignIn } = await userCheckoutInfo(
    userId || null,
    cart.guestId
  );

  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm
        preferredPaymentMethod={paymentMethod}
        isSingIn={isSignIn}
      />
    </>
  );
};

export default PaymentMethodPage;
