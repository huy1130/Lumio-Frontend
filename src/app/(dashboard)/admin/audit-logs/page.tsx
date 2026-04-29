import { AuditLogsPage } from "@/components/shared/AuditLogsPage";

export default function Page() {
  return <AuditLogsPage role="admin" breadcrumbs={[{ label: "Admin" }, { label: "Audit Logs" }]} />;
}
