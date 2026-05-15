import { NextRequest } from "next/server";
import { forwardAuthPost } from "../../_utils";

export async function POST(request: NextRequest) {
  return forwardAuthPost(request, "/admins/login", "Admin login failed");
}
