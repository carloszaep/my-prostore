import { Metadata } from 'next';
import FindOrderForm from './find-order-form';

export const metadata: Metadata = {
  title: 'Find Your Order',
  description: 'Find Your Order',
};

const FindOrderPage = () => {
  return (
    <>
      <div className='flex justify-center items-center flex-col space-y-4 py-8 mb-10'>
        <h1 className='h2-bold'>Find Your Order</h1>
        <FindOrderForm />
      </div>
    </>
  );
};

export default FindOrderPage;
