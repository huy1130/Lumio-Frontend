"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";

function IconTwitterX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@lumio.app",
    href:  "mailto:hello@lumio.app",
  },
  {
    icon: Phone,
    label: "Điện thoại",
    value: "+84 28 1234 5678",
    href:  "tel:+842812345678",
  },
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    href:  undefined,
  },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "Thứ 2–6, 9:00–18:00 ICT",
    href:  undefined,
  },
];

const SOCIALS = [
  { icon: IconTwitterX,  label: "Twitter",  href: "https://twitter.com"  },
  { icon: IconLinkedin,  label: "LinkedIn", href: "https://linkedin.com" },
  { icon: IconFacebook,  label: "Facebook", href: "https://facebook.com" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className="pt-16">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge className="mb-5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 px-4 py-1.5 text-sm font-medium">
                Liên hệ
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mb-5 text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
            >
              Chúng tôi rất vui được{" "}
              <span className="text-indigo-600 dark:text-indigo-400">lắng nghe bạn</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Có câu hỏi, ý tưởng hoặc chỉ muốn chào hỏi? Nhắn tin cho chúng tôi và chúng tôi sẽ phản hồi trong vòng 24 giờ.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Main content: form + info ─────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">

            {/* LEFT — Contact form */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                Gửi tin nhắn cho chúng tôi
              </motion.h2>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-950/30 px-8 py-16 text-center"
                >
                  <CheckCircle2 className="mb-4 h-14 w-14 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tin nhắn đã được gửi!</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Chúng tôi sẽ liên lạc với bạn sớm. Vui lòng chờ phản hồi trong vòng 24 giờ.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => { setSuccess(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  >
                    Gửi tin nhắn khác
                  </Button>
                </motion.div>
              ) : (
                <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Họ và tên</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Nguyễn Văn A"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-indigo-400 dark:focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-indigo-400 dark:focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300">Chủ đề</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Chúng tôi có thể giúp gì cho bạn?"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-indigo-400 dark:focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">Nội dung</Label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Hãy cho chúng tôi biết thêm về câu hỏi hoặc phản hồi của bạn..."
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="flex w-full rounded-md border px-3 py-2 text-sm resize-none
                        border-gray-200 dark:border-gray-700
                        bg-gray-50 dark:bg-gray-900
                        text-gray-900 dark:text-gray-100
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang gửi…
                      </span>
                    ) : "Gửi tin nhắn"}
                  </Button>

                  <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                    Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                  </p>
                </motion.form>
              )}
            </motion.div>

            {/* RIGHT — Contact info */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="flex flex-col gap-6"
            >
              <motion.h2 variants={fadeUp} className="text-2xl font-bold text-gray-900 dark:text-white">
                Thông tin liên hệ
              </motion.h2>

              {/* Info cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    className="flex items-start gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social links */}
              <motion.div variants={fadeUp} className="mt-2">
                <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Theo dõi chúng tôi</p>
                <div className="flex gap-3">
                  {SOCIALS.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}
