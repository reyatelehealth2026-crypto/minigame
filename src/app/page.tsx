import Link from "next/link";
import { ArrowRight, ClipboardList, Gift, HeartHandshake, Pill, Sparkles } from "lucide-react";

const HOW_TO = [
  { title: "กรอกข้อมูลสั้น ๆ", detail: "ใช้ชื่อจาก LINE ของคุณได้เลย", icon: ClipboardList },
  { title: "เขย่าและเลือก 1 ลูก", detail: "ลุ้นรางวัลจากลูกบอลโชคดี", icon: Pill },
  { title: "เพิ่มเพื่อน LINE OA", detail: "ปลดล็อกสิทธิ์เก็บคูปองไว้ใน LINE", icon: HeartHandshake },
  { title: "ใช้คูปองที่ร้าน", detail: "โชว์โค้ดให้พนักงานก็จบ", icon: Gift },
] as const;

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,#1c6e4c_0%,#0d3a28_55%,#051a10_100%)] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 14% 22%, rgba(255,255,255,0.9), transparent 60%)," +
            "radial-gradient(1px 1px at 30% 64%, rgba(180,220,255,0.7), transparent 60%)," +
            "radial-gradient(2px 2px at 48% 28%, rgba(255,220,170,0.8), transparent 60%)," +
            "radial-gradient(1px 1px at 64% 78%, rgba(255,255,255,0.7), transparent 60%)," +
            "radial-gradient(1.5px 1.5px at 80% 18%, rgba(200,240,255,0.8), transparent 60%)," +
            "radial-gradient(1px 1px at 90% 56%, rgba(255,255,255,0.6), transparent 60%)," +
            "radial-gradient(1.5px 1.5px at 8% 88%, rgba(255,230,180,0.7), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-12 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
              <Pill size={18} className="text-emerald-300" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Pharmacy Plus</div>
              <div className="text-[11px] font-semibold text-white/70">Lucky Draw Campaign</div>
            </div>
          </div>
          <Link
            href="/admin/pharmacy-plus/redeem"
            className="text-[11px] font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            พนักงาน
          </Link>
        </div>

        <section className="mt-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-amber-200 ring-1 ring-amber-300/40">
            <Sparkles size={12} /> กิจกรรมพิเศษ
          </div>
          <h1 className="mt-4 text-[2.8rem] font-black leading-[1.02] tracking-tight drop-shadow-[0_4px_0_rgba(5,26,16,0.35)]">
            เขย่าบอล
            <br />
            <span className="text-[#ffe1ec]">ลุ้นรางวัลใหญ่</span>
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
            ร่วมสนุกง่ายๆ เพียงแตะเลือก 1 ลูก ก็รับสิทธิ์คูปองส่วนลดจากร้านยา Pharmacy Plus ได้เลย
          </p>

          <div className="relative mt-8 h-64 w-full max-w-[16rem]">
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(94,234,160,0.45)_0%,rgba(94,234,160,0)_65%)] blur-2xl" />
            <div className="absolute inset-x-2 top-0 h-16 rounded-t-[4.5rem] border-x-[6px] border-t-[6px] border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(221,247,255,0.92)_100%)]" />
            <div className="absolute inset-x-2 top-12 bottom-14 overflow-hidden rounded-[2.4rem] border-[6px] border-white/90 bg-[radial-gradient(circle_at_50%_25%,#ffffff_0%,#e6f5ff_55%,#a7dcff_100%)] shadow-[inset_0_0_25px_rgba(255,255,255,0.9),0_22px_32px_rgba(0,0,0,0.25)]">
              <div className="pointer-events-none absolute inset-x-4 top-3 h-6 rounded-full bg-white/50 blur-[2px]" />
              <div className="absolute left-[14%] top-[18%] h-11 w-11 rounded-full bg-[#ff6464] shadow-[inset_0_-8px_14px_rgba(0,0,0,0.18)]" />
              <div className="absolute left-[56%] top-[12%] h-11 w-11 rounded-full bg-[#ffc247] shadow-[inset_0_-8px_14px_rgba(0,0,0,0.18)]" />
              <div className="absolute left-[36%] top-[38%] h-11 w-11 rounded-full bg-[#4ea7ff] shadow-[inset_0_-8px_14px_rgba(0,0,0,0.18)]" />
              <div className="absolute left-[10%] top-[58%] h-11 w-11 rounded-full bg-[#58c247] shadow-[inset_0_-8px_14px_rgba(0,0,0,0.18)]" />
              <div className="absolute left-[52%] top-[60%] h-11 w-11 rounded-full bg-[#ff7ec3] shadow-[inset_0_-8px_14px_rgba(0,0,0,0.18)]" />
            </div>
            <div className="absolute inset-x-8 bottom-0 flex h-12 items-center justify-center rounded-b-[1.6rem] bg-[linear-gradient(180deg,#ffd64a_0%,#f39a1d_100%)] text-xs font-black uppercase tracking-[0.22em] text-[#5a3a00] shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
              Pharmacy+
            </div>
          </div>

          <Link
            href="/liff/pharmacy-plus"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[1.6rem] bg-gradient-to-b from-[#3ae080] to-[#0b8f3d] px-8 py-4 text-base font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_38px_rgba(14,140,60,0.45),inset_0_-5px_0_rgba(0,0,0,0.22),inset_0_2px_0_rgba(255,255,255,0.35)] transition-transform active:translate-y-0.5"
          >
            <Sparkles size={18} /> เข้าร่วมกิจกรรม <ArrowRight size={16} />
          </Link>
          <div className="mt-3 text-[11px] text-white/50">ใช้งานผ่าน LINE · ฟรี ไม่มีค่าใช้จ่าย</div>
        </section>

        <section className="mt-10 rounded-[1.8rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-emerald-200">วิธีเล่น</div>
          <div className="mt-3 divide-y divide-white/10">
            {HOW_TO.map(({ title, detail, icon: Icon }, index) => (
              <div key={title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30">
                  <Icon size={18} />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-black text-emerald-950">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="text-sm font-black text-white">{title}</div>
                  <div className="mt-0.5 text-xs leading-5 text-white/70">{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
