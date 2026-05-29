"use client";

import { Header } from "@/components/layout/header";
import { ShopOwnerSubscriptionCard } from "@/components/tenant/ShopOwnerSubscriptionCard";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const { role } = useAuth();
  const isShopOwner = role === "shop_owner";

  return (
    <div>
      <Header />
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cài đặt</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isShopOwner
                ? "Quản lý gói đăng ký và hạn mức tenant của bạn."
                : "Các tùy chọn cài đặt theo vai trò."}
            </p>
          </div>

          {isShopOwner ? (
            <ShopOwnerSubscriptionCard />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Chưa có cài đặt</CardTitle>
                <CardDescription>
                  Hiện chưa có mục cài đặt nào được
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Các phần như thông tin cửa hàng được bảo mật
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

