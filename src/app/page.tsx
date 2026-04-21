import Link from "next/link";
import { ArrowRight, ClipboardList, HeartHandshake, Pill, ShieldCheck, Ticket } from "lucide-react";

const FLOW = [
  {
    title: "กรอกข้อมูล",
    detail: "ฟอร์มสั้น, เก็บเฉพาะข้อมูลที่ต้องใช้จริง",
    icon: ClipboardList,
  },
  {
    title: "แตะเลือก 1 ลูก",
    detail: "interaction แบบ capsule selection, เข้าใจง่ายกว่า shake อย่างเดียว",
    icon: Pill,
  },
  {
    title: "เพิ่มเพื่อนตอน claim",
    detail: "เล่นก่อน reveal ก่อน แล้วค่อยปลดล็อกสิทธิ์รับคูปอง",
    icon: HeartHandshake,
  },
  {
    title: "ถือ coupon ไปใช้",
    detail: "ลูกค้าแค่โชว์ code, พนักงาน redeem แยกอีกหน้า",
    icon: Ticket,
  },
] as const;

const PHONE_STORY = [
  { label: "Landing", title: "Premium Pharmacy", tone: "bg-[linear-gradient(180deg,#e8f8f0_0%,#f7fbf8_100%)]", accent: "bg-emerald-600" },
  { label: "Register", title: "Short Form", tone: "bg-white", accent: "bg-slate-200" },
  { label: "Play", title: "Select Capsule", tone: "bg-[linear-gradient(180deg,#f6fcf8_0%,#eef8f3_100%)]", accent: "bg-emerald-500" },
  { label: "Reward", title: "Reveal Ticket", tone: "bg-slate-900", accent: "bg-orange-300" },
  { label: "Wallet", title: "Coupon Ready", tone: "bg-[linear-gradient(180deg,#f7faf8_0%,#eff9f2_100%)]", accent: "bg-emerald-500" },
] as const;

function PhoneMock({ label, title, tone, accent }: (typeof PHONE_STORY)[number]) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
      <div className={`overflow-hidden rounded-[1.6rem] ${tone}`}>
        <div className="mx-auto mt-2 h-4 w-20 rounded-full bg-slate-950" />
        <div className="px-4 pb-4 pt-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">{label}</div>
          <div className="mt-1 text-sm font-black leading-tight text-slate-950">{title}</div>
          <div className="mt-4 space-y-2">
            <div className={`h-8 rounded-2xl ${accent} ${label === "Reward" ? "opacity-100" : "opacity-90"}`} />
            <div className="h-3 rounded-full bg-black/8" />
            <div className="h-3 w-2/3 rounded-full bg-black/8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8">
      <section className="overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div className="bg-[linear-gradient(135deg,#125b43_0%,#0f6d52_56%,#e5f6ee_56%,#f8fbf9_100%)] p-8 text-white sm:p-10">
            <div className="inline-flex rounded-full bg-[#efd9ad] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5d4a20]">Premium</div>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Thai LINE OA Pharmacy
            </h1>
            <p className="mt-3 max-w-lg text-base leading-7 text-white/82 sm:text-lg">
              ทิศทางใหม่ของ Pharmacy Plus คือให้ทั้ง landing และ LIFF flow ดูเหมือน campaign storyboard ที่พร้อมขายและพร้อมใช้จริงในหน้าร้าน.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/liff/pharmacy-plus" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50">
                เปิดหน้า campaign <ArrowRight size={16} />
              </Link>
              <Link href="/admin/pharmacy-plus/redeem" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15">
                เปิดหน้าพนักงาน redeem
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {FLOW.map(({ title, detail, icon: Icon }, index) => (
                <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Icon size={18} />
                    <span className="text-sm font-bold">{index + 1}. {title}</span>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2.4rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6faf8_100%)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">UX / UI Board</div>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">หน้าตาโดยรวมต้องไปทางนี้</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              reference นี้ดีตรงที่มันขาย flow ได้ในภาพเดียว, เลยย้ายแนวคิดนั้นมาเป็น landing board + mobile-first LIFF screen ที่มีบุคลิกชัดกว่าเดิม
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            <ShieldCheck size={16} /> Health retail, not generic game UI
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {PHONE_STORY.map((item) => (
            <PhoneMock key={item.label} {...item} />
          ))}
        </div>
      </section>
    </main>
  );
}
