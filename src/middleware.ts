import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (req.nextUrl.pathname.startsWith("/app")) {
      if (token?.role !== "student") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (req.nextUrl.pathname.startsWith("/app/e-certificate")) {
        return NextResponse.redirect(new URL("/app/dashboard", req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/staff")) {
      if (token?.role !== "staff") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/_km")) {
      if (token?.role !== "kmuser") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/guest")) {
      if (token?.role !== "guest" && token?.role !== "parent" && token?.role !== "teacher") {
        return NextResponse.redirect(new URL("/login", req.url));
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
  matcher: ["/app/:path*", "/staff/:path*", "/_km/:path*", "/guest/:path*"],
};
