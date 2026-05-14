import { NextRequest, NextResponse } from "next/server";

const BACKEND   = process.env.API_BACKEND_URL        ?? "http://localhost:3000";
const SVC_EMAIL = process.env.ADMIN_SERVICE_EMAIL    ?? "";
const SVC_PASS  = process.env.ADMIN_SERVICE_PASSWORD ?? "";

// In-memory service token cache
let cachedToken = "";
let tokenExpiry  = 0;

async function getServiceToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${BACKEND}/admins/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email: SVC_EMAIL, password: SVC_PASS }),
    cache:   "no-store",
  });

  if (!res.ok) throw new Error("Service auth failed");

  const data      = await res.json();
  cachedToken     = data.accessToken as string;
  tokenExpiry     = Date.now() + 14 * 60 * 1000; // refresh 1 min trước khi hết hạn 15m
  return cachedToken;
}

async function fetchActiveSubscriptions(token: string) {
  const res = await fetch(`${BACKEND}/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const all = await res.json();
  return (all as Array<{ is_active: boolean }>).filter((s) => s.is_active);
}

export async function GET(req: NextRequest) {
  // ── Ưu tiên 1: token do pricing page forward lên (admin đang login) ─────────
  const clientAuth = req.headers.get("authorization");
  if (clientAuth) {
    try {
      const data = await fetchActiveSubscriptions(clientAuth.replace("Bearer ", ""));
      return NextResponse.json(data, {
        headers: { "Cache-Control": "private, max-age=30" },
      });
    } catch {
      // token hết hạn hoặc không hợp lệ → thử service credentials
    }
  }

  // ── Ưu tiên 2: service credentials trong .env (cho visitor chưa login) ──────
  if (SVC_EMAIL && SVC_PASS) {
    try {
      const token = await getServiceToken();
      const data  = await fetchActiveSubscriptions(token);
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      });
    } catch (err) {
      console.error("[public/subscriptions] service auth error:", err);
    }
  }

  // ── Fallback: trả về rỗng → pricing page dùng mock ─────────────────────────
  return NextResponse.json([]);
}
