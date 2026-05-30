import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function normalizeNestMessage(body: unknown): string | undefined {
  const msg = (body as { message?: string | string[] })?.message;
  if (Array.isArray(msg)) return msg.join(" ");
  if (typeof msg === "string") return msg;
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Yêu cầu đăng nhập để gia hạn gói" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/subscriptions/purchase/renew/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        normalizeNestMessage(data) ?? "Không thể khởi tạo thanh toán gia hạn";
      return NextResponse.json({ ...data, message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[checkout/renew/initiate] error:", error);
    return NextResponse.json(
      { message: "Không thể kết nối đến máy chủ" },
      { status: 502 },
    );
  }
}
