import { NextRequest } from "next/server";
import { proxyCustomerRequest } from "../_utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return proxyCustomerRequest({
    method: "GET",
    path: `/customers/${id}`,
    fallbackMessage: "Không thể tải thông tin khách hàng",
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  return proxyCustomerRequest({
    method: "PATCH",
    path: `/customers/${id}`,
    body,
    fallbackMessage: "Không thể cập nhật khách hàng",
  });
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return proxyCustomerRequest({
    method: "DELETE",
    path: `/customers/${id}`,
    fallbackMessage: "Không thể xoá khách hàng",
  });
}
