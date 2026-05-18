import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getTenantIdFromAuthHeader } from "@/lib/jwt-decode";
import type { TenantSubscriptionInfo } from "@/types/tenant-subscription";

export async function GET(request: NextRequest) {
  const tenantId = getTenantIdFromAuthHeader(
    request.headers.get("authorization"),
  );

  if (tenantId == null) {
    return NextResponse.json(
      { message: "Không xác định được tenant từ token" },
      { status: 401 },
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      {
        message:
          "Thiếu DATABASE_URL trên frontend. Thêm cùng connection string với backend vào lumio-fe/.env",
      },
      { status: 503 },
    );
  }

  try {
    const sql = neon(databaseUrl);

    const tenantRows = await sql`
      SELECT id, tenant_name, is_active
      FROM tenants
      WHERE id = ${tenantId}
      LIMIT 1
    `;

    if (tenantRows.length === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy tenant" },
        { status: 404 },
      );
    }

    const tenant = tenantRows[0];

    const subRows = await sql`
      SELECT
        ts.subscription_id,
        ts.start_date,
        ts.end_date,
        ts.is_expired,
        ts.number_of_renewals,
        s.package_code,
        s.description,
        s.price,
        s.billing_cycle
      FROM tenant_subscriptions ts
      INNER JOIN subscriptions s ON s.id = ts.subscription_id
      WHERE ts.tenant_id = ${tenantId}
      ORDER BY ts.end_date DESC NULLS LAST, ts.id DESC
      LIMIT 1
    `;

    const sub = subRows[0];

    const body: TenantSubscriptionInfo = {
      tenant_id: Number(tenant.id),
      tenant_name: String(tenant.tenant_name),
      tenant_is_active: Boolean(tenant.is_active),
      subscription_id: sub ? Number(sub.subscription_id) : null,
      package_code: sub?.package_code != null ? String(sub.package_code) : null,
      description:
        sub?.description != null ? String(sub.description) : null,
      price:
        sub?.price != null && Number.isFinite(Number(sub.price))
          ? Number(sub.price)
          : null,
      billing_cycle:
        sub?.billing_cycle != null ? String(sub.billing_cycle) : null,
      start_date: sub?.start_date
        ? new Date(sub.start_date as string).toISOString()
        : null,
      end_date: sub?.end_date
        ? new Date(sub.end_date as string).toISOString()
        : null,
      is_expired: sub ? Boolean(sub.is_expired) : true,
      number_of_renewals:
        sub?.number_of_renewals != null
          ? Number(sub.number_of_renewals)
          : null,
    };

    return NextResponse.json(body);
  } catch (error) {
    console.error("[api/tenant/subscription]", error);
    return NextResponse.json(
      { message: "Không thể tải thông tin gói đăng ký" },
      { status: 500 },
    );
  }
}
