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

        if (!user.emailVerified) {
          // A distinct message (rather than returning null, which NextAuth
          // reports as the generic "CredentialsSignin") so the login page
          // can tell this apart from a wrong password and point the person
          // at their inbox instead.
          throw new Error("EMAIL_NOT_VERIFIED");
        }

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
        token.refreshedAt = Date.now();
        return token;
      }

      // `user` is only set on the initial sign-in — every other call here
      // (one per request that reads the session) previously had `!user`
      // true unconditionally, so it hit the database on every single
      // request. Instead, refresh from the DB immediately when an admin
      // action calls `update()` (so approving/verifying a member takes
      // effect without forcing a logout), and otherwise at most once per
      // refresh window so ordinary page loads reuse the token.
      const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
      const refreshedAt = (token.refreshedAt as number | undefined) ?? 0;
      const needsRefresh =
        trigger === "update" || Date.now() - refreshedAt > REFRESH_INTERVAL_MS;

      if (needsRefresh) {
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
        token.refreshedAt = Date.now();
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
