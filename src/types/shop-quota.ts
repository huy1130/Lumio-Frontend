/** BFF GET /api/shops/quota — giới hạn MAX_SHOPS theo gói subscription active của tenant */
export interface ShopQuota {
  current_count: number;
  max_shops: number | null;
  can_create_more: boolean;
  package_code: string | null;
}
