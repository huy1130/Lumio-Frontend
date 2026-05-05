import Link from "next/link";
import {
  Layers,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Activity,
  FileText,
  Shield,
} from "lucide-react";

// ─── Social SVG icons (lucide-react không có bộ social) ───────────────────────
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}
function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function IconTwitterX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const CONTACT = [
  { icon: Mail,    label: "Email",    value: "Lumio@gmail.com",      href: "mailto:support@possystem.vn" },
  { icon: Phone,   label: "Hotline",  value: "1800 3979",                 href: "tel:18006868"                },
  { icon: MapPin,  label: "Địa chỉ", value: "123 Lý Tự Trọng, Q.1, TP.HCM", href: "#"                      },
];

const SUPPORT_LINKS = [
  { icon: BookOpen,    label: "Tài liệu hướng dẫn", href: "/"   },
  { icon: HelpCircle,  label: "Câu hỏi thường gặp",  href: "/"    },
  { icon: Activity,    label: "Trạng thái hệ thống",  href: "/" },
  { icon: MessageSquare, label: "Liên hệ hỗ trợ",     href: "/contact"},
];

const PRODUCT_LINKS = [
  { label: "Tính năng",    href: "/features" },
  { label: "Bảng giá",    href: "/pricing"  },
  { label: "Thông tin",         href: "/about"     },
 
];

const LEGAL_LINKS = [
  { icon: Shield,   label: "Chính sách bảo mật", href: "#privacy" },
  { icon: FileText, label: "Điều khoản sử dụng",  href: "#terms"  },
];

const SOCIALS = [
  { icon: IconFacebook,  label: "Facebook",  href: "https://facebook.com",  color: "hover:text-blue-500"  },
  { icon: IconYoutube,   label: "YouTube",   href: "https://youtube.com",   color: "hover:text-red-500"   },
  { icon: IconLinkedin,  label: "LinkedIn",  href: "https://linkedin.com",  color: "hover:text-sky-500"   },
  { icon: IconTwitterX,  label: "Twitter/X", href: "https://twitter.com",   color: "hover:text-gray-200"  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Brand & description */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Layers className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">POS System</span>
            </Link>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Nền tảng quản lý bán hàng toàn diện dành cho doanh nghiệp F&amp;B — từ quán cà phê nhỏ
              đến chuỗi nhà hàng nhiều chi nhánh.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors ${s.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Product links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-white">
              Sản phẩm
            </h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Support */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-white">
              Hỗ trợ
            </h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 4 — Contact & Feedback */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-white">
              Liên hệ
            </h3>
            <ul className="space-y-3 mb-6">
              {CONTACT.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="leading-snug">{c.value}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Feedback CTA */}
            <div className="rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-4">
              <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                Góp ý & phản hồi
              </p>
              <p className="mb-3 text-[11px] text-indigo-500 dark:text-indigo-400 leading-relaxed">
                Ý kiến của bạn giúp chúng tôi cải thiện sản phẩm mỗi ngày.
              </p>
              <a
                href="mailto:feedback@possystem.vn"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                Gửi phản hồi
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © 2026 POS System Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.label}
                  href={l.href}
                  className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <Icon className="h-3 w-3" />
                  {l.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

    </footer>
  );
}
