import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const EXTERNAL_JWT_SECRET = process.env.EXTERNAL_JWT_SECRET || "localsecret";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null;
        const rawIdentifier = credentials.emailOrUsername;
        const password = credentials.password;
        if (!rawIdentifier || !password) return null;

        const identifier = rawIdentifier.trim();
        if (!identifier) return null;

        // 1. ตรวจสอบตาราง Admins (KMUTT user role - รองรับทั้ง username และ email)
        const kmusers = await prisma.admins.findMany({
          where: {
            OR: [
              { username: identifier },
              { email: identifier }
            ]
          }
        });
        for (const kmuser of kmusers) {
          const isValid = await bcrypt.compare(password, kmuser.password_hash);
          if (isValid) {
            return {
              id: kmuser.id,
              role: "kmuser",
              adminRole: kmuser.role as "SUPER_ADMIN" | "ADMIN",
              name: kmuser.name,
              email: kmuser.email
            };
          }
        }

        // 2. ตรวจสอบตาราง Staffs (รองรับทั้ง username และ email)
        const staffs = await prisma.staffs.findMany({
          where: {
            OR: [
              { username: identifier },
              { email: identifier }
            ]
          }
        });
        for (const staff of staffs) {
          const isValid = await bcrypt.compare(password, staff.password_hash);
          if (isValid) {
            return {
              id: staff.id,
              role: "staff",
              name: staff.name,
              email: staff.email
            };
          }
        }

        // 3. ตรวจสอบตาราง Students (ครอบคลุม role: student, parent, teacher, guest)
        // รองรับ email, citizen_id, passport_id และ phone (ใช้ findMany เผื่อกรณีใช้เบอร์โทรหรือเลขบัตรซ้ำกันในครอบครัว)
        const students = await prisma.students.findMany({
          where: {
            OR: [
              { email: identifier },
              { citizen_id: identifier },
              { passport_id: identifier },
              { phone: identifier }
            ]
          }
        });

        // ให้ความสำคัญกับรายการที่ตรงกับ email ก่อนหากมีการค้นหาเจอหลายแถว
        students.sort((a, b) => {
          const aExactEmail = a.email.toLowerCase() === identifier.toLowerCase() ? 0 : 1;
          const bExactEmail = b.email.toLowerCase() === identifier.toLowerCase() ? 0 : 1;
          return aExactEmail - bExactEmail;
        });

        for (const student of students) {
          const isValid = await bcrypt.compare(password, student.password_hash);
          if (isValid) {
            return {
              id: student.id,
              role: student.role,
              name: `${student.first_name} ${student.last_name}`.trim(),
              email: student.email
            };
          }
        }

        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.role = user.role;
        token.adminRole = user.adminRole;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
        token.accessToken = jwt.sign(
          {
            id: Number(user.id),
            role: user.role,
            adminRole: user.adminRole,
            name: user.name,
            email: user.email,
          },
          EXTERNAL_JWT_SECRET,
          { expiresIn: "1d" }
        );
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.id);
        session.user.role = token.role as "student" | "staff" | "kmuser" | "parent" | "guest" | "teacher";
        session.user.adminRole = token.adminRole;
        session.user.name = (token.name as string) ?? null;
        session.user.email = (token.email as string) ?? null;
      }

      session.accessToken = token.accessToken as string;

      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

export default NextAuth(authOptions);
