import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ForgotPasswordForm from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Forgot your password',
};

const ForgotPasswordPage = async () => {
  const session = await auth();

  if (session) {
    return redirect('/');
  }

  return (
    <div>
      <Card>
        <CardHeader className='space-y-4'>
          <Link href={'/'} className='flex-center'>
            <Image
              src='/images/logo.svg'
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority={true}
            />
          </Link>
          <CardTitle className='text-center'>Forgot Password</CardTitle>
          <CardDescription className='text-center'>
            Reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
