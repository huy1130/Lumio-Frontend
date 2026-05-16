import { NextRequest } from "next/server";
import { proxyCustomerRequest } from "./_utils";

export async function GET() {
  return proxyCustomerRequest({
    method: "GET",
    path: "/customers",
    fallbackMessage: "Không thể tải danh sách khách hàng",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return proxyCustomerRequest({
    method: "POST",
    path: "/customers",
    body,
    fallbackMessage: "Không thể tạo khách hàng",
  });
}
