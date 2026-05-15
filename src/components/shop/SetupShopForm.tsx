"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { getRedirectByRoleId } from "@/config/roles";
import { readPendingShop, clearPendingShop } from "@/lib/pending-shop";
import { isShopLimitReachedError } from "@/lib/shop-errors";
import { saveShop, saveShopSnapshot } from "@/lib/shop-storage";
import { shopService } from "@/services/shopService";
import { toast } from "sonner";

interface SetupShopFormProps {
  redirectAfterCreate?: boolean;
  onShopResolved?: () => void;
}

export function SetupShopForm({
  redirectAfterCreate = false,
  onShopResolved,
}: SetupShopFormProps) {
  const router = useRouter();
  const { accessToken, user, setSession } = useAuth();

  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const pending = readPendingShop();
    if (pending?.shop_name) setShopName(pending.shop_name);
    if (pending?.address) setAddress(pending.address);
    if (pending?.phone) setPhone(pending.phone);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !user) return;

    const name = shopName.trim();
    if (name.length < 2) {
      toast.error("Tên cửa hàng phải có ít nhất 2 ký tự");
      return;
    }

    setSubmitting(true);
    try {
      const shop = await shopService.create({
        shop_name: name,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      clearPendingShop();
      saveShop(shop);
      setSession(accessToken, { ...user, shop_id: shop.id });
      toast.success("Đã tạo cửa hàng thành công");

      if (redirectAfterCreate) {
        router.push(getRedirectByRoleId(user.role_id));
      } else {
        router.refresh();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tạo cửa hàng";

      if (isShopLimitReachedError(message)) {
        clearPendingShop();
        const { resolveTenantShops } = await import("@/lib/resolve-tenant-shop");
        const resolved = await resolveTenantShops(user);
        if (resolved.shops.length > 0) {
          setSession(accessToken, resolved.user);
          toast.info("Đã tải cửa hàng của tenant.");
          onShopResolved?.();
          return;
        }
        saveShopSnapshot({
          shop_name: name,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          tenant_id: user.tenant_id,
        });
        toast.info(
          "Cửa hàng đã tồn tại trên gói đăng ký. Kiểm tra DATABASE_URL nếu chưa thấy chi tiết.",
        );
        onShopResolved?.();
        return;
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="shop_name">
          Tên cửa hàng <span className="text-red-500">*</span>
        </Label>
        <Input
          id="shop_name"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="VD: Cà Phê Lumio"
          required
          minLength={2}
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Địa chỉ</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Số nhà, đường, quận..."
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0901234567"
          className="h-11"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting || shopName.trim().length < 2}
        className="h-11 w-full rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tạo…
          </span>
        ) : (
          "Tạo cửa hàng"
        )}
      </Button>
    </form>
  );
}
