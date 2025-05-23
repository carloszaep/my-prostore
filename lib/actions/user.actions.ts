'use server';

import {
  editUserSchema,
  forgotPasswordSchema,
  paymentMethodSchema,
  resetPasswordSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from '../validators';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import { z } from 'zod';
import { PAGE_SIZE, SERVER_URL } from '../constants';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { sendPasswordChangedEmail, sendResetPasswordEmail } from '@/email';
import { getMyCart } from './cart.actions';

// sign in user with credentials

export async function signinWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Sign in successful' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: 'invalid credentials' };
  }
}

// sign out user
export async function signOutUser() {
  const currentCart = await getMyCart();

  if (currentCart) {
    await prisma.cart.delete({ where: { id: currentCart?.id } });
  }
  await signOut();
}

// signup user

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn('credentials', { email: user.email, password: plainPassword });

    return { success: true, message: 'Sign up successful' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: formatError(error) };
  }
}

// send user reset password email
export async function forgotPassword(prevState: unknown, formData: FormData) {
  try {
    // Validate input
    const email = forgotPasswordSchema.parse({
      email: formData.get('email'),
    });

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email.email },
    });
    if (!user) throw new Error('User not found');

    // row email
    const rowEmail = user.email;

    // Generate a secure reset token by hashing the email with a salt
    email.email = hashSync(email.email, 10);
    // Save the resetToken to the user record in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: email.email },
    });

    // Construct reset link
    const resetUrl = `${SERVER_URL}/reset-password?token=${encodeURIComponent(email.email)}`;

    sendResetPasswordEmail({
      email: rowEmail,
      resetUrl,
    });

    return {
      success: true,
      message: 'Reset password email sent successfully',
    };
  } catch (error) {
    // Let redirect errors bubble up
    if (error instanceof Error && 'status' in error) {
      throw error;
    }

    return { success: false, message: (error as Error).message };
  }
  // Redirect user to a confirmation page
}

// reset user password
export async function resetPassword(prevState: unknown, formData: FormData) {
  try {
    const inputs = resetPasswordSchema.parse({
      token: formData.get('token'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const token = inputs?.token;

    // const plainPassword = inputs.password;

    inputs.password = hashSync(inputs.password, 10);

    const session = await auth();

    if (session) {
      // Check if the user is already logged in
      // Update the user's password and clear the resetToken
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: inputs.password, resetToken: null },
      });

      return { success: true, message: 'Password was changed' };
    }

    if (!token) {
      throw new Error('Token is required');
    }

    if (typeof token !== 'string') {
      throw new Error('Token is required');
    }

    if (token.length < 10) {
      throw new Error('Token is required');
    }

    // Find the user by resetToken
    const user = await prisma.user.findFirst({
      where: { resetToken: { equals: token } },
    });

    if (!user) throw new Error('Invalid or expired token');

    // Update the user's password and clear the resetToken
    await prisma.user.update({
      where: { id: user.id },
      data: { password: inputs.password, resetToken: null },
    });

    // send email to user
    sendPasswordChangedEmail({ userEmail: user.email, userName: user.name });

    return { success: true, message: 'Password was changed' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// get user by email

// get user by id
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });

  if (!user) throw new Error('User not found');
  return user;
}

// update user address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error('User not found');

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: { address },
    });

    return { success: true, message: 'Address updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
// create guest user
export async function createGuestWithAddress(data: ShippingAddress) {
  try {
    const parseData = shippingAddressSchema.parse(data);

    if (!parseData.guestEmail) {
      throw new Error('Guest email is required');
    }

    // check for cart cookie
    const cart = await getMyCart();
    if (!cart) throw new Error('Cart session not found');

    // Check if the guest user already exists
    const existingGuestUser = await prisma.guestUser.findUnique({
      where: { email: parseData.guestEmail },
    });

    if (existingGuestUser) {
      // If the guest user exists, update their address
      await prisma.guestUser.update({
        where: { id: existingGuestUser.id },
        data: { address: parseData, name: parseData.fullName },
      });

      await prisma.cart.update({
        where: { id: cart.id },
        data: { guestId: existingGuestUser.id },
      });

      return {
        success: true,
        message: 'Address updated successfully',
      };
    }

    const guestUser = await prisma.guestUser.create({
      data: {
        email: parseData.guestEmail,
        address: parseData,
        name: parseData.fullName,
      },
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: { guestId: guestUser.id },
    });

    return {
      success: true,
      message: 'Address updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update user payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: { paymentMethod: paymentMethod.type },
    });

    return { success: true, message: 'Payment method updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update guest user payment method
export async function updateGuestPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const cart = await getMyCart();
    if (!cart) throw new Error('Cart session not found');
    if (!cart.guestId) throw new Error('User email not found');

    const guestUser = await prisma.guestUser.findFirst({
      where: { id: cart.guestId },
    });

    if (!guestUser) throw new Error('Guest user not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.guestUser.update({
      where: { id: guestUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return { success: true, message: 'Payment method updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// get gust user by id
export async function getGuestUserById(guestId: string) {
  const user = await prisma.guestUser.findFirst({ where: { id: guestId } });

  if (!user) throw new Error('User not found');
  return user;
}

// update user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error('User not found');

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: { name: user.name },
    });

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ifo checkout
export async function userCheckoutInfo(
  userId: string | null,
  guestId: string | null
) {
  let paymentMethod: string | null = null;
  let address: ShippingAddress | null = null;
  let isSignIn = false;

  if (userId) {
    // logged-in user
    const user = await getUserById(userId);
    paymentMethod = user.paymentMethod ?? null;
    address = (user.address as ShippingAddress) ?? null;
    isSignIn = true;
  } else if (guestId) {
    // guest
    const guest = await getGuestUserById(guestId);
    paymentMethod = guest.paymentMethod ?? null;
    address = (guest.address as ShippingAddress) ?? null;
    isSignIn = false;
  }

  return { paymentMethod, address, isSignIn };
}

// get all the users

export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  // Query filter
  const queryFilter: Prisma.UserWhereInput =
    query && query !== 'all'
      ? {
          OR: [
            {
              email: {
                contains: query,
                mode: 'insensitive',
              } as Prisma.StringFilter,
            },
            {
              name: {
                contains: query,
                mode: 'insensitive',
              } as Prisma.StringFilter,
            },
          ],
        }
      : {};

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users');

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update a user

export async function editUser(user: z.infer<typeof editUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: user.name, role: user.role },
    });

    revalidatePath('/admin/users');

    return { success: true, message: 'User edited successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
