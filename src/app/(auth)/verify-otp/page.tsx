"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { cn } from "@/lib/utils";

const DEMO_OTP   = "123456";
const OTP_LENGTH = 6;
const RESEND_SEC = 60;

export default function VerifyOtpPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SEC);
  const [shake,     setShake]     = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    setError("");
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      triggerShake();
      return;
    }
    if (code !== DEMO_OTP) {
      setError("Mã OTP không đúng. Vui lòng thử lại.");
      triggerShake();
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 1200));
    router.push(`/new-password?email=${encodeURIComponent(email)}`);
  }

  function handleResend() {
    setCountdown(RESEND_SEC);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  const filled = otp.join("").length;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-900">
      <AuthNavbar />

      <main className="flex flex-1 items-center justify-center px-6 pt-24 pb-12">
        <div className="mx-auto w-full max-w-5xl flex items-center gap-14">

          {/* ── LEFT: Branding ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden lg:block flex-1"
          >
            <h2 className="text-4xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
              Xác nhận<br />danh tính của bạn
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-10 max-w-xs">
              Nhập mã 6 chữ số được gửi đến email của bạn để tiếp tục đặt lại mật khẩu.
            </p>
            <div className="inline-flex items-center gap-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Mã OTP demo: <span className="font-bold tracking-widest">{DEMO_OTP}</span>
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: Card ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[420px] shrink-0"
          >
            <div className="rounded-2xl bg-indigo-600 dark:bg-indigo-600/95 shadow-2xl shadow-indigo-300/30 dark:shadow-indigo-950/40 overflow-hidden">

              <AnimatePresence mode="wait">
                {success ? (
                  /* ── Success state ──────────────────────────────────────── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center gap-5 px-8 py-16 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30"
                    >
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-xl font-bold text-white">Xác nhận thành công!</p>
                      <p className="mt-1.5 text-sm text-indigo-200">
                        Đang chuyển đến trang đặt mật khẩu mới…
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Form ────────────────────────────────────────────────── */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    {/* Card header */}
                    <div className="px-8 pt-8 pb-6 border-b border-indigo-500/50">
                      <h1 className="text-xl font-bold text-white">Nhập mã OTP</h1>
                      <p className="mt-0.5 text-sm text-indigo-200">
                        Mã đã được gửi đến{" "}
                        <span className="font-semibold text-white truncate">{email || "email của bạn"}</span>
                      </p>
                    </div>

                    {/* Card body */}
                    <div className="px-8 py-6">

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2.5 text-sm text-red-100 overflow-hidden"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleSubmit} className="space-y-5">

                        {/* OTP boxes */}
                        <div className="space-y-2">
                          <motion.div
                            animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                            transition={{ duration: 0.45 }}
                            className="flex gap-2 justify-center"
                            onPaste={handlePaste}
                          >
                            {otp.map((digit, i) => (
                              <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className={cn(
                                  "h-12 w-11 rounded-lg border text-center text-xl font-bold text-white bg-indigo-500/40 transition-all outline-none",
                                  digit
                                    ? "border-white/70 bg-indigo-500/60"
                                    : "border-indigo-400/60",
                                  "focus:border-white focus:ring-2 focus:ring-white/30"
                                )}
                              />
                            ))}
                          </motion.div>

                          {/* Progress dots */}
                          <div className="flex justify-center gap-1.5 pt-1">
                            {otp.map((d, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1 w-6 rounded-full transition-all duration-200",
                                  i < filled ? "bg-white" : "bg-indigo-400/40"
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Submit */}
                        <Button
                          type="submit"
                          disabled={loading || filled < OTP_LENGTH}
                          className="w-full h-11 rounded-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-50 text-sm shadow-sm disabled:opacity-40"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang xác nhận…
                            </span>
                          ) : "Xác nhận OTP"}
                        </Button>

                        {/* Resend */}
                        <div className="text-center">
                          {countdown > 0 ? (
                            <p className="text-sm text-indigo-300">
                              Gửi lại mã sau{" "}
                              <span className="font-semibold text-white tabular-nums">{countdown}s</span>
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResend}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Gửi lại mã OTP
                            </button>
                          )}
                        </div>

                        <p className="text-center text-[11px] text-indigo-300">
                          Demo — OTP hợp lệ: <span className="font-semibold text-white tracking-widest">{DEMO_OTP}</span>
                        </p>

                      </form>
                    </div>

                    {/* Card footer */}
                    <div className="border-t border-indigo-500/50 px-8 py-4 text-center text-sm text-indigo-200">
                      <Link
                        href="/forgot-password"
                        className="inline-flex items-center gap-1.5 font-semibold text-white hover:opacity-80 transition-opacity"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Đổi email khác
                      </Link>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
