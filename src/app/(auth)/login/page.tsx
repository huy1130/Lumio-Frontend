"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { useAuth } from "@/context/AuthContext";
import { getRedirectByRoleId, REDIRECT_MAP } from "@/config/roles";
import { cn } from "@/lib/utils";
import { adminLogin, userLogin } from "@/lib/auth-service";
import { ensureShopSetup } from "@/lib/ensure-shop-setup";
import { resolveTenantShops } from "@/lib/resolve-tenant-shop";
import { toast } from "sonner";

const FEATURES = [
  "Quản lý đơn hàng realtime",
  "Báo cáo doanh thu chi tiết",
  "Quản lý kho hàng tự động",
];

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = isAdminLogin
        ? await adminLogin(identifier.trim(), password)
        : await userLogin(identifier.trim(), password);

      let user = response.user;
      setSession(response.accessToken, user);

      if (!isAdminLogin) {
        try {
          const resolved = await resolveTenantShops(user);
          user = resolved.user;
          setSession(response.accessToken, user);

          const shopResult = await ensureShopSetup(user);
          if (shopResult.status === "created") {
            user = shopResult.user;
            setSession(response.accessToken, user);
            toast.success("Đăng nhập thành công — đã tạo cửa hàng");
          } else if (shopResult.status === "already_exists") {
            toast.success("Đăng nhập thành công — cửa hàng đã được thiết lập");
            router.push("/shop");
            return;
          } else if (shopResult.status === "needs_setup") {
            toast.success("Đăng nhập thành công");
            router.push("/shop");
            return;
          } else {
            toast.success("Đăng nhập thành công");
          }
        } catch (shopErr) {
          const shopMessage =
            shopErr instanceof Error ? shopErr.message : "Không thể tạo cửa hàng";
          toast.error(shopMessage);
          router.push("/shop");
          return;
        }
      } else {
        toast.success("Đăng nhập thành công");
      }

      const redirect = user.role_id
        ? getRedirectByRoleId(user.role_id)
        : REDIRECT_MAP[user.role ?? "user"];

      router.push(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
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
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <AuthNavbar />

        <main className="flex flex-1 items-center justify-center px-6 pt-24 pb-12">
          <div className="mx-auto w-full max-w-5xl flex items-center gap-14">
            {/* ── LEFT: Branding text ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden lg:block flex-1"
            >
              <h2 className="text-4xl font-extrabold leading-tight mb-4 text-white drop-shadow-md">
                Quản lý bán hàng
                <br />
                thông minh
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
                    <span className="text-white/85 text-sm font-medium">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ── RIGHT: Indigo card ───────────────────────────────────────── */}
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
                </div>

                {/* Card body */}
                <div className="px-8 py-6">
                  {/* Error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginBottom: 16,
                        }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2.5 text-sm text-red-100 overflow-hidden"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div
                      animate={
                        shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }
                      }
                      transition={{ duration: 0.45 }}
                      className="space-y-4"
                    >
                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-indigo-100">
                          Email hoặc username
                        </Label>
                        <Input
                          type="text"
                          placeholder="you@lumio.app"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          required
                          className="h-11 rounded-lg border-indigo-400/60 bg-indigo-500/40 text-white placeholder:text-indigo-300 focus-visible:ring-white/40 focus-visible:border-white/60"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-indigo-100">
                          Mật khẩu
                        </Label>
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
                            {showPw ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    {/* Forgot Password */}
                    <div className="flex items-center justify-between">
                      <a
                        href="/forgot-password"
                        className="text-sm font-medium text-indigo-200 hover:text-white transition-colors"
                      >
                        Quên mật khẩu?
                      </a>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-indigo-200 cursor-pointer select-none">
                      <div
                        onClick={() => setIsAdminLogin(!isAdminLogin)}
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          isAdminLogin
                            ? "border-white bg-white"
                            : "border-indigo-400/60 bg-indigo-500/30",
                        )}
                      >
                        {isAdminLogin && (
                          <Check className="h-2.5 w-2.5 text-indigo-600" />
                        )}
                      </div>
                      Đăng nhập tài khoản admin
                    </label>

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
                      ) : (
                        "Đăng nhập"
                      )}
                    </Button>
                  </form>
                </div>

                {/* Card footer */}
                <div className="border-t border-indigo-500/50 px-8 py-4 text-center text-sm text-indigo-200">
                  Liên hệ admin nếu gặp sự cố khi đăng nhập.
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
