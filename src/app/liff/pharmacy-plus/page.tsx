"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Gift, HeartHandshake, Smartphone, Ticket, CheckCircle2, ChevronRight } from "lucide-react";
import { useLiff } from "@/components/LiffProvider";
import { CAMPAIGN_KEY, getToneClasses, type CampaignConfig, type CampaignDrawResponse, type CampaignReward } from "@/lib/pharmacy-plus";

const STEPS = ["landing", "gate", "register", "shake", "reward", "wallet", "success"] as const;
type Step = (typeof STEPS)[number];

export default function PharmacyPlusPage() {
  const { profile, friendship, refreshFriendship } = useLiff();
  const params = useSearchParams();
  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [step, setStep] = useState<Step>("landing");
  const [sessionId] = useState(() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("สาขาใกล้ฉัน");
  const [reward, setReward] = useState<CampaignReward | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const source = useMemo(
    () => ({
      source: params.get("utm_source") ?? params.get("source"),
      medium: params.get("utm_medium") ?? params.get("medium"),
      campaign: params.get("utm_campaign") ?? params.get("campaign"),
      branch: params.get("branch"),
    }),
    [params],
  );

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pharmacy-plus/config", { cache: "no-store" });
      setConfig(await res.json());
    })();
  }, []);

  const isFriend = Boolean(friendship?.friendFlag);
  const progress = STEPS.indexOf(step) + 1;

  const logEvent = async (eventName: string, payload?: Record<string, unknown>) => {
    await fetch("/api/pharmacy-plus/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignKey: CAMPAIGN_KEY,
        sessionId,
        eventName,
        step,
        lineUserId: profile?.userId ?? null,
        source,
        payload,
      }),
    });
  };

  const handleRegister = async () => {
    await fetch("/api/pharmacy-plus/entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignKey: CAMPAIGN_KEY,
        sessionId,
        lineUserId: profile?.userId ?? null,
        displayName: profile?.displayName ?? null,
        fullName: name,
        phone,
        branch,
        isLineFriend: isFriend,
        source,
      }),
    });
    await logEvent("registration_submit", { branch });
    setStep("shake");
  };

  const handleDraw = async () => {
    setDrawing(true);
    await logEvent("shake_complete");
    try {
      const res = await fetch("/api/pharmacy-plus/reward/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignKey: CAMPAIGN_KEY, sessionId, lineUserId: profile?.userId ?? null }),
      });
      const data = (await res.json()) as CampaignDrawResponse;
      if (data?.reward) {
        setReward(data.reward);
        await logEvent("reward_reveal", { reward: data.reward.title, storage: data.storage, existing: data.existing ?? false });
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 } });
        setStep("reward");
      }
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">Standalone campaign</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight">ร้านยาพรัส Shake to Win</h1>
        <p className="mt-2 max-w-xs text-sm leading-6 text-white/70">เพิ่มเพื่อน LINE OA แล้วลุ้นคูปองหน้าร้านแบบเร็ว, ชัด, และเป็นมิตรกับการใช้งานบน LIFF</p>
        <div className="mt-4 flex gap-1.5">
          {STEPS.map((label, index) => (
            <div key={label} className={`h-1.5 flex-1 rounded-full ${index < progress ? "bg-orange-300" : "bg-white/10"}`} />
          ))}
        </div>
      </section>

      {step === "landing" && config && (
        <section className="space-y-4 rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Landing</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">เพิ่มเพื่อน, ลุ้นรางวัล, กลับมาซื้อซ้ำ</h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
              <Gift size={26} />
            </div>
          </div>

          <div className="grid gap-3">
            {config.rewardTeasers.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                {item}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {config.benefitBullets.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setStep("gate")} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600">
            เพิ่มเพื่อนและเริ่มเล่น <ChevronRight size={16} />
          </button>
        </section>
      )}

      {step === "gate" && (
        <section className="space-y-4 rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Add Friend Gate</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">เพิ่มเพื่อนก่อน, ปลดล็อกสิทธิ์เล่นทันที</h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
              <HeartHandshake size={26} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            สถานะเพื่อน LINE OA: <span className="font-semibold text-slate-950">{isFriend ? "เพิ่มเพื่อนแล้ว" : "ยังไม่ได้เพิ่มเพื่อน"}</span>
          </div>

          {!isFriend && (
            <a href={config?.addFriendUrl ?? "#"} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600">
              เพิ่มเพื่อนตอนนี้
            </a>
          )}
          <button
            onClick={async () => {
              await refreshFriendship();
              setStep("register");
            }}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50"
          >
            {isFriend ? "ไปต่อ" : "ฉันเพิ่มเพื่อนแล้ว"}
          </button>
        </section>
      )}

      {step === "register" && (
        <section className="space-y-4 rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Registration</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">กรอกข้อมูลสั้นๆ แล้วเริ่มลุ้น</h2>
          </div>
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อของคุณ" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เบอร์โทร (optional)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              {(config?.branches ?? ["สาขาใกล้ฉัน"]).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <button disabled={!name.trim()} onClick={handleRegister} className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
            เริ่มลุ้นเลย
          </button>
        </section>
      )}

      {step === "shake" && (
        <section className="space-y-4 rounded-[2rem] border border-emerald-100 bg-white p-5 text-center shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Shake Interaction</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">เขย่าเพื่อเปิดสิทธิ์ของคุณ</h2>
            <p className="mt-2 text-sm text-slate-500">ถ้า motion sensor ใช้ไม่ได้, แตะปุ่มด้านล่างแทนได้</p>
          </div>
          <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-[2.5rem] border border-slate-200 bg-slate-50 shadow-inner">
            <Smartphone size={52} className="text-emerald-500" />
          </div>
          <div className="grid gap-3">
            <button disabled={drawing} onClick={handleDraw} className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
              {drawing ? "กำลังสุ่มรางวัล..." : "เขย่าเลย"}
            </button>
            <button disabled={drawing} onClick={handleDraw} className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50">
              {drawing ? "กำลังสุ่มรางวัล..." : "แตะเพื่อเล่น"}
            </button>
          </div>
        </section>
      )}

      {step === "reward" && reward && (
        <section className="space-y-4 rounded-[2rem] bg-slate-950 p-5 text-center text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300">Reward Reveal</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight">{reward.title}</h2>
            <p className="mt-2 text-sm text-white/70">{reward.detail}</p>
          </div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
            <Ticket size={32} className="text-orange-300" />
          </div>
          <button
            onClick={async () => {
              await logEvent("reward_claim_click", { reward: reward.title });
              const res = await fetch("/api/pharmacy-plus/reward/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaignKey: CAMPAIGN_KEY, sessionId }),
              });
              const data = await res.json();
              if (data?.reward) setReward(data.reward);
              setStep("wallet");
            }}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600"
          >
            รับสิทธิ์เลย
          </button>
        </section>
      )}

      {step === "wallet" && reward && (
        <section className="space-y-4 rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Coupon Wallet</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">สิทธิ์ของคุณพร้อมใช้แล้ว</h2>
          </div>
          <div className={`rounded-[1.75rem] border p-4 shadow-sm ${getToneClasses(reward.tone)}`}>
            <div className="text-xs font-bold uppercase tracking-[0.16em]">{reward.status === "claimed" ? "Coupon Claimed" : "Coupon Active"}</div>
            <div className="mt-2 text-xl font-black">{reward.title}</div>
            <div className="mt-1 text-sm opacity-90">{reward.detail}</div>
            <div className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900">Code: {reward.couponCode}</div>
            {reward.expiresAt ? <div className="mt-2 text-xs text-slate-600">ใช้ได้ถึง {new Date(reward.expiresAt).toLocaleDateString("th-TH")}</div> : null}
          </div>
          <button
            onClick={async () => {
              setRedeeming(true);
              await logEvent("coupon_redeem_click", { reward: reward.title, couponCode: reward.couponCode });
              try {
                const res = await fetch("/api/pharmacy-plus/reward/redeem", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ campaignKey: CAMPAIGN_KEY, sessionId }),
                });
                const data = await res.json();
                if (data?.reward) setReward(data.reward);
                setStep("success");
              } finally {
                setRedeeming(false);
              }
            }}
            disabled={redeeming}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {redeeming ? "กำลังใช้สิทธิ์..." : "ใช้คูปองนี้"}
          </button>
        </section>
      )}

      {step === "success" && reward && (
        <section className="space-y-4 rounded-[2rem] border border-emerald-100 bg-white p-5 text-center shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Success</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">รับสิทธิ์สำเร็จแล้ว</h2>
            <p className="mt-2 text-sm text-slate-500">บันทึกสิทธิ์ไว้แล้ว กลับมาลุ้นรอบใหม่ได้ใน campaign ถัดไป</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
            {reward.title} {reward.status === "redeemed" ? "· ใช้สิทธิ์แล้ว" : ""}
          </div>
          <button onClick={() => setStep("landing")} className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50">
            กลับหน้าแคมเปญ
          </button>
        </section>
      )}
    </div>
  );
}
