import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_BACKEND_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/checkout/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
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
