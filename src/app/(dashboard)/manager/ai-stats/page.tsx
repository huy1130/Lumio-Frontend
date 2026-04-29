import { BrainCircuit, Zap, MessageSquare, BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

const stats = [
  { title: "Total AI Requests", value: "12,450", change: 18.3, changeLabel: "vs last month", icon: <BrainCircuit className="h-4 w-4" />,    iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "Chatbot Sessions",  value: "3,210",  change: 22.1, changeLabel: "vs last month", icon: <MessageSquare className="h-4 w-4" />,   iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"        },
  { title: "Chart Generations", value: "876",    change: 9.4,  changeLabel: "vs last month", icon: <BarChart3 className="h-4 w-4" />,        iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  { title: "Automations Run",   value: "1,234",  change: 31.2, changeLabel: "vs last month", icon: <Zap className="h-4 w-4" />,              iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"    },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="AI Statistics"
      description="Platform-wide AI usage metrics and performance"
      role="manager"
      breadcrumbs={[{ label: "Manager" }, { label: "AI Statistics" }]}
      stats={stats}
      tableTitle="AI Request Log"
    />
  );
}
