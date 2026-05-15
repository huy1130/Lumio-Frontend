"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { useAuth } from "@/context/AuthContext";
import { getRedirectByBackendRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { adminLogin, userLogin } from "@/lib/auth-service";
import { resolveShopOwnerAfterLogin } from "@/lib/ensure-shop-setup";
import { toast } from "sonner";

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
          const shopStatus = await resolveShopOwnerAfterLogin(user);
          user = shopStatus.user;
          setSession(response.accessToken, user);

          if (shopStatus.status === "needs_setup") {
            toast.success("Đăng nhập thành công. Vui lòng thiết lập cửa hàng.", {
              closeButton: true,
            });
            router.push("/shop");
            return;
          }
          if (shopStatus.status === "needs_select") {
            toast.success("Đăng nhập thành công. Chọn cửa hàng để quản lý.", {
              closeButton: true,
            });
            setSession(response.accessToken, shopStatus.user);
            router.push("/select-shop");
            return;
          }
          if (shopStatus.user.shop_id !== user.shop_id) {
            setSession(response.accessToken, shopStatus.user);
            user = shopStatus.user;
          }
          toast.success("Đăng nhập thành công", { closeButton: true });
        } catch (shopErr) {
          const shopMessage =
            shopErr instanceof Error ? shopErr.message : "Không thể tải thông tin cửa hàng";
          toast.error(shopMessage);
          router.push("/shop");
          return;
        }
      } else {
        toast.success("Đăng nhập thành công", { closeButton: true });
      }

      const redirect = getRedirectByBackendRole(user);
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
    <div className="flex min-h-screen flex-col bg-white">
      <AuthNavbar />

      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[62rem] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-xl"
        >
          <div className="grid min-h-[530px] md:grid-cols-2">
            <motion.section
              layout
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className={cn(
                "relative min-h-[280px] overflow-hidden",
                isAdminLogin ? "md:order-2" : "md:order-1",
              )}
            >
              <Image
                src="/images/image1.jpg"
                alt="Coffee shop"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/20 to-transparent" />
              <div className="absolute left-6 right-6 top-6 text-white md:left-8 md:right-8 md:top-8">
                <AnimatePresence mode="wait">
                  {isAdminLogin ? (
                    <motion.div
                      key="admin-welcome"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-[42px] font-bold leading-tight">
                        Xin chào!
                      </p>
                      <p className="mt-2 text-[34px] leading-tight">Admin.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="user-welcome"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-[42px] font-bold leading-tight">
                        Xin chào
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            <motion.section
              layout
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className={cn(
                "flex items-center px-5 py-7 sm:px-7 md:px-8",
                isAdminLogin ? "md:order-1" : "md:order-2",
              )}
            >
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isAdminLogin ? "admin-title" : "user-title"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                      {isAdminLogin ? "Admin" : "Đăng nhập"}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                      {isAdminLogin
                        ? "Dùng tài khoản admin để quản trị hệ thống"
                        : "Đăng nhập để quản lý cửa hàng của bạn"}
                    </p>
                  </motion.div>
                </AnimatePresence>

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
                        marginTop: 20,
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

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <motion.div
                    animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">
                        {isAdminLogin ? "Email" : "Email"}
                      </Label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={
                            isAdminLogin ? "admin@lumio.app" : "you@lumio.app"
                          }
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          required
                          className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-10 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-200"
                        />
                        {isAdminLogin ? (
                          <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        ) : (
                          <UserRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">
                        Mật khẩu
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
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <a
                      href="/forgot-password"
                      className="font-medium text-slate-500 transition-colors hover:text-indigo-600"
                    >
                      Quên mật khẩu?
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsAdminLogin((prev) => !prev)}
                      className="rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700 transition-all hover:bg-indigo-100 hover:text-indigo-700"
                    >
                      {isAdminLogin ? "Quay lại đăng nhập" : "Admin"}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-base font-semibold text-white hover:from-indigo-600 hover:to-violet-700"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang đăng nhập...
                      </span>
                    ) : isAdminLogin ? (
                      "Đăng nhập"
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </form>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
