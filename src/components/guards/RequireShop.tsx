"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

// Các trang không yêu cầu có shop (Cài đặt, Gia hạn gói...)
const ALLOWED_PATHS = ["/settings", "/subscription/renew", "/subscriptions/requests"];

export function RequireShop({ children }: { children: React.ReactNode }) {
  const { role, user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  const isAllowedPath = ALLOWED_PATHS.some((path) => pathname.startsWith(path));

  // Chỉ áp dụng khóa cho shop_owner và nhân viên (nếu bị lỗi không có shop_id)
  const isShopLevelRole = role === "shop_owner" || role === "cashier" || role === "inventory_staff";
  
  const needsShop = isShopLevelRole && !user?.shop_id;

  if (needsShop && !isAllowedPath) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
        <Card className="max-w-md w-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border-gray-800/60">
          <CardContent className="flex flex-col items-center text-center p-10">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-400 shadow-inner">
              <Store className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
              Chưa có cửa hàng
            </h2>
            <p className="text-[14.5px] text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">
              Bạn chưa được phép xem hoặc tạo dữ liệu do hệ thống chưa ghi nhận cửa hàng nào. Vui lòng thiết lập cửa hàng đầu tiên để bắt đầu kinh doanh!
            </p>
            <Button asChild className="w-full rounded-2xl h-12 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-[0.98]">
              <Link href="/settings?tab=shops">
                Thiết lập cửa hàng ngay <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
