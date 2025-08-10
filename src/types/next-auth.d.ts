import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
      instruments?: string[];
      avatar?: string | null;
      churchId?: string;
      churchName?: string;
      churchCity?: string;
      isApproved?: boolean;
    };
  }

  interface User {
    role?: UserRole;
    instruments?: string[];
    avatar?: string | null;
    churchId?: string;
    churchName?: string;
    churchCity?: string;
    isApproved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    instruments?: string[];
    avatar?: string | null;
    churchId?: string;
    churchName?: string;
    churchCity?: string;
  }
}