import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconClassName?: string;
}

export function StatsCard({ title, value, change, changeLabel, icon, iconClassName }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden relative group dark:bg-gray-900/50 transition-all hover:shadow-md">
      {/* Background large icon */}
      <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500", iconClassName ? iconClassName.replace(/bg-[^ ]+/g, '') : "text-primary")}>
        <div className="[&>svg]:w-24 [&>svg]:h-24">{icon}</div>
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm", iconClassName ?? "bg-primary/10 text-primary")}>
            {icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {value}
        </h3>
        {(change !== undefined || changeLabel) && (
          <div className={cn("mt-2 flex items-center gap-1.5 text-[13px] font-medium", isPositive ? "text-emerald-600" : "text-rose-500")}>
            {change !== undefined && (
              <>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{isPositive ? "+" : ""}{change}%</span>
              </>
            )}
            {changeLabel && <span className="text-gray-500 font-normal ml-0.5">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
