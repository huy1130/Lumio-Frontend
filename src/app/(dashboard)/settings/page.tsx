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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "shops") {
        setActiveTab("shops");
      }
    }
  }, []);

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

  useEffect(() => {
    if (!loading && requiresSetup && activeTab !== "shops") {
      setActiveTab("shops");
    }
  }, [loading, requiresSetup, activeTab]);

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
      <div className="px-6 pt-8 pb-0 bg-white dark:bg-gray-900 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-1">Cài đặt</h1>
        <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mb-8">
          {isShopOwner
            ? "Quản lý gói đăng ký và hệ thống chi nhánh của bạn."
            : "Các tùy chọn cài đặt theo vai trò."}
        </p>

        {isShopOwner && (
          <div className="flex gap-2 pb-4">
            <button
              onClick={() => setActiveTab("subscription")}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                activeTab === "subscription"
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              )}
            >
              Gói đăng ký
            </button>
            <button
              onClick={() => setActiveTab("shops")}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                activeTab === "shops"
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
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
                    <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
                      <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-5">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 dark:from-indigo-900/40 dark:to-blue-900/40 dark:text-indigo-300 shadow-sm">
                          <Store className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">Thiết lập cửa hàng</CardTitle>
                        <CardDescription className="text-[13px]">
                          Chưa có cửa hàng. Tạo cửa hàng đầu tiên theo gói đăng ký của bạn.
                          {pending?.shop_name ? (
                            <span className="mt-1 block text-indigo-600 dark:text-indigo-400 font-medium">
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

                      <Card className="mb-6 border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-5">
                          <CardTitle className="text-lg font-bold">Danh sách Cửa hàng</CardTitle>
                          <CardDescription className="text-[13px]">
                            {shops.length} cửa hàng
                            {quota?.max_shops != null ? ` / tối đa ${quota.max_shops} theo gói` : ""}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                          {shops.map((shop) => {
                            const isManaging = shop.id === (activeId ?? primaryShop?.id);
                            return (
                              <div
                                key={shop.id}
                                className={cn(
                                  "flex flex-col gap-3 rounded-2xl border px-5 py-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between group hover:shadow-md",
                                  isManaging
                                    ? "border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-gray-900 dark:border-indigo-800/50"
                                    : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700",
                                )}
                              >
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {shop.shop_name}
                                    {isManaging ? (
                                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider dark:bg-indigo-900/50 dark:text-indigo-300">
                                        Đang quản lý
                                      </span>
                                    ) : null}
                                  </p>
                                  {shop.address ? (
                                    <p className="text-xs text-gray-500 mt-1.5">{shop.address}</p>
                                  ) : null}
                                </div>
                                {!isManaging ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0 rounded-xl bg-white hover:bg-gray-50 shadow-sm font-semibold transition-all group-hover:border-indigo-200 group-hover:text-indigo-600"
                                    onClick={() => handleUseShop(shop)}
                                  >
                                    Chuyển sang
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
                        <Card className="mt-6 border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
                          <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-5 bg-white/50 dark:bg-gray-900/50">
                            <CardTitle className="text-base font-bold">Thêm cửa hàng</CardTitle>
                            <CardDescription className="text-[13px]">
                              Gói cho phép tạo thêm cửa hàng. Mỗi cửa hàng quản lý doanh thu và nhân sự riêng.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {!showAddForm ? (
                              <Button
                                type="button"
                                className="w-full rounded-2xl h-12 shadow-sm bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all active:scale-[0.98]"
                                onClick={() => setShowAddForm(true)}
                              >
                                <Plus className="mr-2 h-5 w-5" />
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border-gray-800/60">
                <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <CardTitle className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    Hồ sơ Quản trị viên
                  </CardTitle>
                  <CardDescription className="text-[13px] font-medium mt-1">
                    Thông tin cá nhân và tài khoản của bạn (Chỉ đọc)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                      {user?.full_name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.full_name || "Admin System"}</h3>
                      <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                        Vai trò: {user?.role_code || "Quản trị hệ thống"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 transition-colors">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tên đăng nhập</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.username || "---"}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 transition-colors">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Số điện thoại</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.phone || "---"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>


            </div>
          )}
        </div>
      </div>
    </div>
  );
}
