import Link from "next/link";
import { ArrowRight, ClipboardList, HeartHandshake, Pill, Ticket } from "lucide-react";

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
    </main>
  );
}
