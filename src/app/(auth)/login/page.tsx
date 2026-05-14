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
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

const BRAND = "#5B4EE8";

const FEATURES = [
  "Quản lý đơn hàng realtime",
  "Báo cáo doanh thu chi tiết",
  "Quản lý kho hàng tự động",
];

export default function LoginPage() {
  const router = useRouter();
  const { setRole, loginAdmin } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [shake, setShake]       = useState(false);
  const [error, setError]       = useState("");
  const [demoOpen, setDemoOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ── Đăng nhập admin qua backend (CORS đã bật, gọi thẳng) ────────────────
      const res = await adminService.login(email, password);
      loginAdmin(res.accessToken, res.admin);
      toast.success("Đăng nhập thành công", {
        description: `Chào mừng trở lại, ${res.admin?.email ?? "Admin"}!`,
      });
      router.push("/dashboard");
    } catch (apiErr: unknown) {
      const msg = apiErr instanceof Error ? apiErr.message : "";

      // Network error (backend offline) → fallback mock demo
      const isNetworkError =
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("network") ||
        msg.toLowerCase().includes("fetch");

      if (isNetworkError) {
        const found = Object.entries(MOCK_USERS).find(([, u]) => u.email === email);
        if (!found) {
          setError("Backend đang offline. Email không có trong tài khoản demo.");
          triggerShake();
          setLoading(false);
          return;
        }
        await new Promise((r) => setTimeout(r, 600));
        const role = found[0] as Role;
        setRole(role);
        router.push(REDIRECT_MAP[role]);
      } else {
        // Lỗi từ backend: sai mật khẩu, tài khoản bị khoá, v.v.
        setError(msg || "Email hoặc mật khẩu không đúng.");
        triggerShake();
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
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
    <div className="relative flex min-h-screen flex-col overflow-hidden">

      {/* ── Video background ─────────────────────────────────────────────── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_074327_a4d6275d-82d9-4c83-bfbe-f1fb2213c17c.mp4"
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <AuthNavbar />

        <main className="flex flex-1 items-center justify-center px-6 pt-24 pb-12">
          <div className="mx-auto w-full max-w-5xl flex items-center gap-14">

            {/* ── LEFT: Branding ───────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden lg:block flex-1"
            >
              <h2 className="text-4xl font-extrabold leading-tight mb-4 text-white drop-shadow-md">
                Quản lý bán hàng<br />thông minh
              </h2>
              <p className="text-white/70 text-base leading-relaxed mb-10 max-w-xs">
                Nền tảng F&amp;B hiện đại, từ đơn hàng đến báo cáo.
              </p>
              <ul className="space-y-4">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-white/85 text-sm font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ── RIGHT: Login card ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-[420px] shrink-0"
            >
              <div className="rounded-2xl bg-indigo-600 dark:bg-indigo-600/95 shadow-2xl shadow-indigo-300/30 dark:shadow-indigo-950/40 overflow-hidden">

                {/* Card header */}
                <div className="px-8 pt-8 pb-6 border-b border-indigo-500/50">
                  <h1 className="text-xl font-bold text-white">Đăng nhập</h1>
                  <p className="mt-0.5 text-sm text-indigo-200">Đăng nhập vào Lumio</p>
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
                        className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2.5 text-sm text-red-100 overflow-hidden"
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
                        <Label className="text-sm font-medium text-indigo-100">Email</Label>
                        <Input
                          type="email"
                          placeholder="you@lumio.app"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 rounded-lg border-indigo-400/60 bg-indigo-500/40 text-white placeholder:text-indigo-300 focus-visible:ring-white/40 focus-visible:border-white/60"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-indigo-100">Mật khẩu</Label>
                        <div className="relative">
                          <Input
                            type={showPw ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 rounded-lg border-indigo-400/60 bg-indigo-500/40 text-white placeholder:text-indigo-300 pr-10 focus-visible:ring-white/40 focus-visible:border-white/60"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition-colors"
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Remember + Forgot */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-indigo-200 cursor-pointer select-none">
                        <div
                          onClick={() => setRemember(!remember)}
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            remember ? "border-white bg-white" : "border-indigo-400/60 bg-indigo-500/30"
                          )}
                        >
                          {remember && <Check className="h-2.5 w-2.5 text-indigo-600" />}
                        </div>
                        Ghi nhớ đăng nhập
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-indigo-200 hover:text-white transition-colors"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-50 text-sm shadow-sm"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang đăng nhập…
                        </span>
                      ) : "Đăng nhập"}
                    </Button>

                    {/* Demo accounts */}
                    <div className="rounded-xl border border-indigo-400/40 bg-indigo-500/30 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setDemoOpen(!demoOpen)}
                        className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-indigo-200 hover:text-white hover:bg-indigo-600/50 transition-colors"
                      >
                        <span>🎭 Tài khoản demo (offline)</span>
                        {demoOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <AnimatePresence>
                        {demoOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden border-t border-indigo-500/50"
                          >
                            <div className="divide-y divide-indigo-500/30">
                              {ALL_ROLES.map((role) => {
                                const u = MOCK_USERS[role];
                                return (
                                  <div key={role} className="flex items-center gap-3 px-4 py-2.5">
                                    <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", ROLE_COLORS[role])}>
                                      {u.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                                      <p className="text-[10px] text-indigo-300 truncate">{u.email}</p>
                                    </div>
                                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", ROLE_COLORS[role])}>
                                      {ROLE_LABELS[role]}
                                    </span>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => fillDemo(role)}
                                      className="h-6 shrink-0 border-indigo-400/50 bg-indigo-600/50 px-2 text-[10px] text-white hover:bg-indigo-500/60"
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

                    <p className="text-center text-[11px] text-indigo-300">
                      Admin thật: dùng tài khoản từ backend. Demo: mọi mật khẩu đều hoạt động.
                    </p>
                  </form>
                </div>

                {/* Card footer */}
                <div className="border-t border-indigo-500/50 px-8 py-4 text-center text-sm text-indigo-200">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="font-semibold text-white hover:opacity-80 transition-opacity">
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
