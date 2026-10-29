import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth";

const secret = process.env.NEXTAUTH_SECRET;

export type Role = "student" | "staff" | "admin" | "kmuser" | "parent" | "guest" | "teacher";
export type AdminRole = "SUPER_ADMIN" | "ADMIN";

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: number;
    role: Role;
    adminRole?: AdminRole;
    name?: string;
    email?: string;
    accessToken?: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => void | Promise<void>,
  allowedRoles: Role[] = []
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = (await getToken({ req, secret })) as JWT | null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(token.role)) {
      return res.status(403).json({ error: `Forbidden: Requires ${allowedRoles.join(", ")}` });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      id: token.id,
      role: token.role,
      adminRole: token.adminRole,
      name: token.name,
      email: token.email,
      accessToken: token.accessToken
    };

    return handler(authReq, res);
  };
}
