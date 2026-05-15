"use client";

import { MapPin, Phone, Store, Hash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Shop } from "@/types/shop";

interface ShopDetailsCardProps {
  shop: Shop | null;
  shopId?: number | null;
}

export function ShopDetailsCard({ shop, shopId }: ShopDetailsCardProps) {
  const resolvedId =
    shopId && shopId > 0 ? shopId : shop?.id && shop.id > 0 ? shop.id : null;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Store className="h-6 w-6" />
            </div>
            <CardTitle>{shop?.shop_name ?? "Cửa hàng của bạn"}</CardTitle>
            <CardDescription>
              Thông tin cửa hàng gắn với tài khoản shop owner
            </CardDescription>
          </div>
          <Badge variant={shop?.is_active !== false ? "default" : "secondary"}>
            {shop?.is_active !== false ? "Đang hoạt động" : "Tạm dừng"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm">
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
            <Hash className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-500">Mã cửa hàng</dt>
              <dd className="font-mono font-medium">
                {resolvedId ?? "—"}
              </dd>
            </div>
          </div>
          {shop?.address ? (
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-500">Địa chỉ</dt>
                <dd className="font-medium">{shop.address}</dd>
              </div>
            </div>
          ) : null}
          {shop?.phone ? (
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
              <Phone className="h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-500">Số điện thoại</dt>
                <dd className="font-medium">{shop.phone}</dd>
              </div>
            </div>
          ) : null}
        </dl>
        {!resolvedId && shop ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Không lấy được mã cửa hàng. Kiểm tra kết nối DATABASE_URL trên frontend.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
