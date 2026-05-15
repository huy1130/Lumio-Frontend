import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {
  getShopIdFromAuthHeader,
  getTenantIdFromAuthHeader,
} from "@/lib/jwt-decode";
import type { Shop } from "@/types/shop";

/**
 * BFF: shops của shop owner = rows có shops.tenant_id = JWT.tenant_id
 * (cùng quy tắc Nest POST /shops gắn tenant_id từ token).
 * Nếu JWT có shop_id thì ưu tiên đúng cửa hàng đó.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const tenantId = getTenantIdFromAuthHeader(authHeader);
  const shopId = getShopIdFromAuthHeader(authHeader);

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
    const rows =
      shopId != null
        ? await sql`
            SELECT
              id,
              tenant_id,
              shop_name,
              address,
              phone,
              is_active,
              created_at,
              update_at
            FROM shops
            WHERE tenant_id = ${tenantId}
              AND id = ${shopId}
              AND is_active = true
            LIMIT 1
          `
        : await sql`
            SELECT
              id,
              tenant_id,
              shop_name,
              address,
              phone,
              is_active,
              created_at,
              update_at
            FROM shops
            WHERE tenant_id = ${tenantId}
              AND is_active = true
            ORDER BY id ASC
          `;

    const shops: Shop[] = rows.map((row) => ({
      id: Number(row.id),
      tenant_id: Number(row.tenant_id),
      shop_name: String(row.shop_name),
      address: row.address != null ? String(row.address) : null,
      phone: row.phone != null ? String(row.phone) : null,
      is_active: Boolean(row.is_active),
      created_at: new Date(row.created_at as string).toISOString(),
      update_at: new Date(row.update_at as string).toISOString(),
    }));

    return NextResponse.json(shops);
  } catch (error) {
    console.error("[api/shops/mine]", error);
    return NextResponse.json(
      { message: "Không thể tải danh sách cửa hàng" },
      { status: 500 },
    );
  }
}
