'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/lib/actions/user.actions';
import { signUpDefaultValues } from '@/lib/constants';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

const ForgotPasswordForm = () => {
  const [data, action] = useActionState(forgotPassword, {
    success: false,
    message: '',
  });

  const ForgotPasswordButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} className='w-full' variant={'default'}>
        {pending ? 'Submitting...' : 'Submit'}
      </Button>
    );
  };

  return (
    <form action={action}>
      <div className='space-y-6'>
        {!(data && data.success) && (
          <>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                defaultValue={signUpDefaultValues.email}
              />
            </div>

            <div>
              <ForgotPasswordButton />
            </div>
          </>
        )}

        {data && !data.success && (
          <div className='text-center text-destructive'>{data.message}</div>
        )}

        {data && data.success && (
          <div className='flex flex-col items-center justify-center'>
            <div className='text-center text-success'>{data.message}</div>
            <p className='text-center text-sm text-muted-foreground'>
              If you don&apos;t see the email, please check your spam folder.
            </p>
            <Button
              variant={'outline'}
              className='mt-4 ml-2'
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go back home
            </Button>
          </div>
        )}

        <div className='text-sm text-center text-muted-foreground'>
          Remember your password?{' '}
          <Link href='/sign-in' className='underline hover:text-primary'>
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
