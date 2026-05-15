"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { forgotPassword } from "@/lib/auth-service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gửi email thất bại";
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
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full text-center"
                  >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Send className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">
                      Email Sent
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                      Vui lòng kiểm tra hộp thư để nhận liên kết đặt lại mật
                      khẩu.
                    </p>
                    <Link
                      href="/login"
                      className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại đăng nhập
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full"
                  >
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                      Quên mật khẩu
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                      Nhập email đăng ký để nhận link đặt lại mật khẩu.
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

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            type="email"
                            placeholder="you@lumio.app"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-200"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-base font-semibold text-white hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang gửi...
                          </span>
                        ) : (
                          "Tiếp tục"
                        )}
                      </Button>

                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang Đăng nhập
                      </Link>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
