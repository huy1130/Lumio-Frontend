/** Giải mã payload JWT (không verify — chỉ dùng server BFF với token từ client đã login). */
export function decodeJwtPayload(
  authorization: string | null,
): Record<string, unknown> | null {
  if (!authorization?.trim()) return null;
  try {
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readNumericClaim(
  payload: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!payload) return null;
  const raw = payload[key];
  if (raw == null) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** JWT payload.tenant_id — khớp users.tenant_id và shops.tenant_id khi POST /shops */
export function getTenantIdFromAuthHeader(
  authorization: string | null,
): number | null {
  return readNumericClaim(decodeJwtPayload(authorization), "tenant_id");
}

/** JWT payload.shop_id — users.shop_id (có thể null sau khi tạo shop) */
export function getShopIdFromAuthHeader(
  authorization: string | null,
): number | null {
  return readNumericClaim(decodeJwtPayload(authorization), "shop_id");
}
