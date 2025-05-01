'use client';

import { Button } from '@/components/ui/button';

import { resetPassword } from '@/lib/actions/user.actions';
import { signUpDefaultValues } from '@/lib/constants';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import InputPassword from '@/components/shared/input-password';

const ResetPasswordForm = ({ token }: { token?: string | null }) => {
  const [data, action] = useActionState(resetPassword, {
    success: false,
    message: '',
  });

  const ResetPasswordButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} className='w-full' variant={'default'}>
        {pending ? 'Submitting...' : 'Summit'}
      </Button>
    );
  };

  return (
    <form action={action}>
      <div className='space-y-6'>
        {!(data && data.success) && (
          <>
            <input type='hidden' name='token' value={token ?? ''} />
            <InputPassword
              defaultValue={signUpDefaultValues.password}
              name='password'
              label='New Password'
            />
            <InputPassword
              defaultValue={signUpDefaultValues.confirmPassword}
              name='confirmPassword'
              label='Confirm New Password'
            />

            <div>
              <ResetPasswordButton />
            </div>
          </>
        )}

        {data && !data.success && (
          <div className='text-center text-destructive'>{data.message}</div>
        )}

        {data && data.success && (
          <div className='flex flex-col items-center justify-center'>
            <div className='text-center text-success'>{data.message}</div>
            <Button
              variant={'outline'}
              className='mt-4 ml-2'
              onClick={() => {
                window.location.href = '/user/profile';
              }}
            >
              Sing In
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default ResetPasswordForm;
