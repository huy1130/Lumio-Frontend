"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  Coffee,
  MapPin,
  Phone,
  Store,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { mockSubscriptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const BRAND = "#5B4EE8";

const STAFF_OPTIONS = [
  { value: "1-3", label: "1 – 3 người" },
  { value: "4-10", label: "4 – 10 người" },
  { value: "11+", label: "Hơn 10 người" },
];

const fadeSlide = {
  initial: { opacity: 0, x: 24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
  exit: { opacity: 0, x: -24, transition: { duration: 0.25 } },
};

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Thông tin quán", "Xác nhận gói", "Hoàn tất"];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mx-2 mb-5 transition-colors duration-300",
                  done ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan") ?? "2";
  const planCycle = searchParams.get("cycle") ?? "monthly";
  const isAnnual = planCycle === "annual";

  const plan =
    mockSubscriptions.find((p) => p.id === planId) ?? mockSubscriptions[1];
  const displayPrice = isAnnual ? Math.round(plan.price * 0.8) : plan.price;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [staff, setStaff] = useState("");

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleShopInfo(e: React.FormEvent) {
    e.preventDefault();
    setStep(1);
  }

  async function handlePayment() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setStep(2);
    await new Promise((r) => setTimeout(r, 2200));
    router.push("/login");
  }

  const canSubmitInfo =
    shopName.trim() !== "" && phone.trim() !== "" && address.trim() !== "";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: BRAND }}
    >
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-8 py-5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Coffee className="h-4 w-4 text-white" />
        </div>
        <span className="text-white font-bold text-base tracking-tight">
          Lumio
        </span>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="mx-auto w-full max-w-5xl flex items-start gap-14">
          {/* LEFT: context text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col flex-1 text-white pt-2"
          >
            <Badge className="mb-5 w-fit bg-white/15 text-white border-white/20 text-xs">
              Thiết lập cửa hàng
            </Badge>
            <h2 className="text-3xl font-extrabold leading-tight mb-4">
              Chỉ vài bước nữa
              <br />
              để bắt đầu kinh doanh
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-10 max-w-xs">
              Thiết lập xong trong vòng 2 phút. Sau đó bạn có thể bắt đầu quản
              lý quán cà phê của mình ngay lập tức.
            </p>

            {/* Plan summary sidebar */}
            <div className="rounded-2xl bg-white/10 border border-white/15 p-5 max-w-xs">
              <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-3">
                Gói đã chọn
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-extrabold text-white">
                  {formatCurrency(displayPrice)}
                </span>
                <span className="text-sm text-white/60">/tháng</span>
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                {plan.planName}
              </p>
              {isAnnual && (
                <span className="text-xs bg-green-400/20 text-green-300 rounded-full px-2 py-0.5 font-medium">
                  Thanh toán hàng năm · Tiết kiệm 20%
                </span>
              )}
              <ul className="mt-4 space-y-2">
                {plan.features.slice(0, 3).map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs text-white/75"
                  >
                    <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* RIGHT: card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-[460px] shrink-0"
          >
            <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
              {/* Card header */}
              <div className="px-8 pt-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                {step < 2 && (
                  <Link
                    href="/"
                    className="
        inline-flex items-center gap-2
        px-4 py-2
        text-sm font-medium
        rounded-lg
        bg-gray-100 dark:bg-gray-800
        text-gray-600 dark:text-gray-300
        hover:bg-indigo-600
        hover:text-white
        active:scale-95
        transition-all duration-200
        shadow-sm hover:shadow-md
        mb-5
      "
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại bảng giá
                  </Link>
                )}

                <Steps current={step} />
              </div>

              {/* Card body */}
              <div className="px-8 py-7">
                <AnimatePresence mode="wait">
                  {/* ── STEP 0: Thông tin quán ──────────────────────────── */}
                  {step === 0 && (
                    <motion.form
                      key="step0"
                      {...fadeSlide}
                      onSubmit={handleShopInfo}
                      className="space-y-4"
                    >
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Thông tin quán cà phê
                        </h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Chúng tôi sẽ thiết lập không gian làm việc của bạn.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tên quán <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="VD: Cà Phê Lumio"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                            className="pl-9 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="0901 234 567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="pl-9 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Địa chỉ quán <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="pl-9 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Số lượng nhân viên
                          <span className="text-gray-400 font-normal">
                            (tùy chọn)
                          </span>
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {STAFF_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setStaff(opt.value)}
                              className={cn(
                                "py-2 px-3 rounded-xl border text-sm font-medium transition-all",
                                staff === opt.value
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={!canSubmitInfo}
                        className="w-full h-11 rounded-xl font-semibold text-white disabled:opacity-40 mt-2"
                        style={{ backgroundColor: BRAND }}
                      >
                        Tiếp theo →
                      </Button>
                    </motion.form>
                  )}

                  {/* ── STEP 1: Xác nhận gói ────────────────────────────── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      {...fadeSlide}
                      className="space-y-5"
                    >
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Xác nhận & Thanh toán
                        </h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Kiểm tra lại thông tin trước khi thanh toán.
                        </p>
                      </div>

                      {/* Shop summary */}
                      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Thông tin quán
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Store className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="font-medium">{shopName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone className="h-4 w-4 shrink-0" />
                          {phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-4 w-4 shrink-0" />
                          {address}
                        </div>
                      </div>

                      {/* Plan summary */}
                      <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/30 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                              Gói dịch vụ
                            </p>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {plan.planName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {isAnnual
                                ? "Thanh toán hàng năm"
                                : "Thanh toán hàng tháng"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                              {formatCurrency(displayPrice)}
                            </p>
                            <p className="text-xs text-gray-400">/tháng</p>
                          </div>
                        </div>
                        {isAnnual && (
                          <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800/50 flex justify-between text-sm">
                            <span className="text-gray-500">
                              Tổng thanh toán hôm nay
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(displayPrice * 12)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Mock payment method */}
                      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Demo · Thanh toán mô phỏng
                          </p>
                          <p className="text-xs text-gray-400">
                            Không cần thẻ thật trong môi trường demo
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5 font-medium">
                          Sẵn sàng
                        </span>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 rounded-xl"
                          onClick={() => setStep(0)}
                          disabled={loading}
                        >
                          ← Quay lại
                        </Button>
                        <Button
                          className="flex-2 h-11 rounded-xl font-semibold text-white flex-1"
                          style={{ backgroundColor: BRAND }}
                          onClick={handlePayment}
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang xử lý…
                            </span>
                          ) : (
                            "Xác nhận thanh toán"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Hoàn tất ────────────────────────────────── */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center gap-5"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: 0.1,
                        }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 ring-4 ring-green-200 dark:ring-green-800"
                      >
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                      </motion.div>

                      <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          Thanh toán thành công!
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Đang thiết lập không gian làm việc cho{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {shopName}
                          </span>
                          …
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang chuyển hướng đến dashboard…
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
