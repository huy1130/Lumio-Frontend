"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Layers, Loader2, Check,
  CheckCircle2, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Quá ngắn",   color: "bg-red-500"   },
    { label: "Yếu",        color: "bg-red-400"   },
    { label: "Trung bình", color: "bg-amber-400" },
    { label: "Khá mạnh",   color: "bg-blue-500"  },
    { label: "Mạnh",       color: "bg-green-500" },
  ];
  return { score, ...levels[score] };
}

export default function RegisterPage() {
  const router = useRouter();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [terms,    setTerms]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const strength  = passwordStrength(password);
  const matching  = confirm.length > 0 && confirm === password;
  const canSubmit = name.trim() !== "" && email !== "" && password.length >= 6 && matching && terms;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Layers className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">POS System</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" />
                Trang chủ
              </Button>
            </Link>

            {/* Auth tab pills */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-1">
              {/* Đăng nhập — inactive */}
              <Link href="/login">
                <span className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  Đăng nhập
                </span>
              </Link>
              {/* Đăng ký — active */}
              <span className="rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm select-none">
                Đăng ký
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-24">

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/70 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/50" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-blue-100/50 dark:bg-blue-900/15 blur-3xl" />
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo + heading */}
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo tài khoản</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tham gia POS System ngay hôm nay</p>
            </div>
          </div>

          {/* Form card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl shadow-gray-100/80 dark:shadow-gray-950/50">

            <AnimatePresence mode="wait">
              {success ? (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 px-6 py-16"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 ring-2 ring-green-400"
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">Tài khoản đã được tạo!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đang chuyển hướng đến trang đăng nhập…</p>
                </motion.div>
              ) : (
                /* ── Form ── */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="px-6 pb-6 pt-6 space-y-4"
                >
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Họ và tên</Label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-indigo-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Email</Label>
                    <Input
                      type="email"
                      placeholder="you@pos.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-indigo-500"
                    />
                  </div>

                  {/* Password + strength */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pr-10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    <AnimatePresence>
                      {password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1 overflow-hidden"
                        >
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <motion.div
                                  className={cn("h-full rounded-full", i < strength.score ? strength.color : "")}
                                  initial={{ width: "0%" }}
                                  animate={{ width: i < strength.score ? "100%" : "0%" }}
                                  transition={{ duration: 0.3, delay: i * 0.05 }}
                                />
                              </div>
                            ))}
                          </div>
                          <p className={cn(
                            "text-[10px] font-medium",
                            strength.score <= 1 ? "text-red-500 dark:text-red-400"
                            : strength.score === 2 ? "text-amber-500 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                          )}>
                            {strength.label}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input
                        type={showCf ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        className={cn(
                          "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pr-10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-indigo-500",
                          confirm.length > 0 && (matching ? "border-green-500 dark:border-green-500" : "border-red-400 dark:border-red-500")
                        )}
                      />
                      <div className="absolute right-3 top-2.5">
                        {confirm.length > 0 && matching ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                            <Check className="h-4 w-4 text-green-500" />
                          </motion.div>
                        ) : (
                          <button type="button" onClick={() => setShowCf(!showCf)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                            {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                          className="text-[10px] text-red-500 dark:text-red-400"
                        >
                          Mật khẩu không khớp
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <div
                      onClick={() => setTerms(!terms)}
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        terms
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      )}
                    >
                      {terms && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Tôi đồng ý với{" "}
                      <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2">Điều khoản dịch vụ</button>
                      {" "}và{" "}
                      <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2">Chính sách bảo mật</button>
                    </span>
                  </label>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-40"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tạo tài khoản…
                      </span>
                    ) : "Tạo tài khoản"}
                  </Button>

                  <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                    Demo — quá trình đăng ký được mô phỏng
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Switch to login */}
            {!success && (
              <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Đã có tài khoản?{" "}
                <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
