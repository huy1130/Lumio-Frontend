"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { ALL_ROLES, ROLE_LABELS, ROLE_COLORS, MOCK_USERS, REDIRECT_MAP } from "@/config/roles";
import { cn } from "@/lib/utils";
import type { Role } from "@/config/roles";

export function RoleSwitcher() {
  const { role, setRole } = useAuth();
  const router = useRouter();

  function handleSwitch(newRole: Role) {
    setRole(newRole);
    router.push(REDIRECT_MAP[newRole]);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed text-xs">
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            ROLE_COLORS[role]
          )}>
            {ROLE_LABELS[role]}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          🎭 Switch Demo Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => handleSwitch(r)}
            className="flex cursor-pointer items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">{ROLE_LABELS[r]}</p>
              <p className="text-xs text-muted-foreground">{MOCK_USERS[r].email}</p>
            </div>
            {role === r && <Check className="h-4 w-4 text-indigo-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
