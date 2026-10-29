import { DefaultSession, DefaultUser } from "next-auth";

export type AppRole = "student" | "staff" | "kmuser" | "parent" | "guest" | "teacher";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: number;
    role: AppRole;
  }

  interface Session {
    user: User & DefaultSession["user"];
    accessToken?: string;
  }

  interface JWT {
    id: number;
    role: AppRole;
    name?: string;
    email?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: AppRole;
    name?: string;
    email?: string;
    accessToken?: string;
  }
}
