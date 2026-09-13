import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email.toLowerCase().trim()),
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          approved: user.approved,
          verified: user.verified,
          avatarUrl: user.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approved = user.approved;
        token.verified = user.verified;
        token.avatarUrl = user.avatarUrl;
      }
      // Refresh flags from DB on every request update trigger, so an
      // admin approving/verifying a member takes effect without forcing
      // that member to log out and back in.
      if (trigger === "update" || !user) {
        const fresh = await db.query.users.findFirst({
          where: eq(users.id, token.id as string),
        });
        if (fresh) {
          token.role = fresh.role;
          token.approved = fresh.approved;
          token.verified = fresh.verified;
          token.avatarUrl = fresh.avatarUrl ?? undefined;
          token.name = fresh.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.approved = token.approved;
        session.user.verified = token.verified;
        session.user.avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
};
