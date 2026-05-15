import { redirect } from "next/navigation";

/** Giữ URL cũ — chuyển sang trang shop trong dashboard (có sidebar) */
export default function SetupShopRedirectPage() {
  redirect("/shop");
}
