import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Ticket } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <section className="rounded-[2rem] border border-emerald-100 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Standalone project</div>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Pharmacy Plus, LINE OA + LIFF acquisition MVP
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          โปรเจคนี้แยกจาก LineBook โดยตรง ใช้สำหรับทำ campaign acquisition เพื่อเพิ่มเพื่อน LINE OA ของร้านยาพรัสด้วย flow แบบ LIFF-first.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/liff/pharmacy-plus" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600">
            เปิดหน้า campaign <ArrowRight size={16} />
          </Link>
          <Link href="/admin/pharmacy-plus/redeem" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50">
            เปิดหน้าพนักงาน redeem
          </Link>
          <a href="/api/pharmacy-plus/config" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50">
            ดู mock config API
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Trust-first", text: "โทนสะอาด น่าเชื่อถือ เหมาะกับ health retail" },
          { icon: Sparkles, title: "LIFF-first", text: "entry flow สั้น, CTA ชัด, ใช้งานใน LINE ได้เลย" },
          { icon: Ticket, title: "Reward-ready", text: "ลูกค้า claim คูปองได้เอง และพนักงาน redeem แยกหน้ากันชัดเจน" },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Icon size={22} />
            </div>
            <div className="mt-4 text-lg font-bold text-slate-950">{title}</div>
            <div className="mt-1 text-sm leading-6 text-slate-600">{text}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
