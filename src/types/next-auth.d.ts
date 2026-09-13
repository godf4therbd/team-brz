import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MEMBER";
      approved: boolean;
      verified: boolean;
      avatarUrl?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "MEMBER";
    approved: boolean;
    verified: boolean;
    avatarUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "MEMBER";
    approved: boolean;
    verified: boolean;
    avatarUrl?: string;
  }
}
