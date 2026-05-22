import type { Metadata } from "next";
import { SubscriptionSuccessClient } from "@/components/subscription/SubscriptionSuccessClient";

export const metadata: Metadata = {
  title: "Thanh toán thành công · Lumio",
  description: "Cảm ơn bạn đã thanh toán.",
};

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function SubscriptionSuccessPage({ searchParams }: Props) {
  const orderCode =
    typeof searchParams.orderCode === "string"
      ? searchParams.orderCode
      : undefined;
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const isRenew =
    searchParams.renew === "1" || searchParams.renew === "true";
  const payosCode =
    typeof searchParams.code === "string" ? searchParams.code : undefined;

  return (
    <SubscriptionSuccessClient
      orderCodeFromUrl={orderCode}
      statusFromUrl={status}
      payosCodeFromUrl={payosCode}
      isRenew={isRenew}
    />
  );
}
