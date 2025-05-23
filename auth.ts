import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import { authConfig } from './auth.config';
import { cookies } from 'next/headers';

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter({ prisma }),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // find user in db
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });

        // check if user exists and password is correct
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          // if password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            } as any;
          }

          // if password is incorrect, return null
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user, trigger }: any) {
      // set user id from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      // if there is a update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }
      return session;
    },

    async jwt({ token, user, trigger, session }: any) {
      // assign user field to token
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // if user has no name then use email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // update database to reflect token name

          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      // handle session update

      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },

    ...authConfig.callbacks,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
