"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, HelpCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ApiSubscription } from "@/types";

/** Trùng default với `src/lib/api.ts` — public `GET /subscriptions` không cần JWT. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:2999";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Tôi có thể đổi gói sau không?",
    a: "Hoàn toàn có thể. Bạn có thể nâng cấp hoặc hạ cấp bất cứ lúc nào. Thay đổi có hiệu lực ngay lập tức và chúng tôi sẽ tính phí theo tỷ lệ tương ứng.",
  },
  {
    q: "Có dùng thử miễn phí không?",
    a: "Có — mỗi gói đều đi kèm 14 ngày dùng thử miễn phí. Không cần thẻ tín dụng để bắt đầu.",
  },
  {
    q: "Bạn chấp nhận những hình thức thanh toán nào?",
    a: "Chúng tôi chấp nhận tất cả thẻ tín dụng/ghi nợ lớn, chuyển khoản ngân hàng và các ví điện tử phổ biến bao gồm MoMo và ZaloPay.",
  },
  {
    q: "Có giảm giá khi thanh toán hàng năm không?",
    a: "Nếu bạn chọn gói có chu kỳ thanh toán theo năm, mức giá hiển thị đã phản ánh theo gói đó. So sánh các gói trên bảng giá để chọn phương án phù hợp.",
  },
  {
    q: "Điều gì xảy ra khi hết thời gian dùng thử?",
    a: "Bạn sẽ được nhắc chọn một gói phù hợp. Nếu không chọn, tài khoản sẽ chuyển sang chế độ chỉ đọc — dữ liệu của bạn vẫn an toàn.",
  },
  {
    q: "Có phí cài đặt hoặc chi phí ẩn không?",
    a: "Hoàn toàn không. Giá bạn thấy là giá bạn trả. Hỗ trợ đào tạo và cập nhật tính năng đều được bao gồm.",
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Parse description thành danh sách feature (phân cách bởi dấu phẩy / xuống dòng) */
function parseFeatures(description: string | null): string[] {
  if (!description) return [];
  return description
    .split(/[,\n]/)
    .map((f) => f.trim())
    .filter(Boolean);
}

/** "STARTER_MONTHLY" → "Starter Monthly" */
function formatPackageCode(code: string): string {
  return code
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Nhãn kỳ thanh toán bám theo `billing_cycle` từ API (vd. monthly → /tháng). */
function pricePeriodSuffix(billingCycle: string): string {
  const c = billingCycle.toLowerCase();
  if (/(year|annual|yearly|năm)/.test(c)) return "/năm";
  if (/(month|monthly|tháng)/.test(c)) return "/tháng";
  if (/quarter/.test(c)) return "/quý";
  return "";
}

// ─── Plan shape (API subscriptions) ─────────────────────────────────────────
interface PricingPlan {
  id:           string;
  name:         string;
  price:        number;
  billingCycle: string;
  features:     string[];
  description:  string;
}

function fromApi(sub: ApiSubscription): PricingPlan {
  return {
    id:           String(sub.id),
    name:         formatPackageCode(sub.package_code),
    price:        parseFloat(sub.price),
    billingCycle: sub.billing_cycle,
    features:     parseFeatures(sub.description),
    description:  sub.description ?? "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  const [plans, setPlans]               = useState<PricingPlan[]>([]);
  const [trialPlan, setTrialPlan]       = useState<PricingPlan | null>(null);
  const [billingFilter, setBillingFilter] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading]           = useState(true);
  const [isLive, setIsLive]             = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/subscriptions`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data: ApiSubscription[] = await res.json();
          const trial = data.find((s) => s.package_code === 'TRIAL_14_DAYS');
          if (trial) setTrialPlan(fromApi(trial));
          
          const active = data
            .filter((s) => s.is_active && s.package_code !== 'TRIAL_14_DAYS')
            .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          setPlans(active.map(fromApi));
          setIsLive(true);
          return;
        }
      } catch {
        // mạng / CORS / backend tắt
      }
      setPlans([]);
      setIsLive(false);
    }
    load().finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge className="mb-5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 px-4 py-1.5 text-sm font-medium">
                Bảng giá
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mb-5 text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
            >
              Đơn giản,{" "}
              <span className="text-indigo-600 dark:text-indigo-400">minh bạch</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Không phí ẩn. Không bất ngờ. Chọn gói phù hợp và nâng cấp bất cứ lúc nào.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6">

          {/* Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Đang tải gói dịch vụ…
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 px-8 py-16 text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chưa có gói dịch vụ hiển thị
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {isLive
                  ? "Hiện không có gói đang hoạt động. Vui lòng quay lại sau hoặc liên hệ đội ngũ hỗ trợ."
                  : "Không tải được danh sách gói. Kiểm tra kết nối hoặc cấu hình máy chủ, rồi tải lại trang."}
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex justify-center mb-12">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex relative">
                  <button
                    onClick={() => setBillingFilter("monthly")}
                    className={cn(
                      "px-6 py-2.5 rounded-lg text-sm font-bold transition-all z-10",
                      billingFilter === "monthly"
                        ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    Thanh toán hàng tháng
                  </button>
                  <button
                    onClick={() => setBillingFilter("yearly")}
                    className={cn(
                      "px-6 py-2.5 rounded-lg text-sm font-bold transition-all z-10 flex items-center gap-2",
                      billingFilter === "yearly"
                        ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    Thanh toán hàng năm
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 pointer-events-none rounded px-1.5 py-0">Tiết kiệm</Badge>
                  </button>
                </div>
              </div>

              {(() => {
                const displayedPlans = plans.filter((p) => {
                  const c = p.billingCycle.toLowerCase();
                  if (billingFilter === "monthly") return /(month|monthly|tháng)/.test(c);
                  return /(year|annual|yearly|năm)/.test(c);
                });

                if (displayedPlans.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      Chưa có gói dịch vụ {billingFilter === "monthly" ? "hàng tháng" : "hàng năm"} nào được cấu hình.
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={billingFilter}
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                    className={cn(
                      "grid gap-6 items-start",
                      displayedPlans.length === 1 && "max-w-sm mx-auto",
                      displayedPlans.length === 2 && "md:grid-cols-2 max-w-3xl mx-auto",
                      displayedPlans.length >= 3 && "md:grid-cols-3",
                    )}
                  >
                    {displayedPlans.map((plan, i) => {
                      const isPopular = i === Math.floor(displayedPlans.length / 2) && displayedPlans.length > 1;
                      const periodSuffix = pricePeriodSuffix(plan.billingCycle);

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
                          Phổ biến nhất
                        </span>
                      </div>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                      <p className={cn("text-base font-semibold mb-2", isPopular ? "text-indigo-100" : "text-gray-900 dark:text-white")}>
                        {plan.name}
                      </p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={cn("text-4xl font-extrabold", isPopular ? "text-white" : "text-gray-900 dark:text-white")}>
                          {formatCurrency(plan.price)}
                        </span>
                        {periodSuffix && (
                          <span className={cn("text-sm", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>
                            {periodSuffix}
                          </span>
                        )}
                      </div>
                      {plan.description && plan.features.length === 0 && (
                        <p className={cn("text-xs mt-1", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>
                          {plan.description}
                        </p>
                      )}
                      <p className={cn("text-xs mt-1 capitalize", isPopular ? "text-indigo-200" : "text-gray-400 dark:text-gray-500")}>
                        Chu kỳ thanh toán: {plan.billingCycle}
                      </p>
                    </div>

                    {/* Features */}
                    {plan.features.length > 0 && (
                      <ul className="flex-1 space-y-3 mb-8">
                        {plan.features.map((f) => (
                          <li key={f} className={cn("flex items-start gap-2.5 text-sm", isPopular ? "text-indigo-100" : "text-gray-600 dark:text-gray-300")}>
                            <Check className={cn("h-4 w-4 shrink-0 mt-0.5", isPopular ? "text-indigo-200" : "text-green-500")} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className={plan.features.length === 0 ? "mt-auto" : ""}>
                      <Link href={`/onboarding?plan=${plan.id}`}>
                        <Button
                          className={cn(
                            "w-full font-semibold h-11 rounded-xl",
                            isPopular
                              ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white"
                          )}
                        >
                          Bắt đầu
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })()}
        </>
      )}

          {/* Trial note */}
          {!loading && plans.length > 0 && (
            <div className="mt-10 flex justify-center">
              <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                Tất cả gói đều có 14 ngày dùng thử miễn phí · Không cần thẻ tín dụng · Hủy bất cứ lúc nào
              </p>
            </div>
          )}
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
              Chưa chắc gói nào phù hợp?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Khám phá tất cả những gì Lumio cung cấp — rồi chọn gói phù hợp với quy mô doanh nghiệp hiện tại.
              Bạn luôn có thể nâng cấp sau.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/features">
                <Button size="lg" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30">
                  Khám phá tất cả tính năng <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  Liên hệ kinh doanh
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
                Câu hỏi thường gặp
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Không tìm thấy câu trả lời?{" "}
                <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Nhắn tin cho chúng tôi.
                </Link>
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
              <Badge className="mb-5 border-white/20 bg-white/10 text-white">Dùng thử 14 ngày · Không cần thẻ tín dụng</Badge>
              <h2 className="text-3xl font-extrabold sm:text-4xl mb-4 text-white">Sẵn sàng phát triển cùng Lumio?</h2>
              <p className="text-indigo-100 mb-8 max-w-md mx-auto">
                Hơn 300.000 doanh nghiệp đang vận hành thông minh hơn cùng Lumio.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={trialPlan ? `/onboarding?plan=${trialPlan.id}` : "/register"}>
                  <Button size="lg" className="h-12 gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-8 font-semibold shadow-lg">
                    Sử dụng miễn phí ( 14 ngày ) <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-12 border-white/30 bg-white/10 text-white hover:bg-white/20 px-8">
                    Liên hệ kinh doanh
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
