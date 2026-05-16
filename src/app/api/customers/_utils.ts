import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

type ProxyMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ProxyOptions = {
  method: ProxyMethod;
  path: string;
  fallbackMessage: string;
  body?: unknown;
};

const NO_BODY_STATUSES = new Set([204, 205, 304]);

function normalizeMessage(body: unknown): string | undefined {
  const message = (body as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string") return message;
  return undefined;
}

export async function proxyCustomerRequest({
  method,
  path,
  fallbackMessage,
  body,
}: ProxyOptions) {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (SERVICE_TOKEN) {
      headers.Authorization = `Bearer ${SERVICE_TOKEN}`;
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (NO_BODY_STATUSES.has(response.status)) {
      return new NextResponse(null, { status: response.status });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          ...(typeof data === "object" && data !== null ? data : {}),
          message: normalizeMessage(data) ?? fallbackMessage,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[customers proxy] ${method} ${path} error:`, error);
    return NextResponse.json({ message: "Không thể kết nối đến máy chủ" }, { status: 502 });
  }
}
