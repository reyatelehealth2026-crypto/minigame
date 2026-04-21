"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Gift,
  HeartHandshake,
  MapPin,
  Phone,
  Pill,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import { useLiff } from "@/components/LiffProvider";
import {
  CAMPAIGN_KEY,
  createSourceFromParams,
  getToneClasses,
  postCampaignEvent,
  type CampaignConfig,
  type CampaignDrawResponse,
  type CampaignEventName,
  type CampaignReward,
} from "@/lib/pharmacy-plus";

const STEPS = ["landing", "gate", "register", "shake", "reward", "wallet", "success"] as const;
type Step = (typeof STEPS)[number];

type StepMeta = {
  eyebrow: string;
  title: string;
  description: string;
};

const STEP_META: Record<Step, StepMeta> = {
  landing: {
    eyebrow: "Premium Campaign",
    title: "Thai LINE OA Pharmacy",
    description: "โทนสะอาด น่าเชื่อถือ และชวนกดต่อเหมือน campaign board ที่เอาไปขายหน้าร้านได้ทันที",
  },
  gate: {
    eyebrow: "Adding LINE OA",
    title: "ปลดล็อกรางวัลด้วยการเพิ่มเพื่อน",
    description: "เล่นก่อนค่อยเพิ่มเพื่อนได้ แต่ตอนรับสิทธิ์ต้องเช็ก friendship ให้ชัด",
  },
  register: {
    eyebrow: "Short Registration",
    title: "ฟอร์มสั้น, จบไว, ไม่ชวนหนี",
    description: "เก็บเท่าที่จำเป็น แล้วพาไปเล่นต่อทันที",
  },
  shake: {
    eyebrow: "Tap / Select Capsule",
    title: "แตะเลือก 1 ลูก",
    description: "แทนคำว่า shake ด้วย interaction ที่เข้าใจเร็วกว่า และภาพจำดีกว่าใน UX จริง",
  },
  reward: {
    eyebrow: "Reward Reveal",
    title: "เปิดรางวัลแบบเห็นมูลค่าชัด",
    description: "ต้องเป็น ticket card ที่เข้าใจใน 1 วิว่าตัวเองได้อะไร",
  },
  wallet: {
    eyebrow: "Coupon Wallet",
    title: "สิทธิ์พร้อมใช้ที่หน้าร้าน",
    description: "ลูกค้าแค่ถือโค้ดไว้, พนักงานเป็นคน redeem",
  },
  success: {
    eyebrow: "Success / Highlights",
    title: "ปิด flow แบบโล่งและมั่นใจ",
    description: "ย้ำอีกครั้งว่าต้องทำอะไรต่อ, ไม่ปล่อยให้ผู้ใช้เดาเอง",
  },
};

const BOARD_STEPS = [
  { title: "กรอกข้อมูล", detail: "ชื่อและเบอร์แบบสั้น ๆ", icon: ClipboardList },
  { title: "เลือก 1 ลูก", detail: "interaction หลักของเกม", icon: Pill },
  { title: "ปลดล็อกสิทธิ์", detail: "เพิ่มเพื่อนตอน claim", icon: HeartHandshake },
  { title: "รับคูปอง", detail: "ถือ code ไปใช้ที่ร้าน", icon: Ticket },
] as const;

const CAPSULES = [
  { id: "emerald", className: "from-emerald-500 via-emerald-300 to-amber-100" },
  { id: "sky", className: "from-sky-500 via-cyan-300 to-amber-100" },
  { id: "rose", className: "from-rose-400 via-pink-300 to-amber-100" },
] as const;

function PhoneFrame({ children, step, progress }: { children: ReactNode; step: Step; progress: number }) {
  const meta = STEP_META[step];

  return (
    <section className="rounded-[2.4rem] border border-slate-200/70 bg-white p-2 shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
      <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#f7faf8_0%,#ecf7f2_52%,#f9fcfb_100%)] ring-1 ring-black/5">
        <div className="mx-auto mt-2 h-6 w-28 rounded-full bg-slate-950" />

        <div className="border-b border-emerald-100/80 px-5 pb-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">{meta.eyebrow}</div>
              <h1 className="mt-1 text-[1.65rem] font-black leading-tight tracking-tight text-slate-950">{meta.title}</h1>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{meta.description}</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm ring-1 ring-emerald-100">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Step</div>
              <div className="text-lg font-black text-slate-950">{progress}/{STEPS.length}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((label, index) => (
              <div key={label} className={`h-1.5 flex-1 rounded-full ${index < progress ? "bg-emerald-500" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="px-5 pb-6 pt-4">{children}</div>
      </div>
    </section>
  );
}

function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function DetailCard({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">{icon}</div>
      <div className="mt-3 text-sm font-bold text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-600">{detail}</div>
    </div>
  );
}

function CapsuleButton({ tone, disabled, onClick }: { tone: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-white/70 p-3 shadow-sm transition hover:-translate-y-1 disabled:opacity-50"
    >
      <div className={`relative h-24 w-14 overflow-hidden rounded-full bg-gradient-to-b ${tone} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45),0_10px_25px_rgba(15,23,42,0.14)]`}>
        <div className="absolute inset-x-2 top-1/2 h-[1px] bg-white/50" />
        <div className="absolute inset-x-3 top-3 h-5 rounded-full bg-white/25 blur-[1px]" />
        <div className="absolute inset-x-3 bottom-3 h-5 rounded-full bg-white/20 blur-[1px]" />
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-slate-950">แตะเลือก</div>
    </button>
  );
}

function RewardTicketCard({ reward, label }: { reward: CampaignReward; label: string }) {
  return (
    <div className={`rounded-[2rem] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${getToneClasses(reward.tone)}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-80">{label}</div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-black leading-tight">{reward.title}</div>
          <div className="mt-1 text-sm opacity-90">{reward.detail}</div>
        </div>
        <div className="rounded-2xl bg-white/70 p-3 text-slate-900 shadow-sm">
          <Ticket size={22} />
        </div>
      </div>
      {reward.couponCode ? <div className="mt-4 rounded-2xl bg-white/75 px-4 py-3 text-center text-sm font-black tracking-[0.18em] text-slate-900">{reward.couponCode}</div> : null}
    </div>
  );
}

function formatThaiDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
  const [claiming, setClaiming] = useState(false);
  const [gateReturnStep, setGateReturnStep] = useState<Step>("register");
  const lastStepEventRef = useRef<string | null>(null);
  const source = useMemo(() => createSourceFromParams(params), [params]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pharmacy-plus/config", { cache: "no-store" });
      setConfig(await res.json());
    })();
  }, []);

  const isFriend = Boolean(friendship?.friendFlag);
  const progress = STEPS.indexOf(step) + 1;

  const logEvent = useCallback(
    async (eventName: CampaignEventName, payload?: Record<string, unknown>, eventStep = step) => {
      await postCampaignEvent({
        campaignKey: CAMPAIGN_KEY,
        sessionId,
        eventName,
        step: eventStep,
        lineUserId: profile?.userId ?? null,
        source,
        payload,
      });
    },
    [profile?.userId, sessionId, source, step],
  );

  useEffect(() => {
    const stepEventMap: Partial<Record<Step, CampaignEventName>> = {
      landing: "campaign_view",
      register: "registration_start",
      wallet: "wallet_view",
      success: "success_view",
    };

    const eventName = stepEventMap[step];
    const dedupeKey = `${step}:${eventName ?? ""}`;
    if (!eventName || lastStepEventRef.current === dedupeKey) return;

    lastStepEventRef.current = dedupeKey;
    void logEvent(eventName, reward ? { reward: reward.title } : undefined);
  }, [logEvent, reward, step]);

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
    await logEvent("registration_submit", { branch, qrId: source.qrId ?? null });
    setStep("shake");
  };

  const handleDraw = async () => {
    setDrawing(true);
    await logEvent("game_start", { trigger: "tap_capsule" }, "shake");
    await logEvent("game_complete", { trigger: "tap_capsule" }, "shake");
    try {
      const res = await fetch("/api/pharmacy-plus/reward/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignKey: CAMPAIGN_KEY, sessionId, lineUserId: profile?.userId ?? null }),
      });
      const data = (await res.json()) as CampaignDrawResponse;
      if (data?.reward) {
        setReward(data.reward);
        await logEvent(
          "reward_reveal",
          { reward: data.reward.title, storage: data.storage, existing: data.existing ?? false, qrId: source.qrId ?? null },
          "reward",
        );
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 } });
        setStep("reward");
      }
    } finally {
      setDrawing(false);
    }
  };

  const handleClaim = async () => {
    if (!reward) return;
    if (!isFriend) {
      setGateReturnStep("reward");
      setStep("gate");
      return;
    }

    setClaiming(true);
    try {
      await logEvent("reward_claim_click", { reward: reward.title, qrId: source.qrId ?? null }, "reward");
      const res = await fetch("/api/pharmacy-plus/reward/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignKey: CAMPAIGN_KEY, sessionId, reward }),
      });
      const data = await res.json();
      if (data?.reward) {
        setReward(data.reward);
        setStep("wallet");
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleFinishWallet = async () => {
    if (!reward) return;
    setStep("success");
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 pb-20">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,#125b43_0%,#0f6d52_56%,#dff4ea_56%,#f5fbf8_100%)] p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
        <div className="inline-flex rounded-full bg-[#efd9ad] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5d4a20]">Premium</div>
        <div className="mt-3 max-w-[15rem]">
          <h2 className="text-[2rem] font-black leading-tight tracking-tight">Thai LINE OA Pharmacy</h2>
          <p className="mt-1 text-sm text-white/80">Lucky Draw Campaign แบบ storyboard ชัดทั้ง UX และ UI</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
        {BOARD_STEPS.map(({ title, detail, icon: Icon }, index) => (
          <div key={title} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <Icon size={18} />
              <span className="text-xs font-bold">{index + 1}. {title}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{detail}</p>
          </div>
        ))}
      </section>

      <PhoneFrame step={step} progress={progress}>
        {step === "landing" && config && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailCard icon={<Gift size={18} />} title="รางวัลจับต้องได้" detail="โชว์ teaser แบบ coupon จริง ไม่ใช่คำโปรยลอย ๆ" />
              <DetailCard icon={<ShieldCheck size={18} />} title="เภสัชดูน่าเชื่อถือ" detail="ภาพรวมต้องสะอาดแบบ health retail ไม่ใช่เกมแฟลชขายตรง" />
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white/95 p-4 shadow-sm ring-1 ring-emerald-100/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Campaign Highlights</div>
                  <h3 className="mt-1 text-lg font-black text-slate-950">เล่นก่อน, reveal ก่อน, เพิ่มเพื่อนตอน claim</h3>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Sparkles size={18} />
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {config.rewardTeasers.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {config.benefitBullets.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <PrimaryButton onClick={() => void setStep("register")}>เริ่มเล่นเลย <ChevronRight size={16} /></PrimaryButton>
          </div>
        )}

        {step === "gate" && (
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-emerald-100 bg-white/95 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-950">สถานะ LINE OA</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {isFriend ? "เพิ่มเพื่อนแล้ว พร้อมปลดล็อกสิทธิ์ต่อ" : "ยังไม่ได้เพิ่มเพื่อน, ต้องผ่านขั้นนี้ก่อนรับคูปอง"}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <HeartHandshake size={18} />
                </div>
              </div>
              {reward ? (
                <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  รางวัลของคุณถูกจองไว้แล้ว เหลือแค่เพิ่มเพื่อนเพื่อรับ code
                </div>
              ) : null}
            </div>

            {!isFriend && (
              <a
                href={config?.addFriendUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                onClick={() => void logEvent("add_friend_click", { qrId: source.qrId ?? null }, "gate")}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700"
              >
                เพิ่มเพื่อน LINE OA ตอนนี้
              </a>
            )}

            <SecondaryButton
              onClick={async () => {
                const nextFriendship = await refreshFriendship();
                const unlocked = Boolean(nextFriendship?.friendFlag);
                if (unlocked) {
                  await logEvent("add_friend_success", { friendFlag: true, qrId: source.qrId ?? null }, "gate");
                }
                setStep(unlocked ? gateReturnStep : gateReturnStep === "reward" ? "reward" : "register");
              }}
            >
              {isFriend ? "ไปต่อ" : reward ? "ฉันเพิ่มเพื่อนแล้ว ปลดล็อกสิทธิ์" : "ฉันเพิ่มเพื่อนแล้ว"}
            </SecondaryButton>
          </div>
        )}

        {step === "register" && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <label className="rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-emerald-100/60">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700"><UserRound size={14} /> Full name</div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อของคุณ" className="mt-2 w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400" />
              </label>
              <label className="rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-emerald-100/60">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700"><Phone size={14} /> Phone</div>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เบอร์โทร (optional)" className="mt-2 w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400" />
              </label>
              <label className="rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-emerald-100/60">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700"><MapPin size={14} /> Branch</div>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-2 w-full bg-transparent text-base font-medium text-slate-950 outline-none">
                  {(config?.branches ?? ["สาขาใกล้ฉัน"]).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs leading-5 text-slate-500">
              ฟอร์มนี้ตั้งใจให้สั้นแบบ reference, เก็บเฉพาะสิ่งที่ใช้ต่อใน campaign จริง
            </div>
            <PrimaryButton disabled={!name.trim()} onClick={handleRegister}>เริ่มลุ้นเลย</PrimaryButton>
          </div>
        )}

        {step === "shake" && (
          <div className="space-y-4 text-center">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/95 p-4 shadow-sm ring-1 ring-emerald-100/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <Smartphone size={24} />
              </div>
              <div className="mt-3 text-lg font-black text-slate-950">เลือก 1 ลูกเพื่อเปิดรางวัล</div>
              <div className="mt-1 text-sm text-slate-500">ถ้าอยากเก็บคำว่า shake ไว้ ใช้เป็น microcopy ได้ แต่ interaction หลักให้ผู้ใช้แตะเลย</div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {CAPSULES.map((capsule) => (
                  <CapsuleButton key={capsule.id} tone={capsule.className} disabled={drawing} onClick={handleDraw} />
                ))}
              </div>
            </div>
            <SecondaryButton disabled={drawing} onClick={handleDraw}>{drawing ? "กำลังสุ่มรางวัล..." : "สุ่มอัตโนมัติแทน"}</SecondaryButton>
          </div>
        )}

        {step === "reward" && reward && (
          <div className="space-y-4">
            <RewardTicketCard reward={reward} label="Main Reward" />
            {!isFriend ? (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                คุณได้รางวัลแล้ว, เหลือแค่เพิ่มเพื่อนก่อนรับ coupon เข้าวอลเล็ต
              </div>
            ) : null}
            <PrimaryButton onClick={handleClaim} disabled={claiming}>
              {claiming ? "กำลังบันทึกสิทธิ์..." : !isFriend ? "เพิ่มเพื่อนเพื่อปลดล็อกรางวัล" : "รับสิทธิ์เลย"}
            </PrimaryButton>
          </div>
        )}

        {step === "wallet" && reward && (
          <div className="space-y-4">
            <RewardTicketCard reward={reward} label={reward.status === "redeemed" ? "Coupon Redeemed" : "Coupon Claimed"} />
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-950">วิธีใช้สิทธิ์</div>
                  <div className="mt-1">แสดง code นี้ให้พนักงานที่หน้าร้าน, ลูกค้าไม่ต้องกด redeem เอง</div>
                  {reward.expiresAt ? <div className="mt-2 text-xs text-slate-500">ใช้ได้ถึง {formatThaiDate(reward.expiresAt)}</div> : null}
                </div>
              </div>
            </div>
            <PrimaryButton onClick={handleFinishWallet}>เข้าใจแล้ว</PrimaryButton>
          </div>
        )}

        {step === "success" && reward && (
          <div className="space-y-4 text-center">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/95 p-5 shadow-sm ring-1 ring-emerald-100/60">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={30} />
              </div>
              <div className="mt-4 text-2xl font-black tracking-tight text-slate-950">บันทึกสิทธิ์เรียบร้อยแล้ว</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">เก็บหน้านี้ไว้หรือแคปจอ แล้วแสดงโค้ดกับพนักงานเมื่อมาซื้อหน้าร้าน</p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                {reward.title} · {reward.couponCode}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              <DetailCard icon={<HeartHandshake size={18} />} title="OA ถูกเพิ่มแล้ว" detail="ได้ทั้ง acquisition และ reward redemption ใน flow เดียว" />
              <DetailCard icon={<Gift size={18} />} title="coupon พร้อมใช้" detail="พา user ไปจบที่หน้าร้านได้จริง ไม่ใช่แค่ animation สวย" />
            </div>
            <SecondaryButton onClick={() => setStep("landing")}>กลับหน้าแคมเปญ</SecondaryButton>
          </div>
        )}
      </PhoneFrame>
    </div>
  );
}
