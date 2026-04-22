"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Gift,
  HeartHandshake,
  LoaderCircle,
  MapPin,
  Phone,
  Pill,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
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

const STEPS = ["landing", "register", "shake", "pick", "reward", "gate", "wallet", "success"] as const;
type Step = (typeof STEPS)[number];

const BALLS = [
  { color: "bg-[#58c247]", gloss: "bg-[#d5ffbe]" },
  { color: "bg-[#4ea7ff]", gloss: "bg-[#d7ebff]" },
  { color: "bg-[#f9c846]", gloss: "bg-[#fff0b6]" },
  { color: "bg-[#ff7ec3]", gloss: "bg-[#ffd6ef]" },
  { color: "bg-[#8f67ff]", gloss: "bg-[#e3d9ff]" },
  { color: "bg-[#7fd8f2]", gloss: "bg-[#def8ff]" },
  { color: "bg-[#ffffff]", gloss: "bg-[#f2f2f2]" },
  { color: "bg-[#86d95d]", gloss: "bg-[#ebffd8]" },
] as const;

const BOWL_LAYOUT = [
  { left: "10%", top: "54%" },
  { left: "28%", top: "44%" },
  { left: "47%", top: "56%" },
  { left: "64%", top: "44%" },
  { left: "75%", top: "58%" },
  { left: "18%", top: "68%" },
  { left: "38%", top: "70%" },
  { left: "58%", top: "70%" },
] as const;

const PICK_LAYOUT = [
  { left: "14%", top: "46%" },
  { left: "31%", top: "35%" },
  { left: "48%", top: "49%" },
  { left: "65%", top: "34%" },
  { left: "76%", top: "53%" },
  { left: "24%", top: "63%" },
  { left: "43%", top: "68%" },
  { left: "61%", top: "66%" },
] as const;

const BOARD_STEPS = [
  { title: "กรอกข้อมูล", detail: "กรอกครั้งเดียวก่อนเล่น", icon: ClipboardList },
  { title: "เขย่าโทรศัพท์", detail: "ผสมลูกบอลให้เข้ากัน", icon: Smartphone },
  { title: "แตะเลือก 1 ลูก", detail: "ลุ้นจากลูกที่ชอบ", icon: Pill },
  { title: "รับรางวัล", detail: "ปลดล็อกผ่าน LINE", icon: Gift },
] as const;

const STEP_COPY: Record<Step, { eyebrow: string; title: string; description: string }> = {
  landing: {
    eyebrow: "Lucky Draw Campaign",
    title: "เขย่าบอล ลุ้นโชค",
    description: "เขย่า 1 ครั้ง แล้วเลือก 1 ลูกเพื่อลุ้นรับของรางวัลจากร้านยา",
  },
  register: {
    eyebrow: "Step 1",
    title: "กรอกข้อมูลเพื่อร่วมกิจกรรม",
    description: "ฟอร์มสั้นและจบไว เพื่อพาไปเข้าเกมทันที",
  },
  shake: {
    eyebrow: "Step 2",
    title: "เขย่าโทรศัพท์",
    description: "ให้ลูกบอลผสมกันก่อน แล้วค่อยไปเลือกลูกที่ถูกใจ",
  },
  pick: {
    eyebrow: "Step 3",
    title: "แตะเลือก 1 ลูก",
    description: "เลือกลูกที่คุณชอบ 1 ลูก แล้วระบบจะเปิดของรางวัลให้เลย",
  },
  reward: {
    eyebrow: "Step 4",
    title: "รางวัลของคุณคือ...",
    description: "เปิดรางวัลให้เห็นมูลค่าชัด แล้วค่อยปลดล็อกสิทธิ์ผ่าน LINE",
  },
  gate: {
    eyebrow: "LINE Unlock",
    title: "เพิ่มเพื่อนก่อนรับสิทธิ์",
    description: "เล่นจบแล้ว เหลือแค่เพิ่มเพื่อน LINE OA เพื่อรับคูปองเข้าวอลเล็ต",
  },
  wallet: {
    eyebrow: "Coupon Wallet",
    title: "สิทธิ์ของคุณพร้อมใช้แล้ว",
    description: "ถือ coupon code นี้ไว้ แล้วแสดงให้พนักงานที่หน้าร้าน",
  },
  success: {
    eyebrow: "Completed",
    title: "เรียบร้อยแล้ว",
    description: "คุณได้รับสิทธิ์เรียบร้อย เก็บโค้ดนี้ไว้ใช้ที่ร้านได้เลย",
  },
};

function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[#1bb249] px-5 py-3.5 text-base font-bold text-white shadow-[0_16px_30px_rgba(27,178,73,0.28)] transition hover:bg-[#11953b] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function PhoneFrame({ children, step, progress }: { children: ReactNode; step: Step; progress: number }) {
  const meta = STEP_COPY[step];

  return (
    <section className="rounded-[2.2rem] border border-slate-200/80 bg-white p-2 shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
      <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#dff3ff_0%,#f9fcff_100%)] ring-1 ring-black/5">
        <div className="bg-[#0d456a] px-5 pb-4 pt-3 text-white">
          <div className="mx-auto h-5 w-24 rounded-full bg-slate-950/80" />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#90f1a9]">{meta.eyebrow}</div>
              <h1 className="mt-1 text-[1.9rem] font-black leading-tight tracking-tight">{meta.title}</h1>
              <p className="mt-1.5 max-w-[15rem] text-sm leading-6 text-white/82">{meta.description}</p>
            </div>
            <div className="rounded-2xl bg-white/12 px-3 py-2 text-right ring-1 ring-white/15 backdrop-blur">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Step</div>
              <div className="text-lg font-black text-white">{progress}/{STEPS.length}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((label, index) => (
              <div key={label} className={`h-1.5 flex-1 rounded-full ${index < progress ? "bg-[#6be46f]" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        <div className="px-5 pb-6 pt-5">{children}</div>
      </div>
    </section>
  );
}

function MiniStepCard({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white/90 p-3 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ebfff0] text-[#1aa645]">{icon}</div>
      <div className="mt-2 text-sm font-black text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-600">{detail}</div>
    </div>
  );
}

function Ball({ color, gloss, selected = false, style, onClick, disabled = false, large = false }: { color: string; gloss: string; selected?: boolean; style?: CSSProperties; onClick?: () => void; disabled?: boolean; large?: boolean }) {
  const size = large ? "h-20 w-20" : "h-16 w-16";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={`absolute ${size} ${selected ? "scale-110" : ""} rounded-full ${color} shadow-[inset_0_-10px_18px_rgba(0,0,0,0.16),0_16px_24px_rgba(15,23,42,0.14)] transition duration-200 hover:scale-105 disabled:cursor-default disabled:opacity-80`}
    >
      <span className={`absolute left-3 top-3 h-4 w-4 rounded-full ${gloss} blur-[0.5px] opacity-90`} />
      <span className="absolute inset-x-4 bottom-4 h-3 rounded-full bg-white/25 blur-[1px]" />
      {selected ? <span className="absolute inset-0 rounded-full ring-4 ring-[#43d45f] ring-offset-2 ring-offset-white" /> : null}
    </button>
  );
}

function BowlOfBalls() {
  return (
    <div className="relative mx-auto h-64 w-64">
      <div className="absolute inset-x-6 bottom-0 h-40 rounded-b-[7rem] rounded-t-[3rem] border-[6px] border-white/95 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(221,247,255,0.82)_100%)] shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_20px_30px_rgba(15,23,42,0.12)]" />
      <div className="absolute inset-x-11 bottom-4 h-4 rounded-full bg-[#0db24b]/20 blur-md" />
      {BALLS.map((ball, index) => (
        <Ball key={index} color={ball.color} gloss={ball.gloss} style={BOWL_LAYOUT[index]} />
      ))}
      <div className="absolute left-1/2 top-9 h-20 w-8 -translate-x-1/2 rounded-full bg-white/35 blur-sm" />
    </div>
  );
}

function PhoneMixMock({ mixing, seconds }: { mixing: boolean; seconds: number }) {
  return (
    <div className="relative mx-auto flex h-[17rem] w-[11rem] items-center justify-center rounded-[2.2rem] border-[7px] border-slate-900 bg-[linear-gradient(180deg,#a7e7ff_0%,#eaf7ff_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
      <div className="absolute top-2 h-4 w-20 rounded-full bg-slate-900" />
      {mixing ? (
        <>
          <div className="absolute -left-5 top-14 text-[#35b7e9]">〰</div>
          <div className="absolute -right-5 top-16 text-[#35b7e9]">〰</div>
          <div className="absolute -left-4 bottom-20 text-[#35b7e9]">〰</div>
          <div className="absolute -right-4 bottom-16 text-[#35b7e9]">〰</div>
        </>
      ) : null}
      <div className="absolute inset-x-5 bottom-8 top-9 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#d8f4ff_0%,#f6fcff_100%)]">
        {BALLS.map((ball, index) => {
          const base = PICK_LAYOUT[index];
          return (
            <Ball
              key={index}
              color={ball.color}
              gloss={ball.gloss}
              large={false}
              style={{
                left: base.left,
                top: base.top,
                transform: mixing ? `translate(${Math.sin(index * 2) * 6}px, ${Math.cos(index * 3) * 5}px)` : undefined,
              }}
            />
          );
        })}
      </div>
      <div className="absolute -bottom-4 rounded-full bg-white px-5 py-2 shadow-[0_12px_24px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
        <span className="text-sm font-black text-[#0f6d52]">เหลือเวลา {seconds} วินาที</span>
      </div>
    </div>
  );
}

function RewardCapsule({ reward }: { reward: CampaignReward }) {
  return (
    <div className="relative mx-auto h-72 w-72">
      <div className="absolute left-1/2 top-0 h-36 w-44 -translate-x-1/2 rounded-t-[10rem] rounded-b-[4rem] bg-[radial-gradient(circle_at_30%_25%,#f6ffe8_0%,#bdf16c_34%,#41c94b_75%,#279631_100%)] shadow-[0_22px_40px_rgba(15,23,42,0.16)]" />
      <div className="absolute left-1/2 top-24 h-32 w-44 -translate-x-1/2 rounded-b-[10rem] rounded-t-[4rem] bg-[radial-gradient(circle_at_30%_25%,#f6ffe8_0%,#bdf16c_34%,#41c94b_75%,#279631_100%)] shadow-[0_22px_40px_rgba(15,23,42,0.16)]" />
      <div className="absolute left-1/2 top-[7.7rem] h-24 w-36 -translate-x-1/2 rounded-[1.8rem] bg-white p-3 shadow-[0_18px_30px_rgba(15,23,42,0.12)]">
        <div className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#ff6a7c]">คูปองส่วนลด</div>
        <div className="mt-2 text-center text-3xl font-black text-[#ff6a3d]">{reward.title.match(/\d+/)?.[0] ?? "100"}</div>
        <div className="text-center text-sm font-bold text-slate-700">บาท</div>
      </div>
      <div className="absolute left-8 top-20 text-xl">✨</div>
      <div className="absolute right-8 top-24 text-xl">🎉</div>
      <div className="absolute left-12 bottom-12 text-xl">🎊</div>
      <div className="absolute right-10 bottom-14 text-xl">✨</div>
    </div>
  );
}

function RewardTicketCard({ reward, label }: { reward: CampaignReward; label: string }) {
  return (
    <div className={`rounded-[1.8rem] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${getToneClasses(reward.tone)}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">{label}</div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-black leading-tight">{reward.title}</div>
          <div className="mt-1 text-sm opacity-90">{reward.detail}</div>
        </div>
        <div className="rounded-2xl bg-white/70 p-3 text-slate-900 shadow-sm">
          <Ticket size={22} />
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-white/75 px-4 py-3 text-center text-sm font-black tracking-[0.16em] text-slate-900">{reward.couponCode}</div>
      {reward.expiresAt ? <div className="mt-3 text-xs text-slate-700/80">ใช้ได้ถึง {formatThaiDate(reward.expiresAt)}</div> : null}
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
  const { ready, loggedIn, profile, friendship, refreshFriendship, login, error } = useLiff();
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
  const [mixing, setMixing] = useState(false);
  const [mixSeconds, setMixSeconds] = useState(15);
  const [selectedBall, setSelectedBall] = useState<number | null>(null);
  const [gateReturnStep, setGateReturnStep] = useState<Step>("register");
  const source = useMemo(() => createSourceFromParams(params), [params]);
  const lastStepEventRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pharmacy-plus/config", { cache: "no-store" });
      setConfig(await res.json());
    })();
  }, []);

  useEffect(() => {
    if (!name.trim() && profile?.displayName) {
      setName(profile.displayName);
    }
  }, [name, profile?.displayName]);

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

  useEffect(() => {
    if (step !== "shake" || !mixing) return;

    const timer = window.setInterval(() => {
      setMixSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setMixing(false);
          setStep("pick");
          return 1;
        }
        return current - 1;
      });
    }, 240);

    return () => window.clearInterval(timer);
  }, [mixing, step]);

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
    await logEvent("registration_submit", { branch, qrId: source.qrId ?? null }, "register");
    setMixSeconds(15);
    setSelectedBall(null);
    setStep("shake");
  };

  const handleStartMix = async () => {
    setMixSeconds(15);
    setMixing(true);
    await logEvent("game_start", { trigger: "shake_motion_start" }, "shake");
  };

  const moveToPick = () => {
    setMixing(false);
    setStep("pick");
  };

  const handlePickBall = async (index: number) => {
    if (drawing) return;
    setSelectedBall(index);
    setDrawing(true);
    await logEvent("game_complete", { trigger: "tap_ball", ballIndex: index + 1 }, "pick");

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
          { reward: data.reward.title, storage: data.storage, existing: data.existing ?? false, qrId: source.qrId ?? null, ballIndex: index + 1 },
          "reward",
        );
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 } });
        setTimeout(() => {
          setStep("reward");
        }, 350);
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

  const handleFinishWallet = () => {
    if (!reward) return;
    setStep("success");
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 pb-24">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f4fcff_0%,#ffffff_100%)] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#eafdf2_0%,#ffffff_35%,#fff3f5_100%)] p-4">
          <div className="inline-flex rounded-full bg-[#fff4c7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#876c12]">UI Storyboard</div>
          <h2 className="mt-3 text-[2.1rem] font-black leading-tight tracking-tight text-[#0f7a43]">
            เขย่าบอล
            <span className="text-[#ef5487]">ลุ้นโชค</span>
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">เขย่า 1 ครั้ง แตะเลือก 1 ลูก แล้วรับรางวัลเลย</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
        {BOARD_STEPS.map(({ title, detail, icon: Icon }, index) => (
          <MiniStepCard key={title} icon={<Icon size={18} />} title={`${index + 1}. ${title}`} detail={detail} />
        ))}
      </section>

      <PhoneFrame step={step} progress={progress}>
        {!ready ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <LoaderCircle className="animate-spin text-[#1bb249]" size={28} />
            <div className="text-sm text-slate-600">กำลังเตรียม LINE LIFF...</div>
          </div>
        ) : error ? (
          <div className="space-y-4 rounded-[1.6rem] border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <div className="text-base font-black">เปิด LIFF ไม่สำเร็จ</div>
            <div className="text-sm leading-6">{error}</div>
            {!loggedIn ? <PrimaryButton onClick={login}>เข้าใช้งานผ่าน LINE</PrimaryButton> : null}
          </div>
        ) : (
          <>
            {step === "landing" && config && (
              <div className="space-y-4 text-center">
                <div className="rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,#41c07b_0%,#5bd4b7_100%)] px-4 pb-4 pt-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                  <div className="text-[2.6rem] font-black leading-tight tracking-tight drop-shadow-[0_4px_0_rgba(11,84,42,0.18)]">
                    เขย่าบอล
                    <br />
                    <span className="text-[#ffe1ec]">ลุ้นโชค</span>
                  </div>
                  <div className="mx-auto mt-4 max-w-[12rem] rounded-full bg-white/92 px-4 py-2 text-sm font-bold text-[#1d7043]">
                    ลุ้นรับของรางวัลจากร้านยา
                  </div>
                  <div className="mt-4">
                    <BowlOfBalls />
                  </div>
                  <PrimaryButton className="bg-[#1aa645] hover:bg-[#12863a]" onClick={() => setStep("register")}>
                    เริ่มเล่น
                  </PrimaryButton>
                  <div className="mt-3 text-xs text-white/80">กติกา: เขย่า 1 ครั้ง แล้วแตะเลือก 1 ลูกเพื่อลุ้นรับรางวัล</div>
                </div>

                <div className="grid gap-2">
                  {config.rewardTeasers.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "register" && (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/80 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#ebfff0] text-[#20ab48] shadow-sm">
                    <Store size={34} />
                  </div>
                  <div className="mt-3 text-center text-lg font-black text-slate-950">กรอกข้อมูล เพื่อเข้าร่วมกิจกรรม</div>
                  <div className="mt-4 space-y-3">
                    <label className="block rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"><UserRound size={14} /> ชื่อร้าน / ชื่อผู้เล่น</div>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="กรุณากรอกชื่อร้านยา / ชื่อเล่น" className="mt-2 w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400" />
                    </label>
                    <label className="block rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"><Phone size={14} /> Phone</div>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เบอร์โทร (optional)" className="mt-2 w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400" />
                    </label>
                    <label className="block rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"><MapPin size={14} /> Branch</div>
                      <select value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-2 w-full bg-transparent text-base font-medium text-slate-950 outline-none">
                        {(config?.branches ?? ["สาขาใกล้ฉัน"]).map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <PrimaryButton className="mt-4" disabled={!name.trim()} onClick={handleRegister}>ถัดไป</PrimaryButton>
                  <div className="mt-3 text-xs leading-5 text-slate-500">* ข้อมูลของคุณจะถูกเก็บเป็นความลับ</div>
                </div>
              </div>
            )}

            {step === "shake" && (
              <div className="space-y-5 text-center">
                <PhoneMixMock mixing={mixing} seconds={mixSeconds} />
                <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  {mixing ? "กำลังผสมลูกบอลอยู่... อีกนิดเดียวแล้วค่อยไปเลือกลูกที่ชอบ" : "กดเขย่าเพื่อเริ่มผสมลูกบอล หรือข้ามไปเลือกลูกได้เลย"}
                </div>
                {!mixing ? (
                  <div className="grid gap-3">
                    <PrimaryButton onClick={handleStartMix}>เขย่าโทรศัพท์</PrimaryButton>
                    <SecondaryButton onClick={moveToPick}>ข้ามไปเลือกลูก</SecondaryButton>
                  </div>
                ) : (
                  <SecondaryButton onClick={moveToPick}>ผสมเสร็จแล้ว ไปเลือก 1 ลูก</SecondaryButton>
                )}
              </div>
            )}

            {step === "pick" && (
              <div className="space-y-4 text-center">
                <div className="rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,#b8e3ff_0%,#f2fbff_100%)] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <div className="text-2xl font-black text-slate-950">แตะเลือก 1 ลูกที่คุณชอบ</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">เลือกได้แค่ 1 ลูกนะ แล้วระบบจะเปิดรางวัลให้ทันที</div>

                  <div className="relative mx-auto mt-5 h-80 w-full max-w-[17rem]">
                    {BALLS.map((ball, index) => (
                      <Ball
                        key={index}
                        color={ball.color}
                        gloss={ball.gloss}
                        large
                        selected={selectedBall === index}
                        disabled={drawing}
                        onClick={() => void handlePickBall(index)}
                        style={PICK_LAYOUT[index]}
                      />
                    ))}
                  </div>
                </div>
                {drawing ? <div className="text-sm font-semibold text-[#159243]">กำลังเปิดรางวัล...</div> : null}
              </div>
            )}

            {step === "reward" && reward && (
              <div className="space-y-4 text-center">
                <div className="rounded-[1.75rem] border border-white/80 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <RewardCapsule reward={reward} />
                  <div className="-mt-2 text-3xl font-black tracking-tight text-slate-950">{reward.title}</div>
                  <div className="mt-2 text-base font-bold text-slate-700">{reward.detail}</div>
                </div>
                <PrimaryButton onClick={handleClaim} disabled={claiming}>
                  {claiming ? "กำลังบันทึกสิทธิ์..." : !isFriend ? "รับสิทธิ์ผ่าน LINE" : "รับสิทธิ์ผ่าน LINE"}
                </PrimaryButton>
                {!isFriend ? (
                  <div className="rounded-[1.4rem] border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                    เล่นจบและได้รางวัลแล้ว เหลือแค่เพิ่มเพื่อน LINE OA เพื่อปลดล็อกคูปอง
                  </div>
                ) : null}
              </div>
            )}

            {step === "gate" && (
              <div className="space-y-4 text-center">
                <div className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#ebfff0] text-[#18a645] shadow-sm">
                    <HeartHandshake size={34} />
                  </div>
                  <div className="mt-4 text-2xl font-black tracking-tight text-slate-950">เพิ่มเพื่อน LINE OA</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">ปลดล็อกสิทธิ์รับคูปองและเก็บไว้ใน LINE ของคุณ</div>
                  <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    สถานะปัจจุบัน: <span className="font-bold text-slate-950">{isFriend ? "เพิ่มเพื่อนแล้ว" : "ยังไม่ได้เพิ่มเพื่อน"}</span>
                  </div>
                  {!isFriend ? (
                    <a
                      href={config?.addFriendUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => void logEvent("add_friend_click", { qrId: source.qrId ?? null }, "gate")}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-[1.35rem] bg-[#1bb249] px-5 py-3.5 text-base font-bold text-white shadow-[0_16px_30px_rgba(27,178,73,0.28)] transition hover:bg-[#11953b]"
                    >
                      เพิ่มเพื่อน
                    </a>
                  ) : null}
                  <SecondaryButton
                    className="mt-3"
                    onClick={async () => {
                      const nextFriendship = await refreshFriendship();
                      const unlocked = Boolean(nextFriendship?.friendFlag);
                      if (unlocked) {
                        await logEvent("add_friend_success", { friendFlag: true, qrId: source.qrId ?? null }, "gate");
                      }
                      setStep(unlocked ? gateReturnStep : "reward");
                    }}
                  >
                    {isFriend ? "ไปต่อ" : "ฉันเพิ่มเพื่อนแล้ว"}
                  </SecondaryButton>
                </div>
              </div>
            )}

            {step === "wallet" && reward && (
              <div className="space-y-4">
                <RewardTicketCard reward={reward} label={reward.status === "redeemed" ? "Coupon Redeemed" : "Coupon Claimed"} />
                <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[#ebfff0] p-2 text-[#17a643]">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-950">วิธีใช้สิทธิ์</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">แสดงโค้ดนี้ให้พนักงานที่หน้าร้าน ลูกค้าไม่ต้องกด redeem เองในหน้านี้</div>
                      {reward.expiresAt ? <div className="mt-2 text-xs text-slate-500">ใช้ได้ถึง {formatThaiDate(reward.expiresAt)}</div> : null}
                    </div>
                  </div>
                </div>
                <PrimaryButton onClick={handleFinishWallet}>เข้าใจแล้ว</PrimaryButton>
              </div>
            )}

            {step === "success" && reward && (
              <div className="space-y-4 text-center">
                <div className="rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,#d9f8e4_0%,#ffffff_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ecfff2] text-[#19a744]">
                    <CheckCircle2 size={30} />
                  </div>
                  <div className="mt-4 text-3xl font-black tracking-tight text-slate-950">เรียบร้อย!</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">คุณได้รับสิทธิ์เรียบร้อยแล้ว เก็บหน้านี้ไว้หรือแคปจอ แล้วแสดงโค้ดกับพนักงานเมื่อใช้สิทธิ์</p>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900">
                    {reward.title} · {reward.couponCode}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStepCard icon={<Sparkles size={18} />} title="ลุ้นง่าย" detail="เขย่า + แตะเลือก 1 ลูก จบไวเข้าใจง่าย" />
                  <MiniStepCard icon={<Gift size={18} />} title="ใช้สิทธิ์ได้จริง" detail="รับคูปองผ่าน LINE แล้วไปใช้ที่หน้าร้าน" />
                </div>
                <SecondaryButton onClick={() => setStep("landing")}>กลับหน้าแรก</SecondaryButton>
              </div>
            )}
          </>
        )}
      </PhoneFrame>
    </div>
  );
}
