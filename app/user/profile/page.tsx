import { auth } from '@/auth';
import { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import ProfileForm from './profile-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'User profile page',
};

const Profile = async () => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className='max-w-md mx-auto space-y-3'>
        <h2 className='h2-bold'>Profile</h2>
        <ProfileForm />

        {/* reset password link */}
        <h2 className='h2-bold'>Reset Password</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          You can reset your password by clicking the link below.
        </p>
        <Button asChild size={'lg'} className='button col-span-2 w-full'>
          <Link href='/reset-password'>Reset Password</Link>
        </Button>
      </div>
    </SessionProvider>
  );
};

export default Profile;
