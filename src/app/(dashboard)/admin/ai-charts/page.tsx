import { BrainCircuit, BarChart3, TrendingUp, PieChart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const stats = [
  { title: "AI Predictions",  value: "94.2%", change: 1.8,  changeLabel: "accuracy",       icon: <BrainCircuit className="h-4 w-4" />, iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Charts Generated",value: "348",   change: 12.5, changeLabel: "this month",      icon: <BarChart3 className="h-4 w-4" />,    iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"        },
  { title: "Trend Detected",  value: "7",     change: 3,    changeLabel: "new this week",   icon: <TrendingUp className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
  { title: "Segments",        value: "12",    change: 2,    changeLabel: "customer segs",   icon: <PieChart className="h-4 w-4" />,     iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"    },
];

const chartAreas = [
  { title: "Revenue Forecast",     description: "AI-predicted revenue for next 30 days based on historical trends" },
  { title: "Customer Segmentation",description: "AI-clustered customer groups by purchase behavior" },
  { title: "Product Affinity",     description: "Items frequently bought together — market basket analysis" },
  { title: "Demand Prediction",    description: "Stock demand forecast to prevent shortages and overstock" },
];

export default function AIChartsPage() {
  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="AI Charts"
          description="AI-generated analytics and predictive visualizations"
          role="admin"
          breadcrumbs={[{ label: "Admin" }, { label: "AI Charts" }]}
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
                <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-dashed border-indigo-200 dark:border-indigo-800">
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
