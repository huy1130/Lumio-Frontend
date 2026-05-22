import { NextRequest, NextResponse } from "next/server";
import { applyRoleCookie } from "@/lib/auth-cookies";
import type { Role } from "@/lib/roles";

const VALID_ROLES: Role[] = [
  "admin",
  "shop_owner",
  "inventory_staff",
  "cashier",
  "user",
];

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    role?: Role | null;
  };

  const role = body.role ?? null;
  if (role !== null && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  return applyRoleCookie(response, role);
}
