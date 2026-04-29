import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/stats-card";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Role } from "@/config/roles";

interface StatItem {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: ReactNode;
  iconClassName: string;
}

interface RowData extends Record<string, unknown> {
  id: string;
  name: string;
  detail: string;
  status: string;
  value: string;
}

const DEFAULT_COLUMNS: Column<RowData>[] = [
  { key: "id",     label: "#" },
  { key: "name",   label: "Name" },
  { key: "detail", label: "Detail" },
  {
    key: "status",
    label: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  { key: "value", label: "Value" },
];

const DEFAULT_ROWS: RowData[] = [
  { id: "001", name: "Item Alpha",   detail: "Sample detail · Apr 29",  status: "active",    value: "$120.00" },
  { id: "002", name: "Item Beta",    detail: "Sample detail · Apr 28",  status: "pending",   value: "$85.50"  },
  { id: "003", name: "Item Gamma",   detail: "Sample detail · Apr 27",  status: "completed", value: "$200.00" },
  { id: "004", name: "Item Delta",   detail: "Sample detail · Apr 26",  status: "inactive",  value: "$55.00"  },
  { id: "005", name: "Item Epsilon", detail: "Sample detail · Apr 25",  status: "active",    value: "$310.75" },
];

interface PlaceholderPageProps {
  title: string;
  description?: string;
  role: Role;
  breadcrumbs?: { label: string }[];
  stats?: StatItem[];
  tableTitle?: string;
  actions?: ReactNode;
}

export function PlaceholderPage({
  title,
  description,
  role,
  breadcrumbs,
  stats,
  tableTitle = "Data Overview",
  actions,
}: PlaceholderPageProps) {
  const crumbs = breadcrumbs ?? [{ label: "Home" }, { label: title }];

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title={title}
          description={description}
          role={role}
          breadcrumbs={crumbs}
          actions={actions}
        />

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => <StatsCard key={s.title} {...s} />)}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tableTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={DEFAULT_COLUMNS} data={DEFAULT_ROWS} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
