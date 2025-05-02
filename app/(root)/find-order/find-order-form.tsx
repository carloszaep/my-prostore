'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { findOrderByIdAndEmail } from '@/lib/actions/order-actions';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

const FindOrderForm = () => {
  const [data, action] = useActionState(findOrderByIdAndEmail, {
    success: false,
    message: '',
  });

  const SummitButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} className='w-full' variant={'default'}>
        {pending ? 'Working...' : 'Find Order'}
      </Button>
    );
  };

  return (
    <form className='flex flex-col gap-4' action={action}>
      {!(data && data.success) && (
        <>
          <Input
            name='orderId'
            type='text'
            placeholder='Order ID'
            className='border p-2 rounded'
          />
          <Input
            name='email'
            type='email'
            placeholder='Email Address'
            className='border p-2 rounded'
          />
          <SummitButton />

          {data && !data.success && (
            <div className='text-center text-destructive'>{data.message}</div>
          )}
        </>
      )}

      {data && data.success && (
        <>
          <div className='text-center text-success'>{data.message}</div>
          <Button asChild className='w-full' variant={'secondary'}>
            <Link href={`/order/${data.orderId}`}>View Order</Link>
          </Button>
        </>
      )}
    </form>
  );
};

export default FindOrderForm;
