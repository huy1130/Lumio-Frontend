import { NextResponse } from "next/server";
import { applyRoleCookie } from "@/lib/auth-cookies";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return applyRoleCookie(response, null);
}
