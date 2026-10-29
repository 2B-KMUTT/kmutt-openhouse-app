import { DefaultSession, DefaultUser } from "next-auth";

export type AppRole = "student" | "staff" | "kmuser" | "parent" | "guest" | "teacher";
export type AdminRole = "SUPER_ADMIN" | "ADMIN";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: number;
    role: AppRole;
    adminRole?: AdminRole;
  }

  interface Session {
    user: User & DefaultSession["user"] & {
      adminRole?: AdminRole;
    };
    accessToken?: string;
  }

  interface JWT {
    id: number;
    role: AppRole;
    adminRole?: AdminRole;
    name?: string;
    email?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: AppRole;
    adminRole?: AdminRole;
    name?: string;
    email?: string;
    accessToken?: string;
  }
}
