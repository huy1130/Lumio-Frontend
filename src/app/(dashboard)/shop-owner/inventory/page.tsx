import { Warehouse, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

const stats = [
  { title: "Total SKUs",    value: "142", change: 7,  changeLabel: "this month",  icon: <Warehouse className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
  { title: "In Stock",      value: "128", change: 5,  changeLabel: "items",       icon: <CheckCircle className="h-4 w-4" />,   iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Low Stock",     value: "10",  change: -2, changeLabel: "alert items", icon: <AlertTriangle className="h-4 w-4" />, iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
  { title: "Out of Stock",  value: "4",   change: 1,  changeLabel: "items",       icon: <TrendingDown className="h-4 w-4" />,  iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Inventory"
      description="Track and manage your store's stock levels"
      role="shop_owner"
      breadcrumbs={[{ label: "Shop Owner" }, { label: "Inventory" }]}
      stats={stats}
      tableTitle="Inventory Status"
    />
  );
}
