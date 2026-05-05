"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import { mockSubscriptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately and we'll prorate the billing.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every plan comes with a 14-day free trial. No credit card required to get started.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, bank transfers, and popular digital wallets including MoMo and ZaloPay.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Yes, annual plans save you up to 20% compared to monthly billing. Toggle the billing cycle above to compare.",
  },
  {
    q: "What happens when my trial ends?",
    a: "You'll be prompted to choose a plan. If you don't, your account moves to read-only mode — your data is safe.",
  },
  {
    q: "Is there a setup fee or hidden costs?",
    a: "None at all. The price you see is the price you pay. Onboarding support and updates are included.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const isAnnual = billingCycle === "annual";

  return (
    <div className="pt-16">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge className="mb-5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 px-4 py-1.5 text-sm font-medium">
                Pricing
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mb-5 text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
            >
              Simple,{" "}
              <span className="text-indigo-600 dark:text-indigo-400">transparent</span>{" "}
              pricing
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              No hidden fees. No surprises. Pick the plan that fits your business and upgrade anytime.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6">

          {/* Billing cycle toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-3 mb-14"
          >
            <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                  !isAnnual
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                  isAnnual
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                Annual
                <span className="rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5">
                  Save 20%
                </span>
              </button>
            </div>
            {isAnnual && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Billed once per year · prices shown per month
              </p>
            )}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-3 items-start"
          >
            {mockSubscriptions.map((plan, i) => {
              const isPopular = i === 1;
              const displayPrice = isAnnual
                ? Math.round(plan.price * 0.8)
                : plan.price;

              return (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-8",
                    isPopular
                      ? "border-indigo-300 bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900 scale-[1.03] shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-white text-indigo-600 px-4 py-1 text-xs font-bold shadow-sm border border-indigo-100">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className={cn("text-base font-semibold mb-2", isPopular ? "text-indigo-100" : "text-gray-900 dark:text-white")}>
                      {plan.planName}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className={cn("text-4xl font-extrabold", isPopular ? "text-white" : "text-gray-900 dark:text-white")}>
                        {formatCurrency(displayPrice)}
                      </span>
                      <span className={cn("text-sm", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>
                        /mo
                      </span>
                    </div>
                    {isAnnual && (
                      <p className={cn("text-xs mb-1 line-through", isPopular ? "text-indigo-300" : "text-gray-400 dark:text-gray-500")}>
                        {formatCurrency(plan.price)}/mo
                      </p>
                    )}
                    <p className={cn("text-xs", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>
                      {isAnnual
                        ? `${formatCurrency(displayPrice * 12)} billed annually`
                        : `${plan.maxUsers === -1 ? "Unlimited users" : `Up to ${plan.maxUsers} users`} · ${plan.maxProducts === -1 ? "Unlimited products" : `${plan.maxProducts.toLocaleString()} products`}`}
                    </p>
                    {isAnnual && (
                      <p className={cn("text-xs mt-0.5", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>
                        {plan.maxUsers === -1 ? "Unlimited users" : `Up to ${plan.maxUsers} users`}
                        {" · "}
                        {plan.maxProducts === -1 ? "Unlimited products" : `${plan.maxProducts.toLocaleString()} products`}
                      </p>
                    )}
                  </div>

                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className={cn("flex items-start gap-2.5 text-sm", isPopular ? "text-indigo-100" : "text-gray-600 dark:text-gray-300")}>
                        <Check className={cn("h-4 w-4 shrink-0 mt-0.5", isPopular ? "text-indigo-200" : "text-green-500")} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/register">
                    <Button
                      className={cn(
                        "w-full font-semibold h-11 rounded-xl",
                        isPopular
                          ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      )}
                    >
                      Get started
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Trial note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500"
          >
            All plans include a 14-day free trial · No credit card required · Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* ── Feature comparison hint ────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Not sure which plan is right?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Explore everything Lumio has to offer — then pick the tier that fits where your business is today.
              You can always upgrade later.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/features">
                <Button size="lg" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30">
                  Explore all features <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  Talk to sales
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                Frequently asked questions
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Can&apos;t find the answer? <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">Drop us a message.</Link>
              </p>
            </motion.div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    {faq.q}
                    <HelpCircle
                      className={cn(
                        "h-4 w-4 shrink-0 ml-4 transition-colors",
                        openFaq === idx ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"
                      )}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-indigo-600 px-10 py-16 text-center shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -right-20 bottom-10 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
            </div>
            <div className="relative">
              <Badge className="mb-5 border-white/20 bg-white/10 text-white">14-day free trial · No credit card</Badge>
              <h2 className="text-3xl font-extrabold sm:text-4xl mb-4 text-white">Start growing today</h2>
              <p className="text-indigo-100 mb-8 max-w-md mx-auto">
                Join 300,000+ businesses already running smarter with Lumio.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-8 font-semibold shadow-lg">
                    Start free trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-12 border-white/30 bg-white/10 text-white hover:bg-white/20 px-8">
                    Contact sales
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
