"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Plus, Store } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { SetupShopForm } from "@/components/shop/SetupShopForm";
import { ShopDetailsCard } from "@/components/shop/ShopDetailsCard";
import { ShopQuotaBanner } from "@/components/shop/ShopQuotaBanner";
import { ShopOwnerSubscriptionCard } from "@/components/tenant/ShopOwnerSubscriptionCard";
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

export default function SettingsPage() {
  const { role } = useAuth();
  
  return (
    <AccessGuard roles={["shop_owner", "admin", "inventory_staff", "cashier"]}>
      <SettingsPageContent role={role as string} />
    </AccessGuard>
  );
}

function SettingsPageContent({ role }: { role: string }) {
  const router = useRouter();
  const { user, accessToken, setSession } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [quota, setQuota] = useState<ShopQuota | null>(null);
  const [loading, setLoading] = useState(role === "shop_owner");
  const [quotaLoading, setQuotaLoading] = useState(role === "shop_owner");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"subscription" | "shops">("subscription");

  const isShopOwner = role === "shop_owner";

  const syncShops = useCallback(async () => {
    if (!user || !isShopOwner) return;
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
  }, [user, accessToken, setSession, isShopOwner]);

  const loadQuota = useCallback(async () => {
    if (!isShopOwner) return;
    setQuotaLoading(true);
    try {
      const q = await shopService.getQuota();
      setQuota(q);
    } catch {
      setQuota(null);
    } finally {
      setQuotaLoading(false);
    }
  }, [isShopOwner]);

  useEffect(() => {
    syncShops();
    loadQuota();
  }, [syncShops, loadQuota]);

  const requiresSetup = user && isShopOwner ? shouldShowShopSetup(user, shops.length) : false;
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="px-6 pt-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-1">Cài đặt</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {isShopOwner
            ? "Quản lý gói đăng ký và hệ thống chi nhánh của bạn."
            : "Các tùy chọn cài đặt theo vai trò."}
        </p>

        {isShopOwner && (
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("subscription")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "subscription"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Gói đăng ký
            </button>
            <button
              onClick={() => setActiveTab("shops")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "shops"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Hệ thống chi nhánh
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-2xl space-y-6">
        {isShopOwner ? (
          <>

            {activeTab === "subscription" && (
              <div className="space-y-6">
                <ShopOwnerSubscriptionCard />
                <ShopQuotaBanner quota={quota} loading={quotaLoading} />
              </div>
            )}

            {activeTab === "shops" && (
              <div className="space-y-6">
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
                  <div className="space-y-6">
                    {shops.length >= 2 ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl mb-4"
                        onClick={() => router.push("/select-shop")}
                      >
                        Chọn cửa hàng khác để quản lý
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : null}

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Danh sách Cửa hàng</CardTitle>
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
                                  Quản lý
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
                      <Card className="mt-6">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Thêm cửa hàng</CardTitle>
                          <CardDescription>
                            Gói cho phép tạo thêm cửa hàng. Mỗi cửa hàng quản lý doanh thu và nhân sự riêng.
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
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Chưa có cài đặt</CardTitle>
              <CardDescription>
                Hiện chưa có mục cài đặt nào được cấp cho tài khoản của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vui lòng liên hệ chủ cửa hàng nếu bạn cần thay đổi thông tin hệ thống.
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
