"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Plus, Store } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { SetupShopForm } from "@/components/shop/SetupShopForm";
import { ShopDetailsCard } from "@/components/shop/ShopDetailsCard";
import { ShopQuotaBanner } from "@/components/shop/ShopQuotaBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getActiveShopId } from "@/lib/active-shop";
import { shouldShowShopSetup } from "@/lib/ensure-shop-setup";
import { bindActiveShopToUser } from "@/lib/shop-session";
import { resolveTenantShops } from "@/lib/resolve-tenant-shop";
import { pickPrimaryShop } from "@/lib/pick-primary-shop";
import { readPendingShop } from "@/lib/pending-shop";
import { shopService } from "@/lib/services/shopService";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/shop";
import type { ShopQuota } from "@/types/shop-quota";

export default function ShopPage() {
  return (
    <AccessGuard roles={["shop_owner"]}>
      <ShopPageContent />
    </AccessGuard>
  );
}

function ShopPageContent() {
  const router = useRouter();
  const { user, accessToken, setSession } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [quota, setQuota] = useState<ShopQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
      setLoadError(err instanceof Error ? err.message : "Không tải được cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, setSession]);

  const loadQuota = useCallback(async () => {
    setQuotaLoading(true);
    try {
      const q = await shopService.getQuota();
      setQuota(q);
    } catch {
      setQuota(null);
    } finally {
      setQuotaLoading(false);
    }
  }, []);

  useEffect(() => {
    syncShops();
    loadQuota();
  }, [syncShops, loadQuota]);

  const requiresSetup = user ? shouldShowShopSetup(user, shops.length) : true;
  const pending = readPendingShop();
  const activeId = user ? getActiveShopId(user.tenant_id) : null;
  const primaryShop = user ? pickPrimaryShop(shops, user) : shops[0] ?? null;
  const canAddMore = quota?.can_create_more ?? false;

  function handleShopCreated() {
    setShowAddForm(false);
    syncShops();
    loadQuota();
  }

  function handleUseShop(shop: Shop) {
    if (!accessToken || !user) return;
    setSession(accessToken, bindActiveShopToUser(user, shop));
    router.push("/dashboard");
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
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
        <ShopQuotaBanner quota={quota} loading={quotaLoading} />

        {loadError && shops.length === 0 ? (
          <p className="text-center text-sm text-red-500">{loadError}</p>
        ) : null}

        {requiresSetup ? (
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle>Thiết lập cửa hàng</CardTitle>
              <CardDescription>
                Chưa có cửa hàng. Tạo cửa hàng đầu tiên theo gói đăng ký của bạn.
                {pending?.shop_name ? (
                  <span className="mt-1 block text-indigo-600 dark:text-indigo-400">
                    Gợi ý từ đăng ký: {pending.shop_name}
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SetupShopForm
                onShopResolved={handleShopCreated}
                resetFormAfterCreate
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {shops.length >= 2 ? (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => router.push("/select-shop")}
              >
                Chọn cửa hàng khác để quản lý
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Cửa hàng của bạn</CardTitle>
                <CardDescription>
                  {shops.length} cửa hàng
                  {quota?.max_shops != null ? ` / tối đa ${quota.max_shops} theo gói` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {shops.map((shop) => {
                  const isManaging = shop.id === (activeId ?? primaryShop?.id);
                  return (
                    <div
                      key={shop.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                        isManaging
                          ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800"
                          : "border-gray-200 dark:border-gray-800",
                      )}
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {shop.shop_name}
                          {isManaging ? (
                            <span className="ml-2 text-xs font-medium text-indigo-600">
                              Đang quản lý
                            </span>
                          ) : null}
                        </p>
                        {shop.address ? (
                          <p className="text-xs text-gray-500">{shop.address}</p>
                        ) : null}
                      </div>
                      {!isManaging ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="shrink-0 rounded-lg"
                          onClick={() => handleUseShop(shop)}
                        >
                          Quản lý shop này
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {primaryShop ? (
              <ShopDetailsCard
                shop={primaryShop}
                shopId={user?.shop_id ?? primaryShop.id}
              />
            ) : null}

            {canAddMore ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thêm cửa hàng</CardTitle>
                  <CardDescription>
                    Gói cho phép tạo thêm cửa hàng. Mỗi cửa hàng quản lý riêng.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showAddForm ? (
                    <Button
                      type="button"
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo cửa hàng mới
                    </Button>
                  ) : (
                    <SetupShopForm
                      onShopResolved={handleShopCreated}
                      resetFormAfterCreate
                      onCancel={() => setShowAddForm(false)}
                    />
                  )}
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
