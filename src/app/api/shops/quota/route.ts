import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getTenantIdFromAuthHeader } from "@/lib/jwt-decode";
import type { ShopQuota } from "@/types/shop-quota";

/**
 * BFF: quota tạo shop theo gói — khớp FeatureValidationService (MAX_SHOPS).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const tenantId = getTenantIdFromAuthHeader(authHeader);

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

    const countRows = await sql`
      SELECT COUNT(*)::int AS cnt
      FROM shops
      WHERE tenant_id = ${tenantId}
        AND is_active = true
    `;
    const current_count = Number(countRows[0]?.cnt ?? 0);

    const subRows = await sql`
      SELECT ts.subscription_id, s.package_code
      FROM tenant_subscriptions ts
      INNER JOIN subscriptions s ON s.id = ts.subscription_id
      WHERE ts.tenant_id = ${tenantId}
        AND ts.is_expired = false
        AND (ts.end_date IS NULL OR ts.end_date > NOW())
      ORDER BY ts.end_date DESC NULLS LAST
      LIMIT 1
    `;

    if (subRows.length === 0) {
      const body: ShopQuota = {
        current_count,
        max_shops: null,
        can_create_more: false,
        package_code: null,
      };
      return NextResponse.json(body);
    }

    const subscription_id = Number(subRows[0].subscription_id);
    const package_code =
      subRows[0].package_code != null ? String(subRows[0].package_code) : null;

    const limitRows = await sql`
      SELECT sf.limit_value
      FROM subscription_features sf
      INNER JOIN features f ON f.id = sf.feature_id
      WHERE sf.subscription_id = ${subscription_id}
        AND f.feature_code = 'MAX_SHOPS'
      LIMIT 1
    `;

    const rawLimit = limitRows[0]?.limit_value;
    const max_shops =
      rawLimit != null && Number.isFinite(Number(rawLimit))
        ? Number(rawLimit)
        : null;

    const can_create_more =
      max_shops != null && max_shops > 0 && current_count < max_shops;

    const body: ShopQuota = {
      current_count,
      max_shops,
      can_create_more,
      package_code,
    };

    return NextResponse.json(body);
  } catch (error) {
    console.error("[api/shops/quota]", error);
    return NextResponse.json(
      { message: "Không thể tải hạn mức cửa hàng" },
      { status: 500 },
    );
  }
}
