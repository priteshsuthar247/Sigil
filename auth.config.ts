import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordChangedAt: user.passwordChangedAt,
        };
      },
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      const IDLE_LIMIT_MS = 8 * 60 * 60 * 1000; // 8 hours
      if (user) {
        token.id = user.id;
        token.lastSeen = Date.now();
        token.passwordChangedAt = (user as any).passwordChangedAt ? new Date((user as any).passwordChangedAt).getTime() : null;
        token.iat = Math.floor(Date.now() / 1000);
      }
      if (token.id) {
        // Invalidate session if password was changed after token issued
        const [dbUser] = await db
          .select({ passwordChangedAt: users.passwordChangedAt })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);
        if (dbUser?.passwordChangedAt && token.iat) {
          const pwChangedSec = Math.floor(new Date(dbUser.passwordChangedAt).getTime() / 1000);
          // If password was changed after token was issued, invalidate
          if (pwChangedSec > token.iat) {
            return null;
          }
          // Keep token in sync with latest passwordChangedAt
          token.passwordChangedAt = new Date(dbUser.passwordChangedAt).getTime();
        }
      }
      if (token.lastSeen) {
        const lastSeen = typeof token.lastSeen === 'number' ? token.lastSeen : Number(token.lastSeen);
        if (Date.now() - lastSeen > IDLE_LIMIT_MS) {
          return null;
        }
        token.lastSeen = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
