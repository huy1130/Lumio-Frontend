import Link from "next/link";
import { Check, Zap, BarChart3, Shield, Layers, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockSubscriptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Zap, title: "Real-time POS", desc: "Lightning-fast transactions with offline support and instant sync." },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Deep insights into sales, inventory trends, and staff performance." },
  { icon: Shield, title: "Role-based Access", desc: "Granular permissions for Manager, Admin, Staff, and Cashier roles." },
  { icon: Layers, title: "Inventory Control", desc: "Auto-reorder alerts, multi-location support, and full audit trail." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">POS System</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Star className="h-3 w-3 fill-current" />
            Trusted by 5,000+ businesses
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            The complete{" "}
            <span className="text-primary">POS & Inventory</span>
            {" "}platform
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Streamline your retail operations with real-time sales tracking, smart inventory management,
            and powerful analytics — all in one beautiful dashboard.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start free trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">View demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Powerful features built for modern retail businesses.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="border-0 bg-background shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Choose the plan that fits your business. Upgrade or cancel anytime.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {mockSubscriptions.map((plan, i) => {
              const isPopular = i === 1;
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${isPopular ? "border-primary shadow-lg shadow-primary/10 scale-105" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1 text-sm">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{plan.planName}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-extrabold">{formatCurrency(plan.price)}</span>
                      <span className="text-muted-foreground">/{plan.billingCycle}</span>
                    </div>
                    <CardDescription>
                      {plan.maxUsers === -1 ? "Unlimited users" : `Up to ${plan.maxUsers} users`} ·{" "}
                      {plan.maxProducts === -1 ? "Unlimited products" : `${plan.maxProducts.toLocaleString()} products`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/register" className="w-full">
                      <Button className="w-full" variant={isPopular ? "default" : "outline"}>
                        Get started
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Layers className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">POS System</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 POS System Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
