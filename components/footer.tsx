import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className='container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'>
        {/* Brand Info */}
        <div className='flex justify-start items-start'>
          <Image
            src='/images/logo.svg'
            alt={APP_NAME}
            width={45}
            height={45}
            priority
          />
          <span className='hidden lg:block font-bold text-2xl ml-3'>
            {APP_NAME}
          </span>

          {/* <p className="text-sm leading-relaxed">
            Your one-stop shop for quality products, fast shipping, and stellar
            support.
          </p> */}
        </div>

        {/* Company Links */}
        <div>
          <h5 className='font-semibold mb-4'>Company</h5>
          <ul className='space-y-2'>
            <li>
              <Link href='/about'>About Us</Link>
            </li>
            <li>
              <Link href='/careers'>Careers</Link>
            </li>
            <li>
              <Link href='/blog'>Blog</Link>
            </li>
            <li>
              <Link href='/contact'>Contact</Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h5 className='font-semibold mb-4'>Customer Service</h5>
          <ul className='space-y-2'>
            <li>
              <Link href='/help-center'>Help Center</Link>
            </li>
            <li>
              <Link href='/find-order'>Find Order</Link>
            </li>
            <li>
              <Link href='/terms'>Terms of Service</Link>
            </li>
            <li>
              <Link href='/privacy'>Privacy Policy</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter & Social */}
        <div>
          <h5 className='font-semibold mb-4'>Stay Updated</h5>
          <form className='flex mb-4 gap-1'>
            <Input type='email' placeholder='Your email' />
            <Button type='submit' variant={'outline'}>
              Subscribe
            </Button>
          </form>
          <div className='flex space-x-4'>
            <Link href='#' aria-label='Facebook'>
              <Image
                src='/images/facebook.svg'
                alt='Facebook'
                width={20}
                height={20}
              />
            </Link>
            <Link href='#' aria-label='Twitter'>
              <Image src='/images/x.svg' alt='Twitter' width={20} height={20} />
            </Link>
            <Link href='#' aria-label='Instagram'>
              <Image
                src='/images/instagram.svg'
                alt='Instagram'
                width={20}
                height={20}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Divider & Payment Methods */}
      <div className='border-t mt-8 pt-6'>
        <div className='container mx-auto px-6 flex flex-col md:flex-row items-center justify-between'>
          <p className='text-sm'>
            &copy; {currentYear} {APP_NAME}. All Rights Reserved.
          </p>
          <div className='flex space-x-4 mt-4 md:mt-0'>
            <Image src='/images/visa.svg' width={40} height={24} alt='Visa' />
            <Image
              src='/images/mastercard.svg'
              width={40}
              height={24}
              alt='Mastercard'
            />
            <Image
              src='/images/stripe.svg'
              width={25}
              height={24}
              alt='Stripe'
            />
            <Image
              src='/images/americanexpress.svg'
              width={25}
              height={24}
              alt='American Express'
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
