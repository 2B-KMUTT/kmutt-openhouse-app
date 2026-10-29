import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function getDashboardByRole(role?: string): string {
  switch (role) {
    case "student":
      return "/app/dashboard";
    case "guest":
    case "parent":
    case "teacher":
      return "/guest/dashboard";
    case "staff":
      return "/staff/dashboard";
    case "kmuser":
      return "/_km/dashboard";
    default:
      return "/login";
  }
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;

    if (req.nextUrl.pathname.startsWith("/app")) {
      if (role !== "student") {
        return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
      }
      if (req.nextUrl.pathname.startsWith("/app/e-certificate")) {
        return NextResponse.redirect(new URL("/app/dashboard", req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/staff")) {
      if (role !== "staff") {
        return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/_km")) {
      if (role !== "kmuser") {
        return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/guest")) {
      if (role !== "guest" && role !== "parent" && role !== "teacher") {
        return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/survey-report")) {
      if (role !== "kmuser") {
        return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/app/:path*", "/staff/:path*", "/_km/:path*", "/guest/:path*", "/survey-report"],
};
