import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND       = process.env.API_BACKEND_URL ?? "http://localhost:3000";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

/** Đảm bảo luôn trả về mảng (tránh crash filter ở client nếu backend bọc payload). */
function normalizeSubscriptionList(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (
    body &&
    typeof body === "object" &&
    Array.isArray((body as { data?: unknown }).data)
  ) {
    return (body as { data: unknown[] }).data;
  }
  return [];
}

export async function GET() {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (SERVICE_TOKEN) {
      headers["Authorization"] = `Bearer ${SERVICE_TOKEN}`;
    }

    const cacheHeaders = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    };

    // Try public endpoint first; fall back to full list if needed
    const publicRes = await fetch(`${BACKEND}/subscriptions/public`, {
      headers,
      next: { revalidate: 60 },
    });

    if (publicRes.ok) {
      const raw = await publicRes.json();
      return NextResponse.json(normalizeSubscriptionList(raw), {
        headers: cacheHeaders,
      });
    }

    // If public endpoint fails, fall back to the main subscriptions list
    const fallbackRes = await fetch(`${BACKEND}/subscriptions`, {
      headers,
      next: { revalidate: 60 },
    });

    if (fallbackRes.ok) {
      const raw = await fallbackRes.json();
      return NextResponse.json(normalizeSubscriptionList(raw), {
        headers: cacheHeaders,
      });
    }

    return NextResponse.json([]);
  } catch (err) {
    console.error("[public/subscriptions] error:", err);
    return NextResponse.json([]);
  }
}
