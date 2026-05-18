import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

function normalizeMessage(body: unknown): string | undefined {
  const message = (body as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string") return message;
  return undefined;
}

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (SERVICE_TOKEN) {
      headers.Authorization = `Bearer ${SERVICE_TOKEN}`;
    }

    const response = await fetch(`${BACKEND_URL}/tenants`, {
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ([]));

    if (!response.ok) {
      return NextResponse.json(
        {
          ...(typeof data === "object" && data !== null ? data : {}),
          message: normalizeMessage(data) ?? "Không thể tải danh sách tenant",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[tenants proxy] error:", error);
    return NextResponse.json(
      { message: "Không thể kết nối đến máy chủ" },
      { status: 502 },
    );
  }
}
