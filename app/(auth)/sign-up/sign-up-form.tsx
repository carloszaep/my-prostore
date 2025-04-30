'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpUser } from '@/lib/actions/user.actions';
import { signUpDefaultValues } from '@/lib/constants';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import InputPassword from '@/components/shared/input-password';
import { Checkbox } from '@/components/ui/checkbox';

const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const SignUpButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} className='w-full' variant={'default'}>
        {pending ? 'Signing Up...' : 'Sign Up'}
      </Button>
    );
  };

  return (
    <form action={action}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='space-y-6'>
        <div>
          <Label htmlFor='name'>Name</Label>
          <Input
            id='name'
            name='name'
            type='text'
            required
            autoComplete='name'
            defaultValue={signUpDefaultValues.name}
          />
        </div>
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
        <InputPassword
          defaultValue={signUpDefaultValues.password}
          name='password'
          label='Password'
        />
        <InputPassword
          defaultValue={signUpDefaultValues.confirmPassword}
          name='confirmPassword'
          label='Confirm Password'
        />

        <div className='flex items-start space-x-2'>
          <Checkbox
            id='terms'
            name='termsAccepted'
            required
            className='mt-1 h-4 w-4'
          />
          <Label htmlFor='terms' className='text-sm text-muted-foreground'>
            By signing up, I agree to the{' '}
            <Link href='/terms' className='underline hover:text-primary'>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href='/privacy' className='underline hover:text-primary'>
              Privacy Policy
            </Link>
            .
          </Label>
        </div>

        <div>
          <SignUpButton />
        </div>

        {data && !data.success && (
          <div className='text-center text-destructive'>{data.message}</div>
        )}

        <div className='text-sm text-center text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/sign-in' className='underline hover:text-primary'>
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;
