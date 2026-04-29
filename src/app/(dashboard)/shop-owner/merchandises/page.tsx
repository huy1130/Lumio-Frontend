import { Store, CheckCircle, XCircle, Tag } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Total Merch", value: "24", change: 3,  changeLabel: "this month", icon: <Store className="h-4 w-4" />,       iconClassName: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" },
  { title: "Active",      value: "20", change: 2,  changeLabel: "this month", icon: <CheckCircle className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
  { title: "Inactive",    value: "4",  change: 1,  changeLabel: "this month", icon: <XCircle className="h-4 w-4" />,     iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"           },
  { title: "Categories",  value: "5",  change: 0,  changeLabel: "total",      icon: <Tag className="h-4 w-4" />,         iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"   },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Merchandises"
      description="Manage branded merchandise and store accessories"
      role="shop_owner"
      breadcrumbs={[{ label: "Shop Owner" }, { label: "Merchandises" }]}
      stats={stats}
      tableTitle="Merchandise Catalog"
      actions={<Button size="sm"><Store className="h-4 w-4 mr-1.5" />Add Item</Button>}
    />
  );
}
