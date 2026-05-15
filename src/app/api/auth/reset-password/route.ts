import { NextRequest } from "next/server";
import { forwardAuthPost } from "../_utils";

export async function POST(request: NextRequest) {
  return forwardAuthPost(
    request,
    "/auth/reset-password",
    "Failed to reset password",
  );
}
