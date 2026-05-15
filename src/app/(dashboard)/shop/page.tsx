"use client";

import { useCallback, useEffect, useState } from "react";
import { Store, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { SetupShopForm } from "@/components/shop/SetupShopForm";
import { ShopDetailsCard } from "@/components/shop/ShopDetailsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { shouldShowShopSetup } from "@/lib/ensure-shop-setup";
import { resolveTenantShops } from "@/lib/resolve-tenant-shop";
import { getStoredShopForTenant } from "@/lib/shop-storage";
import { pickPrimaryShop } from "@/lib/pick-primary-shop";
import { readPendingShop } from "@/lib/pending-shop";
import type { Shop } from "@/types/shop";

export default function ShopPage() {
  return (
    <AccessGuard roles={["shop_owner"]}>
      <ShopPageContent />
    </AccessGuard>
  );
}

function ShopPageContent() {
  const { user, accessToken, setSession } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const syncShops = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await resolveTenantShops(user);
      setShops(result.shops);
      if (accessToken && result.user.shop_id !== user.shop_id) {
        setSession(accessToken, result.user);
      }
    } catch (err) {
      const stored = user ? getStoredShopForTenant(user.tenant_id) : null;
      if (stored) setShops([stored]);
      setLoadError(err instanceof Error ? err.message : "Không tải được cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, setSession]);

  useEffect(() => {
    syncShops();
  }, [syncShops]);

  const primaryShop =
    (user ? pickPrimaryShop(shops, user) : shops[0]) ??
    (user ? getStoredShopForTenant(user.tenant_id) : null);
  const requiresSetup = user ? shouldShowShopSetup(user, shops.length) : true;
  const pending = readPendingShop();

  function handleShopResolved() {
    syncShops();
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500">Đang tải cửa hàng…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex-1 space-y-6 p-6">
        {loadError && !primaryShop ? (
          <p className="text-center text-sm text-red-500">{loadError}</p>
        ) : null}

        {requiresSetup ? (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle>Thiết lập cửa hàng</CardTitle>
              <CardDescription>
                Chưa có cửa hàng cho tenant của bạn. Điền thông tin để tạo cửa hàng đầu tiên.
                {pending?.shop_name ? (
                  <span className="mt-1 block text-indigo-600 dark:text-indigo-400">
                    Gợi ý từ đăng ký: {pending.shop_name}
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SetupShopForm onShopResolved={handleShopResolved} />
            </CardContent>
          </Card>
        ) : (
          <>
            <ShopDetailsCard
              shop={primaryShop}
              shopId={user?.shop_id ?? primaryShop?.id}
            />
            {shops.length > 1 ? (
              <p className="mx-auto max-w-2xl text-center text-xs text-gray-500">
                Tenant của bạn có {shops.length} cửa hàng. Đang hiển thị cửa hàng đầu tiên.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
