"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Activity, Calendar } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

// ─── Mission / Vision / Values ───────────────────────────────────────────────
const PILLARS = [
  {
    emoji: "🎯",
    title: "Sứ mệnh",
    desc:  "Trao quyền cho mọi doanh nghiệp F&B — từ quán cà phê vỉa hè đến chuỗi nhà hàng nhiều chi nhánh — bằng phần mềm giá cả phải chăng, dễ dùng, giúp vận hành kinh doanh trở nên thực sự nhẹ nhàng.",
    bg:    "bg-blue-50 dark:bg-blue-950/30",
    border:"border-blue-100 dark:border-blue-800/40",
  },
  {
    emoji: "👁",
    title: "Tầm nhìn",
    desc:  "Một thế giới nơi mọi chủ nhà hàng, quản lý quán cà phê và doanh nhân ẩm thực đều có thể tiếp cận những công cụ mạnh mẽ như các tập đoàn lớn — mà không cần chi phí khổng lồ.",
    bg:    "bg-indigo-50 dark:bg-indigo-950/30",
    border:"border-indigo-100 dark:border-indigo-800/40",
  },
  {
    emoji: "💎",
    title: "Giá trị cốt lõi",
    desc:  "Minh bạch trong mọi thứ chúng tôi xây dựng. Đổi mới để giải quyết vấn đề thực tế. Tác động được đo bằng sự thành công của các doanh nghiệp chúng tôi phục vụ — không chỉ lợi nhuận của chính mình.",
    bg:    "bg-purple-50 dark:bg-purple-950/30",
    border:"border-purple-100 dark:border-purple-800/40",
  },
];

// ─── Team ─────────────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "Nguyễn Văn A",
    role: "Giám đốc điều hành",
    bio:  "Hơn 10 năm phát triển sản phẩm SaaS tại Đông Nam Á. Cựu Phó Giám đốc tại một startup công nghệ F&B hàng đầu.",
    initials: "NA",
    color: "bg-blue-600",
  },
  {
    name: "Trần Thị B",
    role: "Giám đốc công nghệ",
    bio:  "Kỹ sư full-stack đam mê hệ thống phân tán. Dẫn dắt đội kỹ thuật tại hai startup kỳ lân.",
    initials: "TB",
    color: "bg-emerald-600",
  },
  {
    name: "Lê Văn C",
    role: "Trưởng nhóm thiết kế",
    bio:  "Nhà thiết kế sản phẩm từng đoạt giải thưởng, tập trung vào khả năng tiếp cận và trải nghiệm người dùng cho doanh nghiệp vừa và nhỏ.",
    initials: "LC",
    color: "bg-orange-500",
  },
  {
    name: "Phạm Thị D",
    role: "Trưởng bộ phận sản phẩm",
    bio:  "Cựu chủ nhà hàng chuyển sang quản lý sản phẩm. Biến những điểm đau thực tế của người vận hành thành tính năng tinh tế.",
    initials: "PD",
    color: "bg-purple-600",
  },
];

// ─── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: Calendar, label: "Thành lập",    value: "2023"     },
  { icon: Users,    label: "Người dùng",   value: "300.000+" },
  { icon: Globe,    label: "Quốc gia",     value: "10+"      },
  { icon: Activity, label: "Uptime",       value: "99.9%"    },
];

export default function AboutPage() {
  return (
    <div className="pt-16">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/40">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge className="mb-5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 px-4 py-1.5 text-sm font-medium">
                Câu chuyện của chúng tôi
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mb-6 text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
            >
              Xây dựng cho{" "}
              <span className="text-indigo-600 dark:text-indigo-400">doanh nghiệp F&B</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              Lumio ra đời từ một sự bức xúc đơn giản: công cụ quản lý nhà hàng tốt không nên tốn một gia tài.
              Chúng tôi bắt tay xây dựng phần mềm mà người vận hành thực sự yêu thích — nhanh, đáng tin cậy
              và được thiết kế theo quy trình F&B thực tế.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ─────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid gap-8 md:grid-cols-3"
          >
            {PILLARS.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className={`rounded-2xl border p-8 ${p.bg} ${p.border}`}
              >
                <span className="text-4xl">{p.emoji}</span>
                <h3 className="mt-4 mb-3 text-xl font-bold text-gray-900 dark:text-white">{p.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-14 text-center">
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 px-4 py-1.5 text-sm">
                Đội ngũ
              </Badge>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                Những người đứng sau Lumio
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Một đội ngũ nhỏ, tập trung, luôn trăn trở để vận hành F&B trở nên dễ dàng hơn cho tất cả mọi người.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((member) => (
                <motion.div
                  key={member.name}
                  variants={fadeUp}
                  className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                  {/* Colored avatar with initials */}
                  <div className={`h-16 w-16 rounded-2xl ${member.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-xl font-bold text-white">{member.initials}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">{member.name}</h4>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 mb-3">{member.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Company stats ────────────────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {STATS.map(({ icon: Icon, label, value }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-6 py-8 text-center"
              >
                <Icon className="mx-auto mb-3 h-6 w-6 text-indigo-500" />
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
