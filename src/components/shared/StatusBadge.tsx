import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "destructive" | "secondary" | "info";

const STATUS_MAP: Record<string, StatusVariant> = {
  // Order / payment
  completed:  "success",
  paid:       "success",
  active:     "success",
  in_stock:   "success",
  processing: "warning",
  pending:    "warning",
  low_stock:  "warning",
  unpaid:     "warning",
  cancelled:  "destructive",
  refunded:   "destructive",
  failed:     "destructive",
  out_of_stock: "destructive",
  inactive:   "secondary",
  draft:      "secondary",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant: StatusVariant = STATUS_MAP[status] ?? "secondary";
  const display = label ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {display}
    </Badge>
  );
}
