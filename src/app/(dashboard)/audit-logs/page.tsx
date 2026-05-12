"use client";

import { useAuth } from "@/context/AuthContext";
import { AuditLogsPage } from "@/components/shared/AuditLogsPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { ROLE_LABELS } from "@/config/roles";

export default function AuditLogsFeaturePage() {
  return (
    <AccessGuard roles={["admin", "manager", "shop_owner"]}>
      <AuditLogsContent />
    </AccessGuard>
  );
}

function AuditLogsContent() {
  const { role } = useAuth();
  const roleLabel = ROLE_LABELS[role] ?? "User";

  return (
    <AuditLogsPage
      role={role}
      breadcrumbs={[{ label: roleLabel }, { label: "Audit Logs" }]}
    />
  );
}
