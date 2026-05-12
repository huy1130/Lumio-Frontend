import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";

const stats = [
  { title: "Revenue Trend",   value: "+12.5%", change: 12.5, changeLabel: "vs last period", icon: <TrendingUp className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
  { title: "Order Volume",    value: "+8.2%",  change: 8.2,  changeLabel: "vs last period", icon: <Activity className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"        },
  { title: "Churn Rate",      value: "-2.1%",  change: -2.1, changeLabel: "vs last period", icon: <TrendingDown className="h-4 w-4" />, iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"            },
  { title: "Monthly Periods", value: "12",     change: 0,    changeLabel: "tracked",        icon: <Calendar className="h-4 w-4" />,     iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

export default function TrendsPage() {
  return (
    <AccessGuard roles={["manager"]}>
      <PlaceholderPage
        title="Trends"
        description="Long-term platform trends and growth analytics"
        role="manager"
        breadcrumbs={[{ label: "Manager" }, { label: "Trends" }]}
        stats={stats}
        tableTitle="Trend History"
      />
    </AccessGuard>
  );
}
