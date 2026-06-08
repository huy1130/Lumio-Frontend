"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { shopService } from "@/lib/services/shopService";
import { bindActiveShopToUser } from "@/lib/shop-session";
import type { Shop } from "@/types/shop";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ShopSwitcher() {
  const { role, user, setSession, accessToken } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    if (role === "shop_owner") {
      shopService.getMine().then(setShops).catch(console.error);
    }
  }, [role]);

  // Only show the switcher if the user is a Boss and has at least 1 shop
  if (role !== "shop_owner" || shops.length === 0 || !user || !accessToken) return null;

  const currentShop = shops.find(s => s.id === user.shop_id) || shops[0];

  const handleSwitch = (shop: Shop) => {
    if (shop.id === user.shop_id) return;
    const nextUser = bindActiveShopToUser(user, shop);
    setSession(accessToken, nextUser);
    // Reload to ensure all components fetch data for the new shop correctly
    window.location.reload(); 
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-semibold text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-900 dark:text-orange-400">
          <Store className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{currentShop?.shop_name || "Cửa hàng"}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {shops.map((shop) => (
          <DropdownMenuItem
            key={shop.id}
            onClick={() => handleSwitch(shop)}
            className={`cursor-pointer ${shop.id === user.shop_id ? 'bg-orange-50 dark:bg-orange-900/20 font-bold text-orange-600 dark:text-orange-400' : ''}`}
          >
            {shop.shop_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
