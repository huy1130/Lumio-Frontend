"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Check,
  CreditCard,
  Loader2,
  Store,
  ArrowLeft,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ApiSubscription } from "@/types";
import { savePendingShop } from "@/lib/pending-shop";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const BRAND = "#5B4EE8";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:2999";

const getBankName = (bin: string) => {
  const map: Record<string, string> = {
    "970422": "MBBank",
    "970436": "Vietcombank",
    "970415": "VietinBank",
    "970418": "BIDV",
    "970405": "Agribank",
    "970407": "Techcombank",
    "970416": "ACB",
    "970432": "VPBank",
    "970423": "TPBank",
  };
  return map[bin] || bin;
};

function pricePeriodSuffix(billingCycle: string): string {
  const c = billingCycle.toLowerCase();
  if (/(year|annual|yearly|năm)/.test(c)) return "/năm";
  if (/(month|monthly|tháng)/.test(c)) return "/tháng";
  if (/quarter/.test(c)) return "/quý";
  return "";
}

// ─── Plan shape ────────────────────────────────────────────────────────────────
interface Plan {
  id: number;
  name: string;
  price: number;
  billingCycle: string;
  packageCode: string;
  features: string[];
}

function parseFeatures(desc: string | null): string[] {
  if (!desc) return [];
  return desc.split(/[,\n]/).map((f) => f.trim()).filter(Boolean);
}

function formatCode(code: string): string {
  return code
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ─── Stepper ───────────────────────────────────────────────────────────────────
const STEPS = ["Thiết lập tài khoản", "Xác nhận & Thanh toán"];

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
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
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mx-2 mb-5 transition-colors duration-300",
                  done ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const fadeSlide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// ─── Page Content ──────────────────────────────────────────────────────────────
import { Suspense } from "react";

function OnboardingContent() {
  const router = useRouter();
  const params = useSearchParams();

  const planId = params.get("plan") ?? "";

  // ── Fetch plan từ backend (public GET /subscriptions, giống trang pricing) ──
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState(false);

  useEffect(() => {
    if (!planId) {
      setPlanLoading(false);
      setPlanError(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/subscriptions`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("fetch failed");
        const list: ApiSubscription[] = await res.json();
        const found = list
          .filter((s) => s.is_active)
          .find((s) => String(s.id) === planId);
        if (cancelled) return;
        if (found) {
          setPlan({
            id: found.id,
            name: formatCode(found.package_code),
            price: parseFloat(found.price),
            billingCycle: found.billing_cycle,
            packageCode: found.package_code,
            features: parseFeatures(found.description),
          });
          setPlanError(false);
        } else {
          setPlan(null);
          setPlanError(true);
        }
      } catch {
        if (!cancelled) {
          setPlan(null);
          setPlanError(true);
        }
      } finally {
        if (!cancelled) setPlanLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planId]);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Các trường gửi lên POST /api/checkout/initiate (proxy → Nest subscriptions/purchase/initiate)
  const [tenantName, setTenantName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PAYOS' | 'CASH' | 'TRIAL'>('PAYOS');

  const isTrialPlan = plan?.packageCode === 'TRIAL_14_DAYS';

  useEffect(() => {
    if (isTrialPlan) {
      setPaymentMethod('TRIAL');
    }
  }, [isTrialPlan]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const step0Valid =
    tenantName.trim().length >= 2 &&
    username.trim().length >= 3 &&
    email.includes("@") &&
    password.length >= 8 &&
    password === confirmPw;

  useEffect(() => {
    if (!paymentData?.orderCode) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/subscriptions/purchase/status/${paymentData.orderCode}`);
        const statusData = await res.json();
        if (statusData?.status === 'PAID') {
          clearInterval(interval);
          toast.success("Thanh toán thành công!");
          router.push("/subscription/success");
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentData?.orderCode, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã copy!");
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  function goToConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPw) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError(null);
    setStep(1);
  }

  async function handlePayment() {
    if (!plan) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: plan.id,
          tenant_name: tenantName,
          username,
          email,
          password,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const m = data?.message;
        setError(
          Array.isArray(m) ? m.join(" ") : (m ?? "Đã có lỗi xảy ra, vui lòng thử lại.")
        );
        return;
      }

      if (data?.isCash || data?.isTrial) {
        savePendingShop({ shop_name: tenantName.trim() });
        setPaymentData({ ...data });
      } else if (data?.qrCode) {
        savePendingShop({ shop_name: tenantName.trim() });
        if (data.orderCode) {
          try {
            sessionStorage.setItem("lumio_payos_order_code", String(data.orderCode));
          } catch {
            /* ignore */
          }
        }
        setPaymentData(data);
      } else if (data?.checkoutUrl) {
        savePendingShop({ shop_name: tenantName.trim() });
        if (data.orderCode) {
          try {
            sessionStorage.setItem("lumio_payos_order_code", String(data.orderCode));
          } catch {
            /* ignore */
          }
        }
        window.location.href = data.checkoutUrl;
      } else {
        setError("Không nhận được link thanh toán. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BRAND }}>

      {/* Top bar — logo giống Navbar / AuthNavbar */}
      <div className="flex items-center px-8 py-5 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <Image
              src="/images/lumio-icon.png"
              alt="Lumio"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </span>
          <span className="text-white font-bold text-base tracking-tight">Lumio</span>
        </Link>
      </div>

      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="mx-auto w-full max-w-5xl flex items-start gap-14">

          {/* ── LEFT sidebar ──────────────────────────────────────────────── */}
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
              Chỉ vài bước nữa<br />để bắt đầu kinh doanh
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-10 max-w-xs">
              Thiết lập xong trong vòng 2 phút. Sau đó bạn có thể bắt đầu quản
              lý cửa hàng của mình ngay lập tức.
            </p>

            {/* Plan card */}
            <div className="rounded-2xl bg-white/10 border border-white/15 p-5 max-w-xs">
              <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-3">
                Gói đã chọn
              </p>

              {planLoading ? (
                <div className="flex items-center gap-2 text-white/60 text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tải gói…
                </div>
              ) : planError || !plan ? (
                <div className="flex items-start gap-2 text-amber-300 text-sm py-1">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Không tìm thấy gói.{" "}
                    <button
                      onClick={() => router.push("/pricing")}
                      className="underline hover:text-white transition-colors"
                    >
                      Quay lại chọn gói
                    </button>
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mb-0.5">
                    <span className="text-2xl font-extrabold text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    {pricePeriodSuffix(plan.billingCycle) && (
                      <span className="text-sm text-white/60">
                        {pricePeriodSuffix(plan.billingCycle)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white mb-0.5">{plan.name}</p>
                  <p className="text-xs text-white/50 mb-3 capitalize">
                    Chu kỳ: {plan.billingCycle}
                  </p>
                  {plan.features.length > 0 && (
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-white/75">
                          <Check className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* ── RIGHT card ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-[480px] shrink-0"
          >
            <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">

              {/* Card header */}
              <div className="px-8 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => (step === 0 ? router.push("/pricing") : setStep(0))}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-600 hover:text-white transition-all duration-200 mb-5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {step === 0 ? "Quay lại bảng giá" : "Quay lại"}
                </button>
                <Stepper current={step} />
              </div>

              {/* Card body */}
              <div className="px-8 py-7">
                <AnimatePresence mode="wait">

                  {/* ── STEP 0: Thiết lập tài khoản ─────────────────────── */}
                  {step === 0 && (
                    <motion.form key="s0" {...fadeSlide} onSubmit={goToConfirm} className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Thiết lập tài khoản
                        </h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Thông tin dùng để tạo cửa hàng và đăng nhập sau khi thanh toán.
                        </p>
                      </div>

                      {/* Tên cửa hàng */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tên cửa hàng <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="VD: Cà Phê Lumio"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            required
                            minLength={2}
                            className="pl-9 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]"
                          />
                        </div>
                      </div>

                      {/* Tên đăng nhập */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tên đăng nhập <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Ít nhất 3 ký tự"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            autoComplete="username"
                            className="pl-9 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="pl-9 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]"
                          />
                        </div>
                      </div>

                      {/* Mật khẩu */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mật khẩu <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPw ? "text" : "password"}
                            placeholder="Ít nhất 8 ký tự"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className="pl-9 pr-10 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {password && password.length < 8 && (
                          <p className="text-xs text-amber-500">Mật khẩu phải có ít nhất 8 ký tự</p>
                        )}
                      </div>

                      {/* Xác nhận mật khẩu */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Xác nhận mật khẩu <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            required
                            autoComplete="new-password"
                            className={cn(
                              "pl-9 pr-10 h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-[#5B4EE8]",
                              confirmPw && confirmPw !== password
                                ? "border-red-400 focus-visible:ring-red-400"
                                : ""
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {confirmPw && confirmPw !== password && (
                          <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>
                        )}
                      </div>

                      {error && (
                        <p className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={!step0Valid || planError || planLoading}
                        className="w-full h-11 rounded-xl font-semibold text-white disabled:opacity-40"
                        style={{ backgroundColor: BRAND }}
                      >
                        Xem lại & Thanh toán →
                      </Button>
                    </motion.form>
                  )}

                  {/* ── STEP 1: Xác nhận & Thanh toán ──────────────────────── */}
                  {step === 1 && !paymentData && (
                    <motion.div key="s1" {...fadeSlide} className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Xác nhận & Thanh toán
                        </h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Kiểm tra lại thông tin trước khi chuyển sang PayOS.
                        </p>
                      </div>

                      {/* Tóm tắt thông tin tài khoản */}
                      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-4 space-y-2">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Thông tin tài khoản
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Store className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">Cửa hàng</span>
                          <span className="font-semibold text-gray-900 dark:text-white truncate">{tenantName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">Đăng nhập</span>
                          <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">Email</span>
                          <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{email}</span>
                        </div>
                      </div>

                      {/* Tóm tắt gói */}
                      {plan && (
                        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/30 p-4">
                          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-2">
                            Gói dịch vụ
                          </p>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{plan.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                                Chu kỳ thanh toán: {plan.billingCycle}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(plan.price)}
                              </p>
                              {pricePeriodSuffix(plan.billingCycle) && (
                                <p className="text-xs text-gray-400">
                                  {pricePeriodSuffix(plan.billingCycle)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Method Selection */}
                      {!isTrialPlan && (
                      <div className="space-y-3 mt-6">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phương thức thanh toán
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <label
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all",
                              paymentMethod === 'PAYOS'
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-500"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">PayOS</p>
                                <p className="text-[10px] text-gray-500">Quét mã QR tự động</p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="paymentMethod"
                              className="sr-only"
                              checked={paymentMethod === 'PAYOS'}
                              onChange={() => setPaymentMethod('PAYOS')}
                            />
                          </label>

                          <label
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all",
                              paymentMethod === 'CASH'
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-500"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 font-bold text-sm">$$</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Tiền mặt</p>
                                <p className="text-[10px] text-gray-500">Chuyển khoản thủ công</p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="paymentMethod"
                              className="sr-only"
                              checked={paymentMethod === 'CASH'}
                              onChange={() => setPaymentMethod('CASH')}
                            />
                          </label>
                        </div>
                      </div>
                      )}

                      {error && (
                        <p className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                        </p>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 rounded-xl"
                          onClick={() => { setStep(0); setError(null); }}
                          disabled={loading}
                        >
                          ← Quay lại
                        </Button>
                        <Button
                          className="flex-1 h-11 rounded-xl font-semibold text-white"
                          style={{ backgroundColor: BRAND }}
                          onClick={handlePayment}
                          disabled={loading || !plan}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang xử lý…
                            </span>
                          ) : isTrialPlan ? "Gửi yêu cầu dùng thử →" : paymentMethod === 'CASH' ? "Gửi yêu cầu thanh toán →" : "Thanh toán qua PayOS →"}
                        </Button>
                      </div>

                      <p className="text-center text-xs text-gray-400 mt-4">
                        Bằng cách thanh toán, bạn đồng ý với{" "}
                        <Link href="#" className="underline hover:text-indigo-600">
                          Điều khoản dịch vụ
                        </Link>{" "}
                        của Lumio.
                      </p>
                    </motion.div>
                  )}

                  {/* ── STEP 1 (Trạng thái hiển thị QR) ──────────────────────── */}
                  {step === 1 && paymentData && !paymentData.isCash && !paymentData.isTrial && (
                    <motion.div key="s1-qr" {...fadeSlide} className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Thanh toán đơn hàng
                        </h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Mở ứng dụng ngân hàng và quét mã QR để thanh toán.
                        </p>
                      </div>

                      <div className="flex justify-center rounded-xl bg-white p-4 shadow-sm border dark:border-gray-700">
                        <QRCodeSVG
                          value={paymentData.qrCode}
                          size={220}
                          level="M"
                          includeMargin={false}
                        />
                      </div>

                      <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-sm">
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-gray-500 dark:text-gray-400">Ngân hàng</span>
                          <span className="font-medium text-right text-gray-900 dark:text-gray-100">{getBankName(String(paymentData.bin))}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-gray-500 dark:text-gray-400">Chủ tài khoản</span>
                          <span className="font-medium text-right text-gray-900 dark:text-gray-100">{paymentData.accountName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-gray-500 dark:text-gray-400">Số tài khoản</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{paymentData.accountNumber}</span>
                            <button onClick={() => copyToClipboard(paymentData.accountNumber)} className="text-indigo-600 hover:text-indigo-500">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-gray-500 dark:text-gray-400">Số tiền</span>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{formatCurrency(paymentData.amount)}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-gray-500 dark:text-gray-400">Nội dung</span>
                          <div className="flex items-center gap-2 text-right">
                            <span className="font-medium text-gray-900 dark:text-gray-100 break-all">{paymentData.description}</span>
                            <button onClick={() => copyToClipboard(paymentData.description)} className="text-indigo-600 hover:text-indigo-500 shrink-0">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                        Hệ thống đang chờ thanh toán...
                      </div>

                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl"
                        onClick={() => { setPaymentData(null); setLoading(false); }}
                      >
                        Hủy thanh toán
                      </Button>
                    </motion.div>
                  )}

                  {/* ── STEP 1 (Trạng thái thanh toán CASH) ──────────────────────── */}
                  {step === 1 && paymentData && paymentData.isCash && (
                    <motion.div key="s1-cash" {...fadeSlide} className="space-y-6 text-center">
                      <div className="flex justify-center mt-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Đã gửi yêu cầu tạo tài khoản!
                        </h3>
                        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                          Yêu cầu thanh toán tiền mặt (hoặc chuyển khoản thủ công) của bạn đã được ghi nhận. 
                          <br/><br/>
                          Vui lòng liên hệ nhân viên sale hoặc thanh toán thủ công. Hệ thống sẽ kích hoạt tài khoản của bạn ngay khi Admin xác nhận đã nhận được tiền.
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-6 text-left space-y-2 text-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Mã đơn hàng: <span className="font-semibold text-gray-900 dark:text-gray-100">{paymentData.orderCode}</span></p>
                        <p className="text-gray-500 dark:text-gray-400">Trạng thái: <span className="font-semibold text-amber-500">Chờ Admin duyệt</span></p>
                      </div>

                      <Button
                        className="w-full h-11 rounded-xl mt-4"
                        variant="outline"
                        onClick={() => router.push("/")}
                      >
                        Về trang chủ
                      </Button>
                    </motion.div>
                  )}

                  {/* ── STEP 1 (Trạng thái TRIAL) ──────────────────────── */}
                  {step === 1 && paymentData && paymentData.isTrial && (
                    <motion.div key="s1-trial" {...fadeSlide} className="space-y-6 text-center">
                      <div className="flex justify-center mt-4">
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Check className="h-8 w-8 text-indigo-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Đã gửi yêu cầu dùng thử!
                        </h3>
                        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                          Yêu cầu sử dụng thử 14 ngày của bạn đã được ghi nhận. 
                          <br/><br/>
                          Vui lòng đợi admin duyệt yêu cầu đó. Hãy kết bạn và gửi màn hình xác nhận này qua <span className="font-semibold text-indigo-600">Zalo: 0326989639</span> để được hỗ trợ nhanh nhất.
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-6 text-left space-y-2 text-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Mã yêu cầu: <span className="font-semibold text-gray-900 dark:text-gray-100">{paymentData.orderCode}</span></p>
                        <p className="text-gray-500 dark:text-gray-400">Trạng thái: <span className="font-semibold text-amber-500">Chờ Admin duyệt</span></p>
                      </div>

                      <Button
                        className="w-full h-11 rounded-xl mt-4"
                        variant="outline"
                        onClick={() => router.push("/")}
                      >
                        Về trang chủ
                      </Button>
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
