import { AuditLogsPage } from "@/components/shared/AuditLogsPage";

export default function Page() {
  return <AuditLogsPage role="shop_owner" breadcrumbs={[{ label: "Shop Owner" }, { label: "Audit Logs" }]} />;
}
