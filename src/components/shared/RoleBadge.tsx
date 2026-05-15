import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import type { Role } from "@/lib/roles";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ROLE_COLORS[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
