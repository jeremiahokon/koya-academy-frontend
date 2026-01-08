import type { NextAuthOptions, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { URLS } from './constant';

interface CustomUser extends User {
  token?: string;
  expires?: string;
  refreshToken?: string;
}

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'signin',
      name: 'Sign In',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials) {
          return null;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: CustomUser }) {
      if (user) {
        return {
          ...token,
          accessToken: user.token,
          refreshToken: user.refreshToken,
          email: user.email,
        };
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<CustomSession> {
      const customSession = session as CustomSession;

      return {
        ...customSession,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        user: {
          ...session.user,
          email: token.email as string,
        },
      };
    },
  },
  pages: {
    signIn: URLS.SIGN_IN,
    error: URLS.SIGN_IN, // Redirect to sign-in page on error
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
