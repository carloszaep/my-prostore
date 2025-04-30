'use server';

import {
  editUserSchema,
  forgotPasswordSchema,
  paymentMethodSchema,
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
import { PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { sendResetPasswordEmail } from '@/email';

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
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { resetToken: email.email },
    // });

    // Construct reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${encodeURIComponent(email.email)}`;

    sendResetPasswordEmail({
      email: rowEmail,
      resetUrl,
    });

    // Redirect user to a confirmation page
    redirect('/reset-email-sent');
  } catch (error) {
    // Let redirect errors bubble up
    if (error instanceof Error && 'status' in error) {
      throw error;
    }

    return { success: false, message: (error as Error).message };
  }
}

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
