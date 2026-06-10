"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, BarChart3, Shield, Zap,
  ShoppingCart, Package, Users, TrendingUp,
  Layers, Loader2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ApiSubscription } from "@/types";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── Hero data ─────────────────────────────────────────────────────────────────
const HERO_STATS = [
  { value: "300.000+", label: "Doanh nghiệp đang sử dụng", icon: Users },
  { value: "10.000+", label: "Người dùng mới mỗi tháng", icon: TrendingUp },
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
  { icon: Zap, title: "POS thời gian thực", desc: "Xử lý giao dịch cực nhanh, đồng bộ tức thì trên mọi thiết bị và chi nhánh." },
  { icon: BarChart3, title: "Phân tích nâng cao", desc: "Góc nhìn sâu về doanh thu, xu hướng tồn kho và hiệu suất nhân viên trong một màn hình." },
  { icon: Shield, title: "Phân quyền theo vai trò", desc: "Quyền truy cập chi tiết cho Quản lý, Admin, Nhân viên và Thu ngân — không chồng chéo." },
  { icon: Layers, title: "Quản lý tồn kho", desc: "Cảnh báo tái nhập tự động, theo dõi đa chi nhánh và lịch sử kiểm kê đầy đủ." },
  { icon: TrendingUp, title: "Thông tin từ AI", desc: "Phân tích dự đoán và gợi ý thông minh giúp tăng doanh thu mỗi ngày." },
  { icon: ShoppingCart, title: "Đơn hàng đa kênh", desc: "Xử lý đặt bàn, mang đi, giao hàng và đơn trực tuyến từ một dashboard duy nhất." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
function parseFeatures(description: string | null): string[] {
  if (!description) return [];
  return description.split(/[,\n]/).map((f) => f.trim()).filter(Boolean);
}

function formatPackageCode(code: string): string {
  return code.split(/[_-]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export default function LandingPage() {
  const [plans, setPlans] = useState<ApiSubscription[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/subscriptions")
      .then((r) => (r.ok ? r.json() : []))
      .then((raw: unknown) => {
        const data: ApiSubscription[] = Array.isArray(raw)
          ? raw
          : raw &&
            typeof raw === "object" &&
            Array.isArray((raw as { data?: ApiSubscription[] }).data)
            ? (raw as { data: ApiSubscription[] }).data
            : [];
        setPlans(data.filter((s) => s.is_active !== false));
      })
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  return (
    <>
      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative flex items-center overflow-hidden pt-16 min-h-[88vh]">

        {/* ── Background image ─────────────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 origin-center"
          >
            <Image
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop"
              alt="Hệ thống quản lý quán cà phê hiện đại"
              fill
              priority
              className="object-cover object-center"
            />
          </motion.div>
        </div>

        {/* ── Overlay: Soft gradient ─────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-r
          from-white/90 via-white/50 to-white/5
          dark:from-gray-950/95 dark:via-gray-950/60 dark:to-transparent" />
        
        {/* Soft overall backdrop blur to keep text readable without hiding the image */}
        <div className="absolute inset-0 backdrop-blur-[3px]" />

        {/* Top fade for Navbar visibility */}
        <div className="absolute top-0 inset-x-0 h-40
          bg-gradient-to-b from-white/95 via-white/60 to-transparent
          dark:from-gray-950/95 dark:via-gray-950/60 dark:to-transparent" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32
          bg-gradient-to-t from-white via-white/80 dark:from-gray-950 dark:via-gray-950/80 to-transparent" />

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">

            {/* LEFT: Text content */}
            <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-2xl">

              {/* Heading — gradient text */}
              <motion.h1
                variants={fadeUp}
                className="mb-6 text-[3.25rem] sm:text-[4rem] lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.08] bg-clip-text text-transparent bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-900 dark:from-white dark:via-indigo-200 dark:to-gray-300 drop-shadow-md"
              >
                Nền tảng quản lý bán hàng toàn diện
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="mb-10 max-w-md text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Hệ thống quản lý ứng dụng hiện đại và hiệu quả, giúp doanh nghiệp F&amp;B phát triển bền vững.
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={fadeUp} className="mb-12 flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="group h-14 px-10 text-[15px] font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-indigo-200/50 dark:shadow-indigo-900/40 rounded-2xl transition-all hover:scale-[1.02]">
                    Bắt đầu miễn phí
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-14 px-9 text-[15px] font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 rounded-2xl backdrop-blur-md transition-all">
                    Khám phá tính năng
                  </Button>
                </Link>
              </motion.div>

              {/* Stats — large white cards with big blue numbers */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
                {HERO_STATS.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl
                      border border-white/80 dark:border-gray-700/60
                      shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-gray-950/40
                      px-8 py-6 min-w-[200px] hover:-translate-y-1 transition-transform duration-300"
                  >
                    <p className="text-[2.5rem] font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">{s.value}</p>
                    <div className="mt-3 flex items-center gap-2 text-[13.5px] font-medium text-gray-600 dark:text-gray-400">
                      <s.icon className="h-4 w-4 text-indigo-500" />
                      {s.label}
                    </div>
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
                      transition={{ duration: 0.6, delay: 0.45 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="group flex flex-col gap-3 rounded-[2rem] p-5
                        bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                        border border-white/60 dark:border-gray-700/50
                        shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-gray-950/50
                        hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500"
                    >
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 duration-500", card.iconBg)}>
                        <Icon className={cn("h-5 w-5", card.iconColor)} />
                      </div>
                      <div className="mt-1">
                        <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-snug">{card.title}</p>
                        <p className="mt-1.5 text-[12.5px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
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
            <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600 mb-3 tracking-widest uppercase">Tính năng</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold sm:text-4xl mb-4 text-gray-900 dark:text-white">Tất cả những gì doanh nghiệp cần</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Được xây dựng cho doanh nghiệp F&amp;B ở mọi quy mô — từ quán cà phê đơn lẻ đến chuỗi nhà hàng nhiều chi nhánh.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="group rounded-3xl border-none shadow-[0_2px_20px_rgb(0,0,0,0.03)] dark:shadow-gray-900/50 bg-white dark:bg-gray-800 p-8 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)] transition-all duration-500"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 group-hover:bg-indigo-600 transition-colors duration-500">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-[17px] font-bold mb-3 text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="text-[14.5px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ BANNER SPLIT SECTION ════════════════════════════════════════════ */}
      <section className="relative py-28 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_60px_rgb(0,0,0,0.05)] dark:shadow-gray-900/50 bg-gray-50 dark:bg-gray-900 group">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.div
                whileInView={{ scale: 1.1 }}
                transition={{ duration: 10, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974&auto=format&fit=crop" alt="Thanh toán thông minh tại quầy" fill className="object-cover object-center opacity-90 mix-blend-overlay dark:opacity-40" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/60 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/60" />
            </div>

            <div className="relative z-10 grid gap-12 px-10 py-20 md:grid-cols-2 md:items-center md:px-16">
              <div>
                <Badge className="mb-6 rounded-full border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[13px] font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                  <Sparkles className="mr-2 h-3.5 w-3.5" /> Giải pháp F&amp;B Tối ưu
                </Badge>
                <h2 className="text-[2.5rem] font-extrabold mb-5 leading-[1.15] text-gray-900 dark:text-white tracking-tight">
                  Từ quầy thu ngân<br />đến đám mây
                </h2>
                <p className="text-[16px] text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-medium">
                  Dù bạn đang vận hành quán cà phê, tiệm bánh hay chuỗi nhà hàng — Lumio trang bị
                  cho đội ngũ của bạn công cụ để phục vụ nhanh hơn, quản lý thông minh hơn và phát triển tự tin hơn.
                </p>
                <div className="flex flex-col gap-3.5">
                  {["Xử lý đơn tức thì với QR & NFC", "Tự động tái nhập kho khi hàng sắp hết", "Báo cáo doanh thu tự động gửi qua Email"].map((t) => (
                    <div key={t} className="flex items-center gap-3 text-[15px] font-semibold text-gray-700 dark:text-gray-200">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      </div>
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0">
                {[
                  { label: "Đơn hàng hôm nay", value: "284", sub: "+5.1% so với hôm qua", bg: "bg-white/80 border-white dark:bg-gray-800/80 dark:border-gray-700 shadow-sm backdrop-blur-sm", val: "text-blue-600 dark:text-blue-400" },
                  { label: "Doanh thu", value: "$4,280", sub: "+12% tuần này", bg: "bg-white/80 border-white dark:bg-gray-800/80 dark:border-gray-700 shadow-sm backdrop-blur-sm", val: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Sản phẩm", value: "142", sub: "8 cảnh báo tồn kho", bg: "bg-white/80 border-white dark:bg-gray-800/80 dark:border-gray-700 shadow-sm backdrop-blur-sm", val: "text-amber-600 dark:text-amber-400" },
                  { label: "Nhân viên", value: "12", sub: "3 chi nhánh hoạt động", bg: "bg-white/80 border-white dark:bg-gray-800/80 dark:border-gray-700 shadow-sm backdrop-blur-sm", val: "text-purple-600 dark:text-purple-400" },
                ].map((c) => (
                  <div key={c.label} className={cn("rounded-3xl border p-6 transition-transform hover:-translate-y-1 hover:shadow-md", c.bg)}>
                    <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1">{c.label}</p>
                    <p className={cn("text-[1.75rem] font-extrabold tracking-tight", c.val)}>{c.value}</p>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-2">{c.sub}</p>
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
            <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600 mb-3 tracking-widest uppercase">Bảng giá</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold sm:text-4xl mb-4 text-gray-900 dark:text-white">Đơn giản, minh bạch</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Không phí ẩn. Nâng cấp, hạ cấp hoặc hủy bất cứ lúc nào.
            </motion.p>
          </motion.div>

          {plansLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải gói dịch vụ…
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <p className="text-sm font-medium">Chưa có gói dịch vụ nào.</p>
              <Link href="/pricing" className="text-sm text-indigo-600 hover:underline">Xem trang giá →</Link>
            </div>
          ) : (
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className={cn(
                "grid gap-6",
                plans.length === 1 && "max-w-sm mx-auto",
                plans.length === 2 && "md:grid-cols-2 max-w-3xl mx-auto",
                plans.length >= 3 && "md:grid-cols-3",
              )}
            >
              {plans.map((plan, i) => {
                const isPopular = i === Math.floor(plans.length / 2) && plans.length > 1;
                const features = parseFeatures(plan.description);
                return (
                  <motion.div
                    key={plan.id}
                    variants={fadeUp}
                    className={cn(
                      "relative flex flex-col rounded-[2rem] border p-8 transition-all duration-500",
                      isPopular
                        ? "border-transparent bg-gray-900 dark:bg-gray-800 text-white shadow-[0_20px_50px_rgb(0,0,0,0.15)] scale-[1.04] z-10 overflow-hidden"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)]"
                    )}
                  >
                    {isPopular && (
                      <>
                        {/* Soft glow inside popular card */}
                        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-[50px]" />
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        <div className="absolute top-5 right-5">
                          <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-none font-bold">Phổ biến nhất</Badge>
                        </div>
                      </>
                    )}

                    <div className="mb-7 z-10 relative">
                      <p className={cn("text-lg font-extrabold mb-3 tracking-tight", isPopular ? "text-white" : "text-gray-900 dark:text-white")}>
                        {formatPackageCode(plan.package_code)}
                      </p>
                      <div className="flex items-end gap-1.5">
                        <span className={cn("text-[2.5rem] leading-none font-extrabold", isPopular ? "text-white" : "text-gray-900 dark:text-white")}>
                          {formatCurrency(parseFloat(plan.price))}
                        </span>
                        <span className={cn("text-[15px] font-semibold mb-1", isPopular ? "text-gray-400" : "text-gray-500 dark:text-gray-400")}>
                          /{plan.billing_cycle === 'MONTHLY' ? 'tháng' : 'năm'}
                        </span>
                      </div>
                    </div>

                    {features.length > 0 && (
                      <ul className="flex-1 space-y-3.5 mb-8 z-10 relative">
                        {features.map((f) => (
                          <li key={f} className={cn("flex items-start gap-3 text-[14.5px] font-medium", isPopular ? "text-gray-300" : "text-gray-600 dark:text-gray-300")}>
                            <Check className={cn("h-5 w-5 shrink-0", isPopular ? "text-indigo-400" : "text-indigo-500")} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link href={`/onboarding?plan=${plan.id}&cycle=monthly`} className="z-10 relative mt-auto">
                      <Button
                        className={cn(
                          "w-full h-12 font-bold rounded-xl text-[15px] transition-all",
                          isPopular
                            ? "bg-indigo-500 text-white hover:bg-indigo-400 shadow-md"
                            : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                        )}
                      >
                        Bắt đầu ngay
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 px-10 py-20 text-center shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 top-10 h-[300px] w-[300px] rounded-full bg-indigo-600/30 blur-[80px]" />
              <div className="absolute -right-20 bottom-10 h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-[80px]" />
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            </div>
            <div className="relative z-10">
              <Badge className="mb-6 rounded-full border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-bold text-gray-300">Dùng thử 14 ngày · Không cần thẻ tín dụng</Badge>
              <h2 className="text-[2.5rem] font-extrabold sm:text-5xl mb-5 text-white tracking-tight leading-[1.1]">Sẵn sàng phát triển<br />cùng Lumio?</h2>
              <p className="text-gray-400 text-[16px] font-medium mb-10 max-w-lg mx-auto leading-relaxed">
                Hàng nghìn doanh nghiệp F&amp;B đang vận hành thông minh hơn mỗi ngày. Đăng ký ngay hôm nay.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-400 hover:to-blue-400 px-9 font-bold rounded-2xl shadow-lg transition-transform hover:scale-105">
                    Đăng ký miễn phí <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700 px-9 font-bold rounded-2xl transition-transform hover:scale-105">
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
