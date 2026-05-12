import { DollarSign, TrendingUp, CreditCard, PiggyBank } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";

const stats = [
  { title: "Monthly Revenue",  value: "$24,300", change: 9.8,  changeLabel: "vs last month", icon: <DollarSign className="h-4 w-4" />, iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  { title: "Profit Margin",    value: "38.2%",   change: 1.4,  changeLabel: "vs last month", icon: <TrendingUp className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"          },
  { title: "Total Collected",  value: "$21,800", change: 8.1,  changeLabel: "vs last month", icon: <CreditCard className="h-4 w-4" />, iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"              },
  { title: "Expenses",         value: "$6,400",  change: -3.2, changeLabel: "vs last month", icon: <PiggyBank className="h-4 w-4" />,  iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"           },
];

export default function FinancialsPage() {
  return (
    <AccessGuard roles={["shop_owner"]}>
      <PlaceholderPage
        title="Financial Statistics"
        description="Revenue, profit and financial performance metrics"
        role="shop_owner"
        breadcrumbs={[{ label: "Shop Owner" }, { label: "Financial Statistics" }]}
        stats={stats}
        tableTitle="Financial Summary"
      />
    </AccessGuard>
  );
}
