import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ShippingAddressFrom from './shipping-address-form';
import { ShippingAddress } from '@/types';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { shippingAddressDefaultValues } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shipping Address',
  description: 'Shipping Address',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();
  const userId = session?.user?.id;

  let userAddress: ShippingAddress;
  let isSingIn = false;

  userAddress = shippingAddressDefaultValues;

  if (userId) {
    const user = await getUserById(userId);
    userAddress = user?.address as ShippingAddress;
    isSingIn = true;
  }
  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressFrom address={userAddress} isSingIn={isSingIn} />
    </>
  );
};

export default ShippingAddressPage;
