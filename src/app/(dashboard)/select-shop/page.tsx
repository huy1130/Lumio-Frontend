"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Store } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { bindActiveShopToUser } from "@/lib/shop-session";
import { getActiveShopId } from "@/lib/active-shop";
import { shopService } from "@/lib/services/shopService";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/shop";

export default function SelectShopPage() {
  return (
    <AccessGuard roles={["shop_owner"]}>
      <SelectShopPageContent />
    </AccessGuard>
  );
}

function SelectShopPageContent() {
  const router = useRouter();
  const { user, accessToken, setSession } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadShops = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const list = await shopService.getMine();
      const forTenant = list.filter((s) => s.tenant_id === user.tenant_id);
      setShops(forTenant);

      if (forTenant.length === 0) {
        router.replace("/shop");
        return;
      }
      if (forTenant.length === 1 && accessToken) {
        const next = bindActiveShopToUser(user, forTenant[0]);
        setSession(accessToken, next);
        router.replace("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, setSession, router]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const activeId = user ? getActiveShopId(user.tenant_id) : null;

  function handleSelect(shop: Shop) {
    if (!accessToken || !user) return;
    setSelectingId(shop.id);
    const next = bindActiveShopToUser(user, shop);
    setSession(accessToken, next);
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
      <div className="mx-auto w-full max-w-lg flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Store className="h-6 w-6" />
            </div>
            <CardTitle>Chọn cửa hàng</CardTitle>
            <CardDescription>
              Bạn có {shops.length} cửa hàng. Chọn một cửa hàng để quản lý trong phiên
              làm việc này.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {shops.map((shop) => {
              const isActive = shop.id === activeId;
              const isSelecting = selectingId === shop.id;
              return (
                <button
                  key={shop.id}
                  type="button"
                  disabled={isSelecting}
                  onClick={() => handleSelect(shop)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    isActive
                      ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50"
                      : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/60",
                  )}
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {shop.shop_name}
                    </p>
                    {shop.address ? (
                      <p className="mt-0.5 text-xs text-gray-500">{shop.address}</p>
                    ) : null}
                  </div>
                  {isSelecting ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-600" />
                  ) : isActive ? (
                    <Check className="h-5 w-5 shrink-0 text-indigo-600" />
                  ) : null}
                </button>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full rounded-xl"
              onClick={() => router.push("/shop")}
            >
              Quản lý / thêm cửa hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
