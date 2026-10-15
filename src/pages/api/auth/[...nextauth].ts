import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const EXTERNAL_JWT_SECRET = process.env.EXTERNAL_JWT_SECRET || "localsecret"; 

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<User | null> {
        if (!credentials) return null;
        const { emailOrUsername, password } = credentials;
        if (!emailOrUsername || !password) return null;

        // 1. ตรวจสอบตาราง Admins (KMUTT user role - รองรับทั้ง username และ email)
        const kmuser = await prisma.admins.findFirst({
          where: {
            OR: [
              { username: emailOrUsername },
              { email: emailOrUsername }
            ]
          }
        });
        if (kmuser) {
          const isValid = await bcrypt.compare(password, kmuser.password_hash);
          if (isValid) {
            return {
              id: kmuser.id,
              role: "kmuser",
              name: kmuser.name,
              email: kmuser.email
            };
          }
        }

        // 2. ตรวจสอบตาราง Students (รองรับ email และ citizen_id / phone)
        const student = await prisma.students.findFirst({
          where: {
            OR: [
              { email: emailOrUsername },
              { citizen_id: emailOrUsername },
              { phone: emailOrUsername }
            ]
          }
        });
        if (student) {
          const isValid = await bcrypt.compare(password, student.password_hash);
          if (isValid) {
            return {
              id: student.id,
              role: student.role,
              name: `${student.first_name} ${student.last_name}`,
              email: student.email
            };
          }
        }

        // 3. ตรวจสอบตาราง Staffs (รองรับทั้ง username และ email)
        const staff = await prisma.staffs.findFirst({
          where: {
            OR: [
              { username: emailOrUsername },
              { email: emailOrUsername }
            ]
          }
        });
        if (staff) {
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
      token.id = user.id;
      token.role = user.role;
      token.name = user.name;
      token.email = user.email;
      token.accessToken = jwt.sign(
        {
          id: user.id,
          role: user.role,
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
    session.user.id = token.id as number;
    session.user.role = token.role as "student" | "staff" | "kmuser" | "parent" | "guest" | "teacher";
    session.user.name = (token.name as string) ?? null;
    session.user.email = (token.email as string) ?? null;

    session.accessToken = token.accessToken as string;

    return session;
  }
},
  pages: {
    signIn: "/login"
  }
};

export default NextAuth(authOptions);
