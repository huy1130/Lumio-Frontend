import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function normalizeNestMessage(body: unknown): string | undefined {
  const msg = (body as { message?: string | string[] })?.message;
  if (Array.isArray(msg)) return msg.join(" ");
  if (typeof msg === "string") return msg;
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderCode = (body as { orderCode?: string }).orderCode;
    if (!orderCode) {
      return NextResponse.json({ message: "Thiếu orderCode" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND}/subscriptions/purchase/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = normalizeNestMessage(data) ?? "Không xác nhận được thanh toán";
      return NextResponse.json({ ...data, message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[purchase/confirm] error:", e);
    return NextResponse.json(
      { message: "Không thể kết nối đến máy chủ" },
      { status: 502 },
    );
  }
}
