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

import ResetPasswordForm from './reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password',
};

const ResetPasswordPage = async (props: {
  searchParams: Promise<{ token: string | null }>;
}) => {
  const { token } = await props.searchParams;

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
          <CardTitle className='text-center'>Reset Password</CardTitle>
          <CardDescription className='text-center'>
            Reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
