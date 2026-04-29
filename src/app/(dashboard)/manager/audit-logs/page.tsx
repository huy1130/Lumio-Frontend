import { AuditLogsPage } from "@/components/shared/AuditLogsPage";

export default function Page() {
  return <AuditLogsPage role="manager" breadcrumbs={[{ label: "Manager" }, { label: "Audit Logs" }]} />;
}
