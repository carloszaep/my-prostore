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
import CredentialsSignInForm from './credentials-sigin-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
};

const SignInPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();

  if (session) {
    return redirect(callbackUrl || '/');
  }

  const isFromShippingAddress = callbackUrl?.includes('shipping-address');

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        isFromShippingAddress
          ? 'md:grid md:grid-cols-3 md:space-y-2 md:space-x-2'
          : ''
      )}
    >
      <Card>
        <CardHeader className='space-y-4'>
          <Link href='/' className='flex-center'>
            <Image
              src='/images/logo.svg'
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority={true}
            />
          </Link>
          <CardTitle className='text-center'>Sign In</CardTitle>
          <CardDescription className='text-center'>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CredentialsSignInForm />
        </CardContent>
      </Card>

      {isFromShippingAddress && (
        <>
          <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <div className='h-px flex-1 bg-border' />
            <span>OR</span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <Card className='flex flex-col justify-center'>
            <CardHeader>
              <CardTitle className='text-center'>Continue as Guest</CardTitle>
              <CardDescription className='text-center'>
                No account? Continue without signing in.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex justify-center'>
              <Button asChild className='w-full' variant={'secondary'}>
                <Link href={callbackUrl}>Continue as Guest</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SignInPage;
