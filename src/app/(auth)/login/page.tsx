"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Layers, Loader2, Check,
  ChevronDown, ChevronUp, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USERS, REDIRECT_MAP, ROLE_LABELS, ROLE_COLORS, ALL_ROLES } from "@/config/roles";
import type { Role } from "@/config/roles";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router      = useRouter();
  const { setRole } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [error,    setError]    = useState("");
  const [demoOpen, setDemoOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const found = Object.entries(MOCK_USERS).find(([, u]) => u.email === email);
    if (!found) {
      setError("Email không tồn tại trong demo.");
      triggerShake();
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const role = found[0] as Role;
    setRole(role);
    router.push(REDIRECT_MAP[role]);
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  function fillDemo(role: Role) {
    setEmail(MOCK_USERS[role].email);
    setPassword("demo123");
    setDemoOpen(false);
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
              {/* Đăng nhập — active */}
              <span className="rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm select-none">
                Đăng nhập
              </span>
              {/* Đăng ký — inactive */}
              <Link href="/register">
                <span className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  Đăng ký
                </span>
              </Link>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chào mừng trở lại</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Đăng nhập vào POS System</p>
            </div>
          </div>

          {/* Form card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl shadow-gray-100/80 dark:shadow-gray-950/50">
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6 space-y-4">

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shake wrapper */}
              <motion.div
                animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
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

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>
              </motion.div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                  <div
                    onClick={() => setRemember(!remember)}
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      remember
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    )}
                  >
                    {remember && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng nhập…
                  </span>
                ) : "Đăng nhập"}
              </Button>

              {/* Demo accounts */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDemoOpen(!demoOpen)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span>🎭 Tài khoản demo</span>
                  {demoOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                <AnimatePresence>
                  {demoOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {ALL_ROLES.map((role) => {
                          const u = MOCK_USERS[role];
                          return (
                            <div key={role} className="flex items-center gap-3 px-4 py-2.5">
                              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", ROLE_COLORS[role])}>
                                {u.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                              </div>
                              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", ROLE_COLORS[role])}>
                                {ROLE_LABELS[role]}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => fillDemo(role)}
                                className="h-6 shrink-0 border-gray-300 dark:border-gray-600 px-2 text-[10px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Dùng
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                🚀 Chế độ demo — mọi mật khẩu đều hoạt động
              </p>
            </form>

            {/* Switch to register */}
            <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
