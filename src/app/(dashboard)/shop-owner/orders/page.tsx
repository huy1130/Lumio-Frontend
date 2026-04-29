import { ShoppingCart, CheckCircle, Clock, XCircle } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

const stats = [
  { title: "Total Orders",   value: "56",  change: 3.1, changeLabel: "today",         icon: <ShoppingCart className="h-4 w-4" />, iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
  { title: "Completed",      value: "38",  change: 5,   changeLabel: "today",         icon: <CheckCircle className="h-4 w-4" />,  iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Pending",        value: "12",  change: -2,  changeLabel: "today",         icon: <Clock className="h-4 w-4" />,        iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
  { title: "Cancelled",      value: "6",   change: 1,   changeLabel: "today",         icon: <XCircle className="h-4 w-4" />,      iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Orders"
      description="Monitor and manage all store orders"
      role="shop_owner"
      breadcrumbs={[{ label: "Shop Owner" }, { label: "Orders" }]}
      stats={stats}
      tableTitle="Order List"
    />
  );
}
