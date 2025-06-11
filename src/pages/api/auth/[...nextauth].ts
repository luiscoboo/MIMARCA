import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/src/lib/db';
import type { User } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt', // Evita problemas con sesiones en Vercel
  },

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // IMPORTANTE en producción
      },
    },
  },

  callbacks: {
    async signIn({ user }: { user: User }) {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [user.email]);
      if ((rows as any[]).length === 0) {
        await db.query(
          'INSERT INTO users (email, name, image) VALUES (?, ?, ?)',
          [user.email, user.name, user.image]
        );
      }
      return true;
    },
  },
};

export default NextAuth(authOptions);
