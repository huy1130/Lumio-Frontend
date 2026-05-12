"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthNavbar } from "@/components/layout/AuthNavbar";

const FEATURES = [
  "OTP được gửi qua email trong vài giây",
  "Mã OTP có hiệu lực trong 5 phút",
  "Bảo mật tuyệt đối với mã hoá end-to-end",
];

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);

    await new Promise((r) => setTimeout(r, 1200));
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  }

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
              Khôi phục<br />mật khẩu của bạn
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-10 max-w-xs">
              Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
            </p>
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                    <Mail className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{f}</span>
                </li>
              ))}
            </ul>
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
                {sent ? (
                  /* ── Sent state ──────────────────────────────────────────── */
                  <motion.div
                    key="sent"
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
                      <Send className="h-9 w-9 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-xl font-bold text-white">Đã gửi mã OTP!</p>
                      <p className="mt-1.5 text-sm text-indigo-200">
                        Đang chuyển đến trang xác nhận…
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Form ────────────────────────────────────────────────── */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    {/* Card header */}
                    <div className="px-8 pt-8 pb-6 border-b border-indigo-500/50">
                      <h1 className="text-xl font-bold text-white">Quên mật khẩu</h1>
                      <p className="mt-0.5 text-sm text-indigo-200">Nhập email để nhận mã xác nhận</p>
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

                      <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-indigo-100">Địa chỉ email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300 pointer-events-none" />
                            <Input
                              type="email"
                              placeholder="you@lumio.app"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-11 pl-10 rounded-lg border-indigo-400/60 bg-indigo-500/40 text-white placeholder:text-indigo-300 focus-visible:ring-white/40 focus-visible:border-white/60"
                            />
                          </div>
                          <p className="text-xs text-indigo-300">
                            Chúng tôi sẽ gửi mã OTP 6 chữ số đến email này.
                          </p>
                        </div>

                        {/* Submit */}
                        <Button
                          type="submit"
                          disabled={loading || !email.trim()}
                          className="w-full h-11 rounded-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-50 text-sm shadow-sm disabled:opacity-40"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang gửi mã…
                            </span>
                          ) : "Gửi mã xác nhận"}
                        </Button>

                        <p className="text-center text-[11px] text-indigo-300">
                          Demo — OTP mặc định là <span className="font-semibold text-white">123456</span>
                        </p>

                      </form>
                    </div>

                    {/* Card footer */}
                    <div className="border-t border-indigo-500/50 px-8 py-4 text-center text-sm text-indigo-200">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 font-semibold text-white hover:opacity-80 transition-opacity"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Quay lại đăng nhập
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
