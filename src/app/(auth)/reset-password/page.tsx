"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { resetPassword } from "@/lib/auth-service";

function passwordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Quá ngắn", color: "bg-red-500" },
    { label: "Yếu", color: "bg-red-400" },
    { label: "Trung bình", color: "bg-amber-400" },
    { label: "Khá mạnh", color: "bg-blue-500" },
    { label: "Mạnh", color: "bg-green-500" },
  ];
  return { score, ...levels[score] };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = passwordStrength(password);
  const matching = confirm.length > 0 && confirm === password;
  const canSubmit = token && password.length >= 8 && matching;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      if (!token) setError("Thiếu token đặt lại mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[62rem] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-xl"
        >
          <div className="grid min-h-[530px] md:grid-cols-2">
            <section className="relative min-h-[280px] overflow-hidden">
              <Image
                src="/images/image1.jpg"
                alt="Coffee shop"
                fill
                priority
                className="object-cover"
              />
            </section>

            <section className="flex items-center px-5 py-7 sm:px-7 md:px-8">
              <div className="w-full">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h1 className="text-2xl font-bold text-slate-800">
                        Password Updated
                      </h1>
                      <p className="mt-2 text-sm text-slate-500">
                        Mật khẩu đã được đặt lại. Đang chuyển về trang đăng
                        nhập.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Tạo mật khẩu mới
                      </h1>
                      <p className="mt-2 text-sm text-slate-500">
                        {token
                          ? "Nhập mật khẩu mới để tiếp tục"
                          : "Thiếu token đặt lại mật khẩu"}
                      </p>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                              marginTop: 0,
                              marginBottom: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: 16,
                              marginBottom: 0,
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                              marginTop: 0,
                              marginBottom: 0,
                            }}
                            className="overflow-hidden rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-600">
                            Mật khẩu mới
                          </Label>
                          <div className="relative">
                            <Input
                              type={showPw ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-10 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-200"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(!showPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                            >
                              {showPw ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          <AnimatePresence>
                            {password.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1.5 overflow-hidden"
                              >
                                <div className="flex gap-1 pt-1">
                                  {[0, 1, 2, 3].map((i) => (
                                    <div
                                      key={i}
                                      className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200"
                                    >
                                      <motion.div
                                        className={cn(
                                          "h-full rounded-full",
                                          i < strength.score
                                            ? strength.color
                                            : "",
                                        )}
                                        initial={{ width: "0%" }}
                                        animate={{
                                          width:
                                            i < strength.score ? "100%" : "0%",
                                        }}
                                        transition={{
                                          duration: 0.3,
                                          delay: i * 0.05,
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <p
                                  className={cn(
                                    "text-xs font-medium",
                                    strength.score <= 1
                                      ? "text-red-500"
                                      : strength.score === 2
                                        ? "text-amber-500"
                                        : "text-green-600",
                                  )}
                                >
                                  {strength.label}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-600">
                            Xác nhận mật khẩu
                          </Label>
                          <div className="relative">
                            <Input
                              type={showCf ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirm}
                              onChange={(e) => setConfirm(e.target.value)}
                              required
                              className={cn(
                                "h-11 rounded-xl border-slate-200 bg-slate-50 pr-10 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-200",
                                confirm.length > 0 &&
                                  (matching
                                    ? "border-green-300"
                                    : "border-red-300"),
                              )}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {confirm.length > 0 && matching ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                  }}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </motion.div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowCf(!showCf)}
                                  className="text-slate-400 transition-colors hover:text-slate-600"
                                >
                                  {showCf ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <AnimatePresence>
                            {confirm.length > 0 && !matching && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xs text-red-500"
                              >
                                Mật khẩu không khớp
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <Button
                          type="submit"
                          disabled={!canSubmit || loading}
                          className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-base font-semibold text-white hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            "Hoàn thành"
                          )}
                        </Button>

                        {/* <a
                          href="/login"
                          className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
                        >
                          Quay lại đăng nhập
                        </a> */}
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
