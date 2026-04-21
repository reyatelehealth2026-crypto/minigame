"use client";

import { useState } from "react";
import { CAMPAIGN_KEY, getToneClasses, type CampaignReward } from "@/lib/pharmacy-plus";

type RedeemResponse = {
  ok: boolean;
  storage: "db" | "noop";
  existing?: boolean;
  error?: string;
  reward?: CampaignReward;
};

export default function PharmacyPlusRedeemPage() {
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RedeemResponse | null>(null);

  const handleRedeem = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Staff redeem</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">ใช้สิทธิ์คูปองหน้าร้าน</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">สำหรับพนักงานหน้าร้าน, รับโค้ดจากลูกค้าแล้วกดยืนยันใช้สิทธิ์ที่นี่. ถ้าโค้ดถูกใช้ไปแล้ว ระบบจะแจ้งทันที.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Coupon code</label>
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="เช่น PP30-AB12CD"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-semibold tracking-[0.08em] uppercase outline-none focus:border-emerald-400"
            />
            <button
              onClick={handleRedeem}
              disabled={submitting || !couponCode.trim()}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {submitting ? "กำลังตรวจสอบและใช้สิทธิ์..." : "ยืนยันใช้สิทธิ์"}
            </button>
          </div>
        </section>

        {result?.error ? (
          <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            <div className="text-sm font-semibold">{result.error}</div>
          </section>
        ) : null}

        {result?.reward ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            <div className={`rounded-[1.75rem] border p-4 shadow-sm ${getToneClasses(result.reward.tone)}`}>
              <div className="text-xs font-bold uppercase tracking-[0.16em]">
                {result.reward.status === "redeemed" ? (result.existing ? "Already Redeemed" : "Redeemed Now") : "Reward"}
              </div>
              <div className="mt-2 text-xl font-black">{result.reward.title}</div>
              <div className="mt-1 text-sm opacity-90">{result.reward.detail}</div>
              <div className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900">Code: {result.reward.couponCode}</div>
              {result.reward.expiresAt ? <div className="mt-2 text-xs text-slate-600">หมดอายุ {new Date(result.reward.expiresAt).toLocaleDateString("th-TH")}</div> : null}
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {result.reward.status === "redeemed"
                ? result.existing
                  ? "โค้ดนี้ถูกใช้สิทธิ์ไปแล้ว, อย่ารับใช้ซ้ำ"
                  : "ยืนยันใช้สิทธิ์สำเร็จแล้ว"
                : "สถานะโค้ดยังไม่ถูก redeem"}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
