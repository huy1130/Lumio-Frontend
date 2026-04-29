import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Role } from "@/config/roles";

interface LogRow extends Record<string, unknown> {
  timestamp: string;
  action: string;
  user: string;
  role: string;
  target: string;
  status: string;
}

const LOGS: LogRow[] = [
  { timestamp: "2026-04-29 10:42:01", action: "LOGIN",           user: "alice@pos.com", role: "Manager", target: "Auth",         status: "completed" },
  { timestamp: "2026-04-29 10:38:22", action: "UPDATE_PRODUCT",  user: "bob@pos.com",   role: "Admin",   target: "Product #142", status: "completed" },
  { timestamp: "2026-04-29 10:21:55", action: "CREATE_ORDER",    user: "dave@pos.com",  role: "Staff",   target: "ORD-0103",     status: "completed" },
  { timestamp: "2026-04-29 10:15:30", action: "PROCESS_PAYMENT", user: "eve@pos.com",   role: "Cashier", target: "ORD-0102",     status: "completed" },
  { timestamp: "2026-04-29 09:58:44", action: "DELETE_USER",     user: "alice@pos.com", role: "Manager", target: "User #22",     status: "completed" },
  { timestamp: "2026-04-29 09:44:17", action: "EXPORT_DATA",     user: "bob@pos.com",   role: "Admin",   target: "Orders CSV",   status: "completed" },
  { timestamp: "2026-04-29 09:30:00", action: "FAILED_LOGIN",    user: "unknown",       role: "—",       target: "Auth",         status: "failed"    },
  { timestamp: "2026-04-28 18:05:12", action: "CONFIGURE_AI",    user: "alice@pos.com", role: "Manager", target: "AI Chatbot",   status: "completed" },
];

const columns: Column<LogRow>[] = [
  { key: "timestamp", label: "Timestamp" },
  {
    key: "action",
    label: "Action",
    render: (r) => (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
        {r.action}
      </code>
    ),
  },
  { key: "user",   label: "User"   },
  { key: "role",   label: "Role"   },
  { key: "target", label: "Target" },
  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

interface AuditLogsPageProps {
  role: Role;
  breadcrumbs?: { label: string }[];
}

export function AuditLogsPage({ role, breadcrumbs }: AuditLogsPageProps) {
  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Audit Logs"
          description="Track all user actions and system events"
          role={role}
          breadcrumbs={breadcrumbs}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={LOGS} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
