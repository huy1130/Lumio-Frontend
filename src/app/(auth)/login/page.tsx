"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Loader2, Check,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USERS, REDIRECT_MAP, ROLE_LABELS, ROLE_COLORS, ALL_ROLES } from "@/config/roles";
import type { Role } from "@/config/roles";
import { cn } from "@/lib/utils";

const BRAND = "#5B4EE8";

const FEATURES = [
  "Quản lý đơn hàng realtime",
  "Báo cáo doanh thu chi tiết",
  "Quản lý kho hàng tự động",
];

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
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: BRAND }}>
      <AuthNavbar />

      {/* ── Full-page purple background with floating card ──────────────── */}
      <main className="flex flex-1 items-center justify-center px-6 pt-24 pb-12">
        <div className="mx-auto w-full max-w-5xl flex items-center gap-14">

          {/* ── LEFT: Branding text ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden lg:block flex-1 text-white"
          >
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Quản lý bán hàng<br />thông minh
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-10 max-w-xs">
              Nền tảng F&amp;B hiện đại, từ đơn hàng đến báo cáo.
            </p>
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── RIGHT: Floating card ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[420px] shrink-0"
          >
            <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">

              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Đăng nhập</h1>
                <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">Đăng nhập vào Lumio</p>
              </div>

              {/* Card body */}
              <div className="px-8 py-6">

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 text-sm text-red-700 dark:text-red-400 overflow-hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-4"
                  >
                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                      <Input
                        type="email"
                        placeholder="you@lumio.app"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-[#F5F6FA] dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-[#5B4EE8]"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</Label>
                      <div className="relative">
                        <Input
                          type={showPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-[#F5F6FA] dark:bg-gray-800 pr-10 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-[#5B4EE8]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                      <div
                        onClick={() => setRemember(!remember)}
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          remember ? "border-[#5B4EE8] bg-[#5B4EE8]" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        )}
                      >
                        {remember && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      Ghi nhớ đăng nhập
                    </label>
                    <button type="button" className="text-sm font-medium hover:opacity-75 transition-opacity" style={{ color: BRAND }}>
                      Quên mật khẩu?
                    </button>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-lg font-semibold text-white text-sm"
                    style={{ backgroundColor: BRAND }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang đăng nhập…
                      </span>
                    ) : "Đăng nhập"}
                  </Button>

                  {/* Demo accounts */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F5F6FA] dark:bg-gray-800/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDemoOpen(!demoOpen)}
                      className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
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
                          transition={{ duration: 0.22 }}
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
                                    <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                                  </div>
                                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", ROLE_COLORS[role])}>
                                    {ROLE_LABELS[role]}
                                  </span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fillDemo(role)}
                                    className="h-6 shrink-0 border-gray-300 dark:border-gray-600 px-2 text-[10px] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

                  <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                    🚀 Chế độ demo — mọi mật khẩu đều hoạt động
                  </p>
                </form>
              </div>

              {/* Card footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 px-8 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="font-semibold hover:opacity-75 transition-opacity" style={{ color: BRAND }}>
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
