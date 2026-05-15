import type { ReactNode } from "react";
import { RoleBadge } from "@/components/shared/RoleBadge";
import type { Role } from "@/lib/roles";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  role?: Role;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, role, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 pb-6 border-b border-gray-200 dark:border-gray-700">
      {breadcrumbs && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
              <span className={i === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            {role && <RoleBadge role={role} />}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
