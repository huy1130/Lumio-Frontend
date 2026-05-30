import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

/** NestJS thường trả `message` là string hoặc mảng (class-validator). */
function normalizeNestMessage(body: unknown): string | undefined {
  const msg = (body as { message?: string | string[] })?.message;
  if (Array.isArray(msg)) return msg.join(" ");
  if (typeof msg === "string") return msg;
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Nest: SubscriptionPurchaseController @Controller('subscriptions/purchase') + @Post('initiate')
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (SERVICE_TOKEN) headers.Authorization = `Bearer ${SERVICE_TOKEN}`;

    const response = await fetch(`${BACKEND_URL}/subscriptions/purchase/initiate`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        normalizeNestMessage(data) ?? "Không thể khởi tạo thanh toán";
      return NextResponse.json({ ...data, message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[checkout/initiate] error:", error);
    return NextResponse.json(
      { message: "Không thể kết nối đến máy chủ" },
      { status: 502 }
    );
  }
}
