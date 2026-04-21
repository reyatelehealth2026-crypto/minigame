"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, ClipboardCheck, QrCode, ScanLine, ShieldCheck, Store, Ticket, TriangleAlert } from "lucide-react";
import { CAMPAIGN_KEY, getToneClasses, type CampaignReward } from "@/lib/pharmacy-plus";

type RedeemResponse = {
  ok: boolean;
  storage: "db" | "noop";
  existing?: boolean;
  error?: string;
  reward?: CampaignReward;
};

function formatThaiDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ActionCard({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</div>
      <div className="mt-3 text-sm font-black text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-600">{detail}</div>
    </div>
  );
}

export default function PharmacyPlusRedeemPage() {
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RedeemResponse | null>(null);

  const normalizedCode = useMemo(() => couponCode.trim().toUpperCase(), [couponCode]);

  const handleRedeem = async () => {
    if (!normalizedCode) return;

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/pharmacy-plus/reward/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignKey: CAMPAIGN_KEY,
          couponCode: normalizedCode,
        }),
      });
      const data = (await res.json()) as RedeemResponse;
      setResult(data);
    } finally {
      setSubmitting(false);
    }
  };

  const resultMessage = result?.reward
    ? result.reward.status === "redeemed"
      ? result.existing
        ? "โค้ดนี้ถูกใช้สิทธิ์ไปแล้ว, อย่ากดยืนยันซ้ำ"
        : "ยืนยันใช้สิทธิ์สำเร็จแล้ว"
      : "สถานะโค้ดยังไม่ถูก redeem"
    : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faf8_0%,#eef7f2_100%)] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-[linear-gradient(135deg,#125b43_0%,#0f6d52_56%,#e5f6ee_56%,#f8fbf9_100%)] p-8 text-white sm:p-10">
              <div className="inline-flex rounded-full bg-[#efd9ad] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5d4a20]">Staff redeem</div>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">ใช้สิทธิ์คูปองหน้าร้าน</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/82 sm:text-base">
                หน้านี้สำหรับพนักงานรับ code จากลูกค้าแล้วเช็กสิทธิ์แบบเร็ว, ชัด, และไม่กดพลาด. โทนต้องดูเป็นเครื่องมือจริง ไม่ใช่ฟอร์มชั่วคราว.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ActionCard icon={<ScanLine size={18} />} title="รับ code" detail="จากหน้าวอลเล็ตหรือแคปหน้าจอลูกค้า" />
                <ActionCard icon={<ClipboardCheck size={18} />} title="ตรวจสอบสถานะ" detail="รู้ทันทีว่าใช้ได้หรือถูกใช้ไปแล้ว" />
                <ActionCard icon={<Store size={18} />} title="ปิดงานที่หน้าร้าน" detail="ลดการถามซ้ำและลดการใช้สิทธิ์ซ้อน" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6faf8_100%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Quick check</div>
                <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">กรอก coupon code แล้วกดยืนยัน</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">ถ้าเป็น code ที่เพิ่งรับมาจากแคมเปญนี้ ระบบจะคืนสถานะรางวัลพร้อมแจ้งทันทีว่า redeem ได้หรือไม่ได้</div>

                <div className="mt-5 rounded-[1.75rem] border border-white/70 bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100/60">
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Coupon code</label>
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <QrCode size={20} className="text-emerald-700" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="เช่น PP30-AB12CD"
                      className="w-full bg-transparent text-lg font-semibold tracking-[0.08em] uppercase text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={handleRedeem}
                    disabled={submitting || !normalizedCode}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitting ? "กำลังตรวจสอบและใช้สิทธิ์..." : "ยืนยันใช้สิทธิ์"}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs leading-5 text-slate-500">
                  ถ้าระบบแจ้งว่า code ถูกใช้ไปแล้ว ให้หยุดที่จุดนี้เลย. อย่าพยายาม redeem ซ้ำ.
                </div>
              </div>
            </div>
          </div>
        </section>

        {result?.error ? (
          <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-rose-100 p-2 text-rose-700">
                <TriangleAlert size={18} />
              </div>
              <div>
                <div className="text-sm font-black">ไม่สามารถใช้สิทธิ์ได้</div>
                <div className="mt-1 text-sm leading-6">{result.error}</div>
              </div>
            </div>
          </section>
        ) : null}

        {result?.reward ? (
          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className={`rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${getToneClasses(result.reward.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                    {result.reward.status === "redeemed" ? (result.existing ? "Already Redeemed" : "Redeemed Now") : "Coupon Status"}
                  </div>
                  <div className="mt-2 text-2xl font-black leading-tight">{result.reward.title}</div>
                  <div className="mt-2 text-sm opacity-90">{result.reward.detail}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-3 text-slate-900 shadow-sm">
                  <Ticket size={22} />
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-black tracking-[0.16em] text-slate-900">
                {result.reward.couponCode}
              </div>
              {result.reward.expiresAt ? (
                <div className="mt-3 text-xs text-slate-700/80">หมดอายุ {formatThaiDate(result.reward.expiresAt)}</div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Redeem result</div>
              <div className="mt-2 flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-950">{resultMessage}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    {result.reward.status === "redeemed"
                      ? result.existing
                        ? "ระบบบันทึกไว้แล้วว่า code นี้ถูกใช้งานไปก่อนหน้า ให้ปฏิเสธการใช้สิทธิ์ซ้ำ"
                        : "ระบบบันทึกการใช้สิทธิ์สำเร็จแล้ว ลูกค้าสามารถรับสินค้าหรือส่วนลดตามหน้าร้านได้"
                      : "ถ้าสถานะยังไม่ใช่ redeemed ให้เช็ก flow claim ของลูกค้าก่อน"}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ActionCard icon={<ShieldCheck size={18} />} title="Storage" detail={result.storage === "db" ? "เชื่อม DB จริงแล้ว" : "ตอนนี้ยังเป็น fallback / noop"} />
                <ActionCard icon={<ClipboardCheck size={18} />} title="Next step" detail={result.reward.status === "redeemed" ? "ปิดการขายและรับสิทธิ์ต่อได้" : "ส่งลูกค้ากลับไป claim ให้เสร็จก่อน"} />
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
