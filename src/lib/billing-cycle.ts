/** Chuẩn hóa billing_cycle khớp BE (extend dùng MONTHLY / YEARLY). */
export function normalizeBillingCycle(value: string): string {
  const v = value.trim().toUpperCase();
  if (v === "MONTHLY" || v === "MONTH") return "MONTHLY";
  if (v === "YEARLY" || v === "YEAR" || v === "ANNUAL") return "YEARLY";
  return v;
}

export const BILLING_CYCLE_OPTIONS = [
  { value: "MONTHLY", label: "Hàng tháng (MONTHLY)" },
  { value: "YEARLY", label: "Hàng năm (YEARLY)" },
] as const;
