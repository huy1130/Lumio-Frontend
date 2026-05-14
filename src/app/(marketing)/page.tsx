"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  BarChart3,
  Shield,
  Zap,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockSubscriptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── Hero data ─────────────────────────────────────────────────────────────────
const HERO_STATS = [
  { value: "300.000+", label: "Doanh nghiệp đang sử dụng", icon: Users },
  { value: "10.000+", label: "Người dùng mới mỗi tháng", icon: TrendingUp },
];

const HERO_CARDS = [
  {
    icon: ShoppingCart,
    title: "Quản lý bán hàng",
    desc: "Tạo đơn nhanh, thanh toán đơn giản, chính xác",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    pos: "top-8 left-6",
  },
  {
    icon: Package,
    title: "Quản lý hàng hóa",
    desc: "Theo dõi tồn kho, nhập xuất, cảnh báo hết hàng",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    pos: "top-8 right-6",
  },
  {
    icon: BarChart3,
    title: "Báo cáo doanh thu",
    desc: "Chi tiết, trực quan, cập nhật thời gian thực",
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    pos: "bottom-8 right-6",
  },
  {
    icon: Users,
    title: "Quản lý khách hàng",
    desc: "Lưu trữ thông tin, lịch sử và chăm sóc khách hàng",
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    pos: "bottom-8 left-6",
  },
];

// ─── Features section data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Zap,
    title: "POS thời gian thực",
    desc: "Xử lý giao dịch cực nhanh, đồng bộ tức thì trên mọi thiết bị và chi nhánh.",
  },
  {
    icon: BarChart3,
    title: "Phân tích nâng cao",
    desc: "Góc nhìn sâu về doanh thu, xu hướng tồn kho và hiệu suất nhân viên trong một màn hình.",
  },
  {
    icon: Shield,
    title: "Phân quyền theo vai trò",
    desc: "Quyền truy cập chi tiết cho Quản lý, Admin, Nhân viên và Thu ngân — không chồng chéo.",
  },
  {
    icon: Layers,
    title: "Quản lý tồn kho",
    desc: "Cảnh báo tái nhập tự động, theo dõi đa chi nhánh và lịch sử kiểm kê đầy đủ.",
  },
  {
    icon: TrendingUp,
    title: "Thông tin từ AI",
    desc: "Phân tích dự đoán và gợi ý thông minh giúp tăng doanh thu mỗi ngày.",
  },
  {
    icon: ShoppingCart,
    title: "Đơn hàng đa kênh",
    desc: "Xử lý đặt bàn, mang đi, giao hàng và đơn trực tuyến từ một dashboard duy nhất.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
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
        <div
          className="absolute inset-0 bg-gradient-to-r
          from-white/95 via-white/80 to-white/15
          dark:from-gray-950/95 dark:via-gray-950/80 dark:to-gray-950/15"
        />
        {/* Subtle extra blur on right column */}
        <div className="absolute inset-y-0 right-0 w-2/5 backdrop-blur-[1px]" />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-24
          bg-gradient-to-t from-white dark:from-gray-950 to-transparent"
        />

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
            {/* LEFT: Text content */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="max-w-2xl"
            >
              {/* Heading — all dark, very large */}
              <motion.h1
                variants={fadeUp}
                className="mb-6 text-[3.25rem] sm:text-[4rem] lg:text-[4.5rem] font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
              >
                Phần mềm quản lý bán hàng phổ biến nhất
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="mb-10 max-w-md text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                Hệ thống quản lý ứng dụng hiện đại và hiệu quả, giúp doanh
                nghiệp F&amp;B phát triển bền vững.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={fadeUp}
                className="mb-12 flex flex-wrap items-center gap-4"
              >
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-13 px-9 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/40 rounded-xl"
                  >
                    Liên hệ tư vấn
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-13 px-9 text-base font-semibold border-2 border-indigo-500 dark:border-indigo-400 bg-white/80 dark:bg-gray-900/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl backdrop-blur-sm"
                  >
                    Khám phá
                  </Button>
                </Link>
              </motion.div>

              {/* Stats — large white cards with big blue numbers */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
                {HERO_STATS.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
                      border border-gray-100 dark:border-gray-700/60
                      shadow-lg shadow-gray-100/60 dark:shadow-gray-950/40
                      px-8 py-5 min-w-[200px]"
                  >
                    <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
                      {s.value}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {s.label}
                    </p>
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
                      transition={{
                        duration: 0.5,
                        delay: 0.45 + i * 0.11,
                        ease: "easeOut",
                      }}
                      className="flex flex-col gap-3 rounded-2xl p-4
                        bg-white/88 dark:bg-gray-900/88 backdrop-blur-lg
                        border border-white/70 dark:border-gray-700/50
                        shadow-xl shadow-gray-200/60 dark:shadow-gray-950/50
                        hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl",
                          card.iconBg,
                        )}
                      >
                        <Icon className={cn("h-4 w-4", card.iconColor)} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">
                          {card.title}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                          {card.desc}
                        </p>
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
      <section
        id="features"
        className="relative py-28 bg-gray-50 dark:bg-gray-900 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold text-indigo-600 mb-3 tracking-widest uppercase"
            >
              Tính năng
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-extrabold sm:text-4xl mb-4 text-gray-900 dark:text-white"
            >
              Tất cả những gì doanh nghiệp cần
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
            >
              Được xây dựng cho doanh nghiệp F&amp;B ở mọi quy mô — từ quán cà
              phê đơn lẻ đến chuỗi nhà hàng nhiều chi nhánh.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
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
                  <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
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
              <Image
                src="/images/banner.jpg"
                alt="Store"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/50 dark:from-gray-950 dark:via-gray-950/90 dark:to-gray-950/60" />
            </div>

            <div className="relative z-10 grid gap-8 px-10 py-16 md:grid-cols-2 md:items-center">
              <div>
                <Badge className="mb-4 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Dành cho F&amp;B
                </Badge>
                <h2 className="text-3xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-white">
                  Từ quầy thu ngân
                  <br />
                  đến đám mây
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Dù bạn đang vận hành quán cà phê, tiệm bánh hay chuỗi nhà hàng
                  — Lumio trang bị cho đội ngũ của bạn công cụ để phục vụ nhanh
                  hơn, quản lý thông minh hơn và phát triển tự tin hơn.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    "Xử lý đơn tức thì với QR & NFC",
                    "Tự động tái nhập kho khi hàng sắp hết",
                    "Báo cáo doanh thu hàng ngày gửi thẳng vào hộp thư",
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Orders Today",
                    value: "284",
                    sub: "+5.1% vs yesterday",
                    bg: "bg-blue-50   border-blue-100   dark:bg-blue-900/30   dark:border-blue-800",
                    val: "text-blue-700   dark:text-blue-400",
                  },
                  {
                    label: "Gross Revenue",
                    value: "$4,280",
                    sub: "+12% this week",
                    bg: "bg-green-50  border-green-100  dark:bg-green-900/30  dark:border-green-800",
                    val: "text-green-700  dark:text-green-400",
                  },
                  {
                    label: "Active Products",
                    value: "142",
                    sub: "8 low stock alerts",
                    bg: "bg-amber-50  border-amber-100  dark:bg-amber-900/30  dark:border-amber-800",
                    val: "text-amber-700  dark:text-amber-400",
                  },
                  {
                    label: "Team Members",
                    value: "12",
                    sub: "3 roles assigned",
                    bg: "bg-purple-50 border-purple-100 dark:bg-purple-900/30 dark:border-purple-800",
                    val: "text-purple-700 dark:text-purple-400",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className={cn("rounded-xl border p-4", c.bg)}
                  >
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                      {c.label}
                    </p>
                    <p className={cn("text-xl font-extrabold", c.val)}>
                      {c.value}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {c.sub}
                    </p>
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
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold text-indigo-600 mb-3 tracking-widest uppercase"
            >
              Bảng giá
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-extrabold sm:text-4xl mb-4 text-gray-900 dark:text-white"
            >
              Đơn giản, minh bạch
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
            >
              Không phí ẩn. Nâng cấp, hạ cấp hoặc hủy bất cứ lúc nào.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-3"
          >
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
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all",
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
                    <p
                      className={cn(
                        "text-base font-semibold mb-2",
                        isPopular
                          ? "text-indigo-100"
                          : "text-gray-900 dark:text-white",
                      )}
                    >
                      {plan.planName}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-4xl font-extrabold",
                          isPopular
                            ? "text-white"
                            : "text-gray-900 dark:text-white",
                        )}
                      >
                        {formatCurrency(plan.price)}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          isPopular
                            ? "text-indigo-200"
                            : "text-gray-400 dark:text-gray-500",
                        )}
                      >
                        /{plan.billingCycle}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-xs mt-2",
                        isPopular
                          ? "text-indigo-200"
                          : "text-gray-400 dark:text-gray-500",
                      )}
                    >
                      {plan.maxUsers === -1
                        ? "Unlimited users"
                        : `Up to ${plan.maxUsers} users`}
                      {" · "}
                      {plan.maxProducts === -1
                        ? "Unlimited products"
                        : `${plan.maxProducts.toLocaleString()} products`}
                    </p>
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-7">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={cn(
                          "flex items-start gap-2.5 text-sm",
                          isPopular
                            ? "text-indigo-100"
                            : "text-gray-600 dark:text-gray-300",
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0 mt-0.5",
                            isPopular ? "text-indigo-200" : "text-green-500",
                          )}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact">
                    <Button
                      className={cn(
                        "w-full font-semibold",
                        isPopular
                          ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white",
                      )}
                    >
                      Liên hệ
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
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-indigo-600 px-10 py-16 text-center shadow-2xl shadow-indigo-200"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -right-20 bottom-10 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
            </div>
            <div className="relative">
              <Badge className="mb-5 border-white/20 bg-white/10 text-white">
                Dùng thử 14 ngày · Không cần thẻ tín dụng
              </Badge>
              <h2 className="text-3xl font-extrabold sm:text-4xl mb-4 text-white">
                Sẵn sàng phát triển doanh nghiệp?
              </h2>
              <p className="text-indigo-100 mb-8 max-w-md mx-auto">
                Hàng nghìn doanh nghiệp F&amp;B đang dùng Lumio để vận hành
                thông minh hơn mỗi ngày.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-12 gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-8 font-semibold shadow-lg"
                  >
                    Liên hệ tư vấn <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 border-white/30 bg-white/10 text-white hover:bg-white/20 px-8"
                  >
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
