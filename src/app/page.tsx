"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Layers, ArrowRight, Check, BarChart3, Shield, Zap,
  ShoppingCart, Package, DollarSign, Users, TrendingUp,
  Star, Menu, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Footer } from "@/components/layout/Footer";
import { mockSubscriptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── Hero data ─────────────────────────────────────────────────────────────────
const HERO_STATS = [
  { value: "300.000+", label: "Doanh nghiệp đang sử dụng",  icon: Users      },
  { value: "10.000+",  label: "Người dùng mới mỗi tháng",   icon: TrendingUp },
];

const HERO_CARDS = [
  {
    icon: ShoppingCart, title: "Quản lý bán hàng",
    desc: "Tạo đơn nhanh, thanh toán đơn giản, chính xác",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    pos: "top-8 left-6",
  },
  {
    icon: Package, title: "Quản lý hàng hóa",
    desc: "Theo dõi tồn kho, nhập xuất, cảnh báo hết hàng",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    pos: "top-8 right-6",
  },
  {
    icon: BarChart3, title: "Báo cáo doanh thu",
    desc: "Chi tiết, trực quan, cập nhật thời gian thực",
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    pos: "bottom-8 right-6",
  },
  {
    icon: Users, title: "Quản lý khách hàng",
    desc: "Lưu trữ thông tin, lịch sử và chăm sóc khách hàng",
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    pos: "bottom-8 left-6",
  },
];

// ─── Features section data ─────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,         title: "Real-time POS",        desc: "Lightning-fast transactions with instant sync across all devices and locations."  },
  { icon: BarChart3,   title: "Advanced Analytics",   desc: "Deep insights on sales, inventory trends, and staff performance in one view."      },
  { icon: Shield,      title: "Role-based Access",    desc: "Granular permissions for Manager, Admin, Staff, and Cashier — no overlap."         },
  { icon: Layers,      title: "Inventory Control",    desc: "Auto-reorder alerts, multi-location tracking, and a full audit trail."             },
  { icon: TrendingUp,  title: "AI-powered Insights",  desc: "Predictive analytics and smart suggestions to boost your revenue daily."           },
  { icon: ShoppingCart,title: "Omnichannel Orders",   desc: "Handle dine-in, takeaway, delivery, and online orders from one dashboard."         },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
  { label: "Docs",     href: "#docs"     },
  { label: "Blog",     href: "#blog"     },
];

export default function LandingPage() {
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeSection,  setActiveSection]  = useState("");
  const [scrolled,       setScrolled]       = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["features", "pricing"];
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.25, rootMargin: "-64px 0px 0px 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm"
          : "border-b border-transparent bg-white/60 dark:bg-gray-950/60 backdrop-blur-md"
      )}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Layers className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">POS System</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = activeSection === label.toLowerCase();
              return (
                <a
                  key={label}
                  href={href}
                  className={cn(
                    "relative text-sm transition-colors pb-0.5",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 md:flex">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm">
                Đăng ký
              </Button>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-6 py-4 space-y-1 md:hidden">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = activeSection === label.toLowerCase();
              return (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />}
                  {label}
                </a>
              );
            })}
            <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Đăng nhập
            </Link>
          </div>
        )}
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative flex items-center overflow-hidden pt-16 min-h-[88vh]">

        {/* ── Background image ─────────────────────────────────────────── */}
        <div className="absolute inset-0">
          <Image
            src="/images/image2.jpg"
            alt="F&B business management"
            fill
            priority
            className="object-cover object-center"
            style={{ filter: "blur(0.6px)" }}
          />
        </div>

        {/* ── Overlay: left opaque → right transparent ─────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-r
          from-white/95 via-white/80 to-white/15
          dark:from-gray-950/95 dark:via-gray-950/80 dark:to-gray-950/15" />
        {/* Subtle extra blur on right column */}
        <div className="absolute inset-y-0 right-0 w-2/5 backdrop-blur-[1px]" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24
          bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">

            {/* LEFT: Text content */}
            <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-xl">

              {/* Heading — large bold black, matching screenshot style */}
              <motion.h1
                variants={fadeUp}
                className="mb-5 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] sm:text-[3.5rem]"
              >
                Phần mềm quản lý bán hàng
                <span className="block text-indigo-600 dark:text-indigo-400">phổ biến nhất</span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="mb-8 max-w-sm text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Hệ thống quản lý ứng dụng hiện đại và hiệu quả, giúp doanh nghiệp F&amp;B phát triển bền vững.
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={fadeUp} className="mb-10 flex flex-wrap items-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="h-11 bg-indigo-600 hover:bg-indigo-500 px-7 text-sm font-semibold shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/40 rounded-lg">
                    Dùng thử miễn phí
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-11 border-gray-400 dark:border-gray-600 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 px-7 text-sm rounded-lg">
                    Khám phá
                  </Button>
                </Link>
              </motion.div>

              {/* Stats — clean white cards, large blue number */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                {HERO_STATS.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                      border border-gray-200/60 dark:border-gray-700/60
                      shadow-md shadow-gray-100/80 dark:shadow-gray-950/40
                      px-6 py-4 min-w-[160px]"
                  >
                    <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">{s.value}</p>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-snug">{s.label}</p>
                  </div>
                ))}
              </motion.div>

            </motion.div>

            {/* RIGHT: Feature cards 2×2 grid over blurred image */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full max-w-[340px]">
                {HERO_CARDS.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.45 + i * 0.11, ease: "easeOut" }}
                      className="flex flex-col gap-3 rounded-2xl p-4
                        bg-white/88 dark:bg-gray-900/88 backdrop-blur-lg
                        border border-white/70 dark:border-gray-700/50
                        shadow-xl shadow-gray-200/60 dark:shadow-gray-950/50
                        hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", card.iconBg)}>
                        <Icon className={cn("h-4 w-4", card.iconColor)} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">{card.title}</p>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{card.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-28 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600 mb-3 tracking-widest uppercase">Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold sm:text-4xl mb-4 text-gray-900 dark:text-white">Everything your business needs</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built for food &amp; beverage businesses of all sizes — from single-location cafes to multi-branch chains.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-100 dark:hover:shadow-indigo-900/30 transition-all duration-300"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/40 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors">
                    <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ BANNER SPLIT SECTION ════════════════════════════════════════════ */}
      <section className="relative py-20 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-100 dark:shadow-gray-900/50">
            <div className="absolute inset-0 z-0">
              <Image src="/images/banner.jpg" alt="Store" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/50 dark:from-gray-950 dark:via-gray-950/90 dark:to-gray-950/60" />
            </div>

            <div className="relative z-10 grid gap-8 px-10 py-16 md:grid-cols-2 md:items-center">
              <div>
                <Badge className="mb-4 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Made for F&amp;B</Badge>
                <h2 className="text-3xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-white">
                  From the counter<br />to the cloud
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Whether you run a coffee shop, bakery, or restaurant chain — POS System gives your team
                  the tools to serve faster, manage smarter, and grow confidently.
                </p>
                <div className="flex flex-col gap-2">
                  {["Instant order processing with QR & NFC", "Inventory auto-reorder when stock is low", "Daily sales report delivered to your inbox"].map((t) => (
                    <div key={t} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Orders Today",    value: "284",    sub: "+5.1% vs yesterday", bg: "bg-blue-50   border-blue-100   dark:bg-blue-900/30   dark:border-blue-800",   val: "text-blue-700   dark:text-blue-400"   },
                  { label: "Gross Revenue",   value: "$4,280", sub: "+12% this week",      bg: "bg-green-50  border-green-100  dark:bg-green-900/30  dark:border-green-800",  val: "text-green-700  dark:text-green-400"  },
                  { label: "Active Products", value: "142",    sub: "8 low stock alerts",  bg: "bg-amber-50  border-amber-100  dark:bg-amber-900/30  dark:border-amber-800",  val: "text-amber-700  dark:text-amber-400"  },
                  { label: "Team Members",    value: "12",     sub: "3 roles assigned",    bg: "bg-purple-50 border-purple-100 dark:bg-purple-900/30 dark:border-purple-800", val: "text-purple-700 dark:text-purple-400" },
                ].map((c) => (
                  <div key={c.label} className={cn("rounded-xl border p-4", c.bg)}>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{c.label}</p>
                    <p className={cn("text-xl font-extrabold", c.val)}>{c.value}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-28 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600 mb-3 tracking-widest uppercase">Pricing</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold sm:text-4xl mb-4 text-gray-900 dark:text-white">Simple, transparent pricing</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              No hidden fees. Upgrade, downgrade, or cancel anytime.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid gap-6 md:grid-cols-3">
            {mockSubscriptions.map((plan, i) => {
              const isPopular = i === 1;
              return (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-7",
                    isPopular
                      ? "border-indigo-300 bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900 scale-[1.03] shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-white text-indigo-600 px-4 py-1 text-xs font-bold shadow-sm border border-indigo-100">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <p className={cn("text-base font-semibold mb-2", isPopular ? "text-indigo-100" : "text-gray-900 dark:text-white")}>{plan.planName}</p>
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-4xl font-extrabold", isPopular ? "text-white" : "text-gray-900 dark:text-white")}>{formatCurrency(plan.price)}</span>
                      <span className={cn("text-sm", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>/{plan.billingCycle}</span>
                    </div>
                    <p className={cn("text-xs mt-2", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>
                      {plan.maxUsers === -1 ? "Unlimited users" : `Up to ${plan.maxUsers} users`}
                      {" · "}
                      {plan.maxProducts === -1 ? "Unlimited products" : `${plan.maxProducts.toLocaleString()} products`}
                    </p>
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-7">
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
                        "w-full font-semibold",
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
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-indigo-600 px-10 py-16 text-center shadow-2xl shadow-indigo-200"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -right-20 bottom-10 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
            </div>
            <div className="relative">
              <Badge className="mb-5 border-white/20 bg-white/10 text-white">14-day free trial · No credit card</Badge>
              <h2 className="text-3xl font-extrabold sm:text-4xl mb-4 text-white">Ready to grow your business?</h2>
              <p className="text-indigo-100 mb-8 max-w-md mx-auto">
                Join thousands of F&amp;B businesses using POS System to run smarter operations every day.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-8 font-semibold shadow-lg">
                    Start free trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-12 border-white/30 bg-white/10 text-white hover:bg-white/20 px-8">
                    Sign in instead
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
