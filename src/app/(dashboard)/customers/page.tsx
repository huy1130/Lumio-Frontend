import { Users, UserCheck, Star, ShoppingCart } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Total Customers", value: "248", change: 12, changeLabel: "this month", icon: <Users className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"    },
  { title: "Returning",       value: "180", change: 8,  changeLabel: "this month", icon: <UserCheck className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Loyalty Members", value: "92",  change: 15, changeLabel: "this month", icon: <Star className="h-4 w-4" />,      iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"  },
  { title: "Avg. Orders",     value: "3.2", change: 0.4,changeLabel: "per customer",icon: <ShoppingCart className="h-4 w-4" />,iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

export default function CustomersPage() {
  return (
    <AccessGuard roles={["cashier"]}>
      <PlaceholderPage
        title="Customers"
        description="View and manage customer accounts and loyalty data"
        role="cashier"
        breadcrumbs={[{ label: "Cashier" }, { label: "Customers" }]}
        stats={stats}
        tableTitle="Customer List"
        actions={<Button size="sm"><Users className="h-4 w-4 mr-1.5" />Add Customer</Button>}
      />
    </AccessGuard>
  );
}
