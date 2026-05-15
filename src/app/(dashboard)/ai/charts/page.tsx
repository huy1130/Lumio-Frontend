"use client";

import { BrainCircuit, BarChart3, TrendingUp, PieChart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/roles";

export default function AIChartsPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner", "staff"]}>
      <AIChartsContent />
    </AccessGuard>
  );
}

// Stats and chart areas differ between admin/shop_owner (system-wide) and staff (personal)
const STATS_SYSTEM = [
  { title: "AI Predictions",   value: "94.2%", change: 1.8,  changeLabel: "accuracy",       icon: <BrainCircuit className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Charts Generated", value: "348",   change: 12.5, changeLabel: "this month",      icon: <BarChart3 className="h-4 w-4" />,    iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"        },
  { title: "Trend Detected",   value: "7",     change: 3,    changeLabel: "new this week",   icon: <TrendingUp className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
  { title: "Segments",         value: "12",    change: 2,    changeLabel: "customer segs",   icon: <PieChart className="h-4 w-4" />,     iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"    },
];

const CHART_AREAS_SYSTEM = [
  { title: "Revenue Forecast",      description: "AI-predicted revenue for next 30 days based on historical trends" },
  { title: "Customer Segmentation", description: "AI-clustered customer groups by purchase behavior" },
  { title: "Product Affinity",      description: "Items frequently bought together — market basket analysis" },
  { title: "Demand Prediction",     description: "Stock demand forecast to prevent shortages and overstock" },
];

const STATS_STAFF = [
  { title: "My Order Trend",  value: "+18%", change: 18,  changeLabel: "vs last week",  icon: <TrendingUp className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
  { title: "AI Insights",     value: "4",    change: 2,   changeLabel: "new this week",  icon: <BrainCircuit className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Peak Hours",      value: "12pm", change: 0,   changeLabel: "busiest time",   icon: <BarChart3 className="h-4 w-4" />,    iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"        },
  { title: "Avg Order Value", value: "$28",  change: 3.2, changeLabel: "vs last week",   icon: <PieChart className="h-4 w-4" />,     iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"    },
];

const CHART_AREAS_STAFF = [
  { title: "My Daily Orders",  description: "Orders you created over the past 7 days" },
  { title: "Peak Sales Hours", description: "When your orders are most frequent during the day" },
];

function AIChartsContent() {
  const { role } = useAuth();
  const isStaff   = role === "staff";
  const stats      = isStaff ? STATS_STAFF      : STATS_SYSTEM;
  const chartAreas = isStaff ? CHART_AREAS_STAFF : CHART_AREAS_SYSTEM;
  const roleLabel  = ROLE_LABELS[role] ?? "User";
  const description = isStaff
    ? "AI-powered analytics for your performance"
    : "AI-generated analytics and predictive visualizations";

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="AI Charts"
          description={description}
          role={role}
          breadcrumbs={[{ label: roleLabel }, { label: "AI Charts" }]}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => <StatsCard key={s.title} {...s} />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {chartAreas.map((chart) => (
            <Card key={chart.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-indigo-500" />
                  {chart.title}
                </CardTitle>
                <CardDescription className="text-xs">{chart.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-dashed border-indigo-200 dark:border-indigo-800">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-10 w-10 text-indigo-300 dark:text-indigo-700 mx-auto" />
                    <p className="text-sm text-indigo-400 dark:text-indigo-500 font-medium">AI Chart</p>
                    <p className="text-xs text-muted-foreground">Connect to backend to load</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
