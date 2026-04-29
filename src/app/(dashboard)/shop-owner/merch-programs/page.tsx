import { Gift, Star, Users, BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Active Programs",  value: "3",    change: 1,  changeLabel: "this month",  icon: <Gift className="h-4 w-4" />,     iconClassName: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300"       },
  { title: "Enrolled Members", value: "420",  change: 35, changeLabel: "this month",  icon: <Users className="h-4 w-4" />,    iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"        },
  { title: "Points Issued",    value: "12k",  change: 18, changeLabel: "this month",  icon: <Star className="h-4 w-4" />,     iconClassName: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"   },
  { title: "Redemptions",      value: "180",  change: 22, changeLabel: "this month",  icon: <BarChart3 className="h-4 w-4" />,iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"    },
];

export default function Page() {
  return (
    <PlaceholderPage
      title="Merchandise Program"
      description="Loyalty and reward programs for your customers"
      role="shop_owner"
      breadcrumbs={[{ label: "Shop Owner" }, { label: "Merchandise Program" }]}
      stats={stats}
      tableTitle="Program Overview"
      actions={<Button size="sm"><Gift className="h-4 w-4 mr-1.5" />New Program</Button>}
    />
  );
}
