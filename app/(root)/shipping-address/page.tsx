import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { userCheckoutInfo } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ShippingAddressFrom from './shipping-address-form';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { ShippingAddress } from '@/types';

export const metadata: Metadata = {
  title: 'Shipping Address',
  description: 'Shipping Address',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();
  const userId = session?.user?.id;

  const { address, isSignIn } = await userCheckoutInfo(
    userId || null,
    cart.guestId
  );

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressFrom
        address={address as ShippingAddress}
        isSingIn={isSignIn}
      />
    </>
  );
};

export default ShippingAddressPage;
