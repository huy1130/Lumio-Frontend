import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

type RouteContext = { params: { orderCode: string } };

export async function GET(_req: Request, context: RouteContext) {
  const orderCode = context.params.orderCode;
  if (!orderCode) {
    return NextResponse.json({ message: "Thiếu orderCode" }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {};
    if (SERVICE_TOKEN) {
      headers["Authorization"] = `Bearer ${SERVICE_TOKEN}`;
    }

    const res = await fetch(
      `${BACKEND}/subscriptions/purchase/status/${encodeURIComponent(orderCode)}`,
      { headers, cache: "no-store" }
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[purchase/status] error:", e);
    return NextResponse.json(
      { message: "Không thể kết nối đến máy chủ" },
      { status: 502 }
    );
  }
}
