import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

function normalizeMessage(body: unknown): string | undefined {
  const message = (body as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return undefined;
}

export async function forwardAuthPost(
  request: NextRequest,
  targetPath: string,
  fallbackMessage: string,
) {
  try {
    const body = await request.json().catch(() => ({}));

    const response = await fetch(`${BACKEND_URL}${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

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
    console.error(`[auth proxy] ${targetPath} error:`, error);
    return NextResponse.json(
      { message: "Unable to connect to authentication server" },
      { status: 502 },
    );
  }
}
