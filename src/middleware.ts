import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readRoleFromCookieHeader } from "@/lib/auth-cookies";
import {
  isPathAllowedForRestrictedRole,
  isRoleRestrictedFromPublic,
} from "@/lib/role-route-access";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const role = readRoleFromCookieHeader(request.headers.get("cookie"));

  if (!role || !isRoleRestrictedFromPublic(role)) {
    return NextResponse.next();
  }

  if (isPathAllowedForRestrictedRole(role, pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
