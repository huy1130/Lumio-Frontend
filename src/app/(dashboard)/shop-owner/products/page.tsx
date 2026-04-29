import { Package, CheckCircle, XCircle, Tag } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Total Products", value: "142", change: 7,   changeLabel: "this month",  icon: <Package className="h-4 w-4" />,      iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
  { title: "Active",         value: "130", change: 5,   changeLabel: "this month",  icon: <CheckCircle className="h-4 w-4" />,  iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Inactive",       value: "12",  change: 2,   changeLabel: "this month",  icon: <XCircle className="h-4 w-4" />,      iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
  { title: "Categories",     value: "8",   change: 1,   changeLabel: "total",       icon: <Tag className="h-4 w-4" />,          iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Products"
      description="Manage your store products and categories"
      role="shop_owner"
      breadcrumbs={[{ label: "Shop Owner" }, { label: "Products" }]}
      stats={stats}
      tableTitle="Product List"
      actions={<Button size="sm"><Package className="h-4 w-4 mr-1.5" />Add Product</Button>}
    />
  );
}
