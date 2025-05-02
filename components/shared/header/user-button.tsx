import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { signOutUser } from '@/lib/actions/user.actions';
import { UserIcon } from 'lucide-react';
import Link from 'next/link';

const UserButton = async () => {
  const session = await auth();

  if (!session) {
    return (
      <Button asChild>
        <Link href='/sign-in'>
          <UserIcon /> Sign in
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className='flex gap-2 items-center'>
      {/* Dropdown version for screens sm and up */}
      <div className='hidden sm:flex'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='flex items-center'>
              <Button
                variant={'ghost'}
                className='relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-300'
              >
                {firstInitial}
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal '>
              <div className='flex flex-col space-y-1'>
                <div className='text-sm font-medium leading-none'>
                  {session.user?.name}
                </div>
                <div className='text-sm text-muted-foreground leading-none'>
                  {session.user?.email}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem>
              <Link href='/user/profile' className='w-full'>
                User Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href='/user/orders' className='w-full'>
                Order History
              </Link>
            </DropdownMenuItem>
            {session.user?.role === 'admin' && (
              <DropdownMenuItem>
                <Link href='/admin/overview' className='w-full'>
                  Admin
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <form action={signOutUser} className='w-full'>
                <button className='p-0 m-0'>Sign Out</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Alternative simple navigation for small screens */}
      <div className='flex flex-col sm:hidden gap-4'>
        <div className='flex flex-col'>
          <div className='text-sm font-medium leading-none'>
            {session.user?.name}
          </div>
          <div className='text-sm text-muted-foreground leading-none'>
            {session.user?.email}
          </div>
        </div>

        <Link href='/user/profile' className='w-full'>
          User Profile
        </Link>

        <Link href='/user/orders' className='w-full'>
          Order History
        </Link>
        {session.user?.role === 'admin' && (
          <Link href='/admin/overview' className='w-full'>
            Admin
          </Link>
        )}

        <form action={signOutUser}>
          <button className='p-0 m-0 outline-none hover:outline-none'>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserButton;
