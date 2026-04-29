import { Users, Building2, BrainCircuit, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";

const stats = [
  { title: "Total Admins",  value: "6",   change: 1,    changeLabel: "this month",    icon: <Users className="h-4 w-4" />,       iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
  { title: "Total Tenants", value: "34",  change: 5,    changeLabel: "this month",    icon: <Building2 className="h-4 w-4" />,   iconClassName: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  { title: "AI Requests",   value: "12k", change: 18.3, changeLabel: "vs last month", icon: <BrainCircuit className="h-4 w-4" />,iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { title: "System Health", value: "99%", change: 0.1,  changeLabel: "uptime",        icon: <ShieldCheck className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
];

const activity = [
  { label: "Bob Admin",   sub: "admin@pos.com · Store A",   status: "active",   value: "Admin"   },
  { label: "Carol Admin", sub: "carol@pos.com · Store B",   status: "active",   value: "Admin"   },
  { label: "Dan Admin",   sub: "dan@pos.com · Store C",     status: "inactive", value: "Admin"   },
  { label: "Eve Admin",   sub: "eve@pos.com · Store D",     status: "active",   value: "Admin"   },
  { label: "Frank Admin", sub: "frank@pos.com · Store E",   status: "pending",  value: "Admin"   },
];

export default function ManagerDashboardPage() {
  return (
    <DashboardShell
      title="Manager Dashboard"
      role="manager"
      stats={stats}
      activity={activity}
      activityTitle="Admin Accounts"
      showCharts={false}
    />
  );
}
