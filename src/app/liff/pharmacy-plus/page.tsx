"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ClipboardList,
  Gift,
  HeartHandshake,
  LoaderCircle,
  MapPin,
  Phone,
  Pill,
  Sparkles,
  Smartphone,
  Store,
  Ticket,
  Trophy,
  UserRound,
  ShieldCheck,
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

const BOARD_STEPS = [
  { key: "register", title: "กรอกข้อมูล", description: "กรอกครั้งเดียวก่อนเล่น", icon: ClipboardList },
  { key: "shake", title: "เขย่าโทรศัพท์", description: "ผสมลูกบอลให้เข้ากัน", icon: Smartphone },
  { key: "pick", title: "แตะเลือก 1 ลูก", description: "ลุ้นจากลูกที่ชอบ", icon: Pill },
  { key: "reward", title: "รับรางวัล", description: "ปลดล็อกผ่าน LINE", icon: Gift },
] as const;

const BOARD_KEYS = BOARD_STEPS.map((item) => item.key) as readonly Step[];

const BALLS = [
  { color: "bg-[#ff6464]", gloss: "bg-[#ffd2d2]" },
  { color: "bg-[#ffc247]", gloss: "bg-[#fff0b6]" },
  { color: "bg-[#4ea7ff]", gloss: "bg-[#d7ebff]" },
  { color: "bg-[#58c247]", gloss: "bg-[#d5ffbe]" },
  { color: "bg-[#ff7ec3]", gloss: "bg-[#ffd6ef]" },
  { color: "bg-[#8f67ff]", gloss: "bg-[#e3d9ff]" },
  { color: "bg-[#7fd8f2]", gloss: "bg-[#def8ff]" },
  { color: "bg-[#ffffff]", gloss: "bg-[#f2f2f2]" },
] as const;

const SHAKE_BALLS = [
  { color: "bg-[#ff6464]", gloss: "bg-[#ffd2d2]" },
  { color: "bg-[#ffc247]", gloss: "bg-[#fff0b6]" },
  { color: "bg-[#4ea7ff]", gloss: "bg-[#d7ebff]" },
  { color: "bg-[#58c247]", gloss: "bg-[#d5ffbe]" },
  { color: "bg-[#ff7ec3]", gloss: "bg-[#ffd6ef]" },
  { color: "bg-[#8f67ff]", gloss: "bg-[#e3d9ff]" },
  { color: "bg-[#7fd8f2]", gloss: "bg-[#def8ff]" },
  { color: "bg-[#ffffff]", gloss: "bg-[#f2f2f2]" },
  { color: "bg-[#ff6464]", gloss: "bg-[#ffd2d2]" },
  { color: "bg-[#ffc247]", gloss: "bg-[#fff0b6]" },
  { color: "bg-[#4ea7ff]", gloss: "bg-[#d7ebff]" },
  { color: "bg-[#58c247]", gloss: "bg-[#d5ffbe]" },
] as const;

const CLUSTER_LAYOUT = [
  { left: "6%", top: "60%", spin: "pp-jiggle-a" },
  { left: "22%", top: "40%", spin: "pp-jiggle-b" },
  { left: "40%", top: "24%", spin: "pp-jiggle-c" },
  { left: "58%", top: "38%", spin: "pp-jiggle-a" },
  { left: "34%", top: "48%", spin: "pp-jiggle-b" },
  { left: "12%", top: "26%", spin: "pp-jiggle-c" },
  { left: "50%", top: "58%", spin: "pp-jiggle-b" },
  { left: "26%", top: "62%", spin: "pp-jiggle-a" },
  { left: "44%", top: "72%", spin: "pp-jiggle-c" },
  { left: "62%", top: "20%", spin: "pp-jiggle-b" },
  { left: "4%", top: "76%", spin: "pp-jiggle-c" },
  { left: "62%", top: "68%", spin: "pp-jiggle-a" },
] as const;

const PICK_LAYOUT = [
  { left: "10%", top: "10%" },
  { left: "52%", top: "6%" },
  { left: "30%", top: "28%" },
  { left: "68%", top: "34%" },
  { left: "6%", top: "48%" },
  { left: "44%", top: "52%" },
  { left: "72%", top: "62%" },
  { left: "20%", top: "70%" },
] as const;

const STEP_COPY: Record<Step, { eyebrow: string; title: string; description: string }> = {
  landing: {
    eyebrow: "Lucky Draw",
    title: "เขย่าบอล ลุ้นโชค",
    description: "เขย่ามือถือ 1 ครั้ง แล้วเลือก 1 ลูกเพื่อลุ้นรับของรางวัลจากร้านยา",
  },
  register: {
    eyebrow: "Step 1",
    title: "กรอกข้อมูล",
    description: "ฟอร์มสั้นๆ ก่อนเริ่มเกม",
  },
  shake: {
    eyebrow: "Step 2",
    title: "เขย่าโทรศัพท์",
    description: "กดปุ่มเขย่า แล้วดูลูกบอลผสมกันในเครื่อง",
  },
  pick: {
    eyebrow: "Step 3",
    title: "แตะเลือก 1 ลูก",
    description: "เลือกลูกบอลที่ถูกใจ แล้วเปิดรางวัลทันที",
  },
  reward: {
    eyebrow: "Step 4",
    title: "เปิดรางวัล",
    description: "รางวัลของคุณคือ...",
  },
  gate: {
    eyebrow: "LINE Unlock",
    title: "เพิ่มเพื่อนรับสิทธิ์",
    description: "ปลดล็อกคูปองผ่าน LINE OA",
  },
  wallet: {
    eyebrow: "Coupon Wallet",
    title: "สิทธิ์พร้อมใช้",
    description: "โชว์โค้ดนี้ให้พนักงานที่หน้าร้าน",
  },
  success: {
    eyebrow: "Completed",
    title: "เรียบร้อยแล้ว",
    description: "เก็บโค้ดนี้ไว้ใช้ที่ร้านได้เลย",
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

function Ball({
  color,
  gloss,
  selected = false,
  style,
  onClick,
  disabled = false,
  size = "md",
  className = "",
}: {
  color: string;
  gloss: string;
  selected?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-11 w-11" : "h-16 w-16";
  const interactive = Boolean(onClick);
  return (
    <button
      type="button"
      disabled={disabled || !interactive}
      onClick={onClick}
      style={style}
      className={`absolute ${sizeClass} ${selected ? "scale-110" : ""} rounded-full ${color} shadow-[inset_0_-10px_18px_rgba(0,0,0,0.18),0_16px_24px_rgba(15,23,42,0.16)] transition duration-200 ${interactive ? "hover:scale-105 active:scale-95" : "cursor-default"} disabled:cursor-default ${className}`}
    >
      <span className={`pointer-events-none absolute left-3 top-3 h-4 w-4 rounded-full ${gloss} opacity-90 blur-[0.5px]`} />
      <span className="pointer-events-none absolute inset-x-4 bottom-4 h-3 rounded-full bg-white/25 blur-[1px]" />
      {selected ? <span className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-[#43d45f] ring-offset-2 ring-offset-white" /> : null}
    </button>
  );
}

function StoryboardHeader({ current }: { current: Step }) {
  const activeIndex = BOARD_KEYS.indexOf(current);
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Flow</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
          {activeIndex >= 0 ? `${activeIndex + 1}/${BOARD_STEPS.length}` : `0/${BOARD_STEPS.length}`}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BOARD_STEPS.map(({ key, title, icon: Icon }, index) => {
          const isActive = key === current;
          const isDone = activeIndex > index;
          return (
            <div key={key} className="flex flex-col items-center text-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                  isActive
                    ? "bg-[#1bb249] text-white shadow-[0_10px_20px_rgba(27,178,73,0.35)]"
                    : isDone
                      ? "bg-[#d6f7e2] text-[#0f7a43]"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                <Icon size={18} />
              </div>
              <div className={`mt-1 text-[10px] font-bold leading-tight ${isActive ? "text-slate-950" : "text-slate-500"}`}>{title}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1">
        {BOARD_STEPS.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full ${index <= activeIndex ? "bg-[#1bb249]" : "bg-slate-200"}`}
          />
        ))}
      </div>
    </section>
  );
}

function PhoneFrame({ children, step }: { children: ReactNode; step: Step }) {
  const meta = STEP_COPY[step];
  return (
    <section className="rounded-[2.2rem] border border-slate-200/80 bg-white p-2 shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
      <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#dff3ff_0%,#f9fcff_100%)] ring-1 ring-black/5">
        <div className="bg-[#0d456a] px-5 pb-4 pt-3 text-white">
          <div className="mx-auto h-5 w-24 rounded-full bg-slate-950/80" />
          <div className="mt-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#90f1a9]">{meta.eyebrow}</div>
            <h1 className="mt-1 text-[1.75rem] font-black leading-tight tracking-tight">{meta.title}</h1>
            <p className="mt-1.5 text-sm leading-6 text-white/82">{meta.description}</p>
          </div>
        </div>
        <div className="px-5 pb-6 pt-5">{children}</div>
      </div>
    </section>
  );
}

function ShakeBallBox({
  shaking,
  phoneMode = false,
  balls = SHAKE_BALLS,
}: {
  shaking: boolean;
  phoneMode?: boolean;
  balls?: readonly { color: string; gloss: string }[];
}) {
  const container = phoneMode
    ? "relative mx-auto h-[22rem] w-[13rem] rounded-[2.4rem] border-[7px] border-slate-900 bg-[linear-gradient(180deg,#12355b_0%,#0a2540_100%)] shadow-[0_22px_50px_rgba(15,23,42,0.28)]"
    : "relative mx-auto h-72 w-64";

  return (
    <div className={`${container} ${shaking ? "pp-shake" : ""}`}>
      {phoneMode ? (
        <>
          <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
          <div className="absolute left-1/2 top-5 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-700/70" />
        </>
      ) : null}
      <div
        className={
          phoneMode
            ? "absolute inset-x-3 bottom-14 top-10 overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_50%_20%,#d8f4ff_0%,#9ddcff_55%,#5ebbf4_100%)] ring-1 ring-white/40"
            : "absolute inset-0 overflow-hidden rounded-[2rem] border-[6px] border-white/95 bg-[radial-gradient(circle_at_50%_20%,#ffffff_0%,#dff3ff_60%,#a7e0ff_100%)] shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_20px_30px_rgba(15,23,42,0.12)]"
        }
      >
        <div className="pointer-events-none absolute inset-x-4 top-3 h-6 rounded-full bg-white/40 blur-[2px]" />
        {balls.map((ball, index) => {
          const layout = CLUSTER_LAYOUT[index % CLUSTER_LAYOUT.length];
          return (
            <Ball
              key={index}
              color={ball.color}
              gloss={ball.gloss}
              size={phoneMode ? "sm" : "md"}
              style={{ left: layout.left, top: layout.top }}
              className={shaking ? layout.spin : index % 2 === 0 ? "pp-float" : "pp-bob"}
            />
          );
        })}
      </div>
      {phoneMode ? (
        <div className="absolute inset-x-6 bottom-3 flex h-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f8fbff_0%,#d0e6ff_100%)] text-[10px] font-black uppercase tracking-[0.24em] text-[#14457a] shadow-inner">
          Lucky Draw
        </div>
      ) : null}
    </div>
  );
}

function RewardCapsule({ reward }: { reward: CampaignReward }) {
  const amount = reward.title.match(/\d+/)?.[0] ?? "100";
  return (
    <div className="pp-pop relative mx-auto h-72 w-72">
      <div className="absolute left-1/2 top-0 h-36 w-44 -translate-x-1/2 rounded-t-[10rem] rounded-b-[4rem] bg-[radial-gradient(circle_at_30%_25%,#f6ffe8_0%,#bdf16c_34%,#41c94b_75%,#279631_100%)] shadow-[0_22px_40px_rgba(15,23,42,0.16)]" />
      <div className="absolute left-1/2 top-24 h-32 w-44 -translate-x-1/2 rounded-b-[10rem] rounded-t-[4rem] bg-[radial-gradient(circle_at_30%_25%,#f6ffe8_0%,#bdf16c_34%,#41c94b_75%,#279631_100%)] shadow-[0_22px_40px_rgba(15,23,42,0.16)]" />
      <div className="absolute left-1/2 top-[7.7rem] h-24 w-36 -translate-x-1/2 rounded-[1.8rem] bg-white p-3 shadow-[0_18px_30px_rgba(15,23,42,0.12)]">
        <div className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#ff6a7c]">คูปองส่วนลด</div>
        <div className="mt-2 text-center text-3xl font-black text-[#ff6a3d]">{amount}</div>
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
  const [shaking, setShaking] = useState(false);
  const [shakeCompleted, setShakeCompleted] = useState(false);
  const [selectedBall, setSelectedBall] = useState<number | null>(null);
  const [gateReturnStep, setGateReturnStep] = useState<Step>("register");
  const [gateChecking, setGateChecking] = useState(false);
  const [gateAttempts, setGateAttempts] = useState(0);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
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
    if (step !== "gate" || !ready) return;
    void refreshFriendship();
  }, [step, ready, refreshFriendship]);

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
    await logEvent("registration_submit", { branch, qrId: source.qrId ?? null }, "register");
    setShaking(false);
    setShakeCompleted(false);
    setSelectedBall(null);
    setStep("shake");
  };

  const handleShake = async () => {
    if (shaking) return;
    setShaking(true);
    setShakeCompleted(false);
    await logEvent("game_start", { trigger: "shake_tap" }, "shake");
    window.setTimeout(() => {
      setShaking(false);
      setShakeCompleted(true);
    }, 1600);
  };

  const goToPick = () => {
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
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        setTimeout(() => setStep("reward"), 400);
      }
    } finally {
      setDrawing(false);
    }
  };

  const handleClaim = async ({ friendOverride = false }: { friendOverride?: boolean } = {}) => {
    if (!reward) return;
    if (!isFriend && !friendOverride) {
      setGateReturnStep("reward");
      setGateAttempts(0);
      setGateMessage(null);
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

  const handleGateCheck = async () => {
    if (gateChecking) return;
    setGateChecking(true);
    setGateMessage(null);
    try {
      const nextFriendship = await refreshFriendship();
      const unlocked = Boolean(nextFriendship?.friendFlag);
      setGateAttempts((count) => count + 1);
      if (unlocked) {
        await logEvent("add_friend_success", { friendFlag: true, qrId: source.qrId ?? null }, "gate");
        setGateMessage(null);
        await handleClaim({ friendOverride: true });
        return;
      }
      setGateMessage("ยังไม่พบสถานะเพิ่มเพื่อน ลองกดเพิ่มเพื่อนแล้วกลับมาตรวจสอบอีกครั้ง");
    } finally {
      setGateChecking(false);
    }
  };

  const handleGateBypass = async () => {
    if (claiming) return;
    await logEvent("add_friend_success", { friendFlag: false, bypass: true, qrId: source.qrId ?? null }, "gate");
    await handleClaim({ friendOverride: true });
  };

  const handleFinishWallet = () => {
    if (!reward) return;
    setStep("success");
  };

  const boardStep: Step = step === "landing" ? "register" : step === "gate" || step === "wallet" || step === "success" ? "reward" : step;
  const isGameMode = step === "shake" || step === "pick" || step === "reward";

  return (
    <>
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 pb-24">
      {step === "landing" ? (
        <LandingHero onStart={() => setStep("register")} rewardTeasers={config?.rewardTeasers ?? []} />
      ) : isGameMode ? null : (
        <>
          <StoryboardHeader current={boardStep} />
          <PhoneFrame step={step}>
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
                      <PrimaryButton className="mt-4" disabled={!name.trim()} onClick={handleRegister}>ถัดไป · เขย่าโทรศัพท์</PrimaryButton>
                      <div className="mt-3 text-xs leading-5 text-slate-500">* ข้อมูลของคุณจะถูกเก็บเป็นความลับ</div>
                    </div>
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
                      <PrimaryButton className="mt-3" onClick={handleGateCheck} disabled={gateChecking || claiming}>
                        {gateChecking ? "กำลังตรวจสอบ..." : isFriend ? "ไปต่อ" : "ฉันเพิ่มเพื่อนแล้ว"}
                      </PrimaryButton>
                      {gateMessage ? (
                        <div className="mt-3 rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
                          {gateMessage}
                        </div>
                      ) : null}
                      {gateAttempts >= 2 && !isFriend ? (
                        <SecondaryButton className="mt-3" onClick={handleGateBypass} disabled={claiming}>
                          ยืนยันว่าเพิ่มแล้ว ดำเนินการต่อ
                        </SecondaryButton>
                      ) : null}
                      <SecondaryButton className="mt-3" onClick={() => setStep(gateReturnStep)} disabled={claiming || gateChecking}>
                        กลับไปหน้ารางวัล
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
                    <SecondaryButton onClick={() => setStep("landing")}>กลับหน้าแรก</SecondaryButton>
                  </div>
                )}
              </>
            )}
          </PhoneFrame>
        </>
      )}
    </div>
    {isGameMode ? (
      <GameOverlay
        step={step as "shake" | "pick" | "reward"}
        shaking={shaking}
        shakeCompleted={shakeCompleted}
        selectedBall={selectedBall}
        drawing={drawing}
        reward={reward}
        isFriend={isFriend}
        claiming={claiming}
        onShake={handleShake}
        onGoToPick={goToPick}
        onPickBall={(i) => void handlePickBall(i)}
        onClaim={() => void handleClaim()}
      />
    ) : null}
    </>
  );
}

function GameOverlay({
  step,
  shaking,
  shakeCompleted,
  selectedBall,
  drawing,
  reward,
  isFriend,
  claiming,
  onShake,
  onGoToPick,
  onPickBall,
  onClaim,
}: {
  step: "shake" | "pick" | "reward";
  shaking: boolean;
  shakeCompleted: boolean;
  selectedBall: number | null;
  drawing: boolean;
  reward: CampaignReward | null;
  isFriend: boolean;
  claiming: boolean;
  onShake: () => void;
  onGoToPick: () => void;
  onPickBall: (index: number) => void;
  onClaim: () => void;
}) {
  const stageIndex = step === "shake" ? 0 : step === "pick" ? 1 : 2;
  const stageEn = step === "shake" ? "SHAKE" : step === "pick" ? "PICK" : "REVEAL";

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden text-white"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1d3b76 0%, #0c1a3f 55%, #030714 100%)" }}
    >
      <div className="pp-stars pointer-events-none absolute inset-0 opacity-70" />
      <div className="pp-sweep pointer-events-none absolute inset-0" />

      <div className="relative flex w-full flex-col" style={{ minHeight: "100dvh" }}>
        <header className="flex items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
              <Pill size={16} className="text-emerald-300" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-300">Pharmacy+ Lucky Draw</div>
              <div className="text-[11px] font-semibold text-white/70">
                STAGE {stageIndex + 1}/3 · <span className="text-white">{stageEn}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < stageIndex
                    ? "w-5 bg-emerald-400/70"
                    : i === stageIndex
                      ? "w-7 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                      : "w-3 bg-white/20"
                }`}
              />
            ))}
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-4">
          {step === "shake" && (
            <ShakeArena shaking={shaking} completed={shakeCompleted} onShake={onShake} onNext={onGoToPick} />
          )}
          {step === "pick" && (
            <PickArena selectedBall={selectedBall} drawing={drawing} onPick={onPickBall} />
          )}
          {step === "reward" && reward && (
            <RewardArena reward={reward} isFriend={isFriend} onClaim={onClaim} claiming={claiming} />
          )}
        </div>
      </div>
    </div>
  );
}

function GameButton({
  children,
  pulse = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pulse?: boolean }) {
  return (
    <button
      {...props}
      className={`relative inline-flex w-full items-center justify-center gap-2.5 rounded-[1.6rem] bg-gradient-to-b from-[#3ae080] to-[#0b8f3d] px-8 py-4 text-base font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_38px_rgba(14,140,60,0.45),inset_0_-5px_0_rgba(0,0,0,0.22),inset_0_2px_0_rgba(255,255,255,0.35)] transition-transform active:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${pulse ? "pp-neon-ring" : ""} ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-2 top-1 h-1/2 rounded-[1.3rem] bg-gradient-to-b from-white/30 to-white/0" />
      <span className="relative z-[1] flex items-center gap-2">{children}</span>
    </button>
  );
}

function BigShakeJar({ shaking }: { shaking: boolean }) {
  return (
    <div className={`relative mx-auto aspect-[4/5] w-full max-w-[19rem] ${shaking ? "pp-shake" : ""}`}>
      <div className="pointer-events-none absolute -inset-6 rounded-[3.5rem] bg-[radial-gradient(circle_at_50%_35%,rgba(94,204,255,0.4)_0%,rgba(94,204,255,0)_65%)] blur-xl" />
      <div className="absolute inset-0 overflow-hidden rounded-[2.8rem] border-[6px] border-white/85 bg-[radial-gradient(circle_at_50%_20%,#ffffff_0%,#dff3ff_55%,#8bc7f2_100%)] shadow-[inset_0_0_40px_rgba(255,255,255,0.9),0_30px_55px_rgba(5,14,36,0.55)]">
        <div className="pointer-events-none absolute inset-x-8 top-4 h-8 rounded-full bg-white/60 blur-[3px]" />
        {SHAKE_BALLS.map((ball, index) => {
          const layout = CLUSTER_LAYOUT[index % CLUSTER_LAYOUT.length];
          return (
            <Ball
              key={index}
              color={ball.color}
              gloss={ball.gloss}
              size="md"
              style={{ left: layout.left, top: layout.top }}
              className={shaking ? layout.spin : index % 2 === 0 ? "pp-float" : "pp-bob"}
            />
          );
        })}
      </div>
      <div className="absolute inset-x-10 -bottom-2 flex h-11 items-center justify-center rounded-[1.3rem] bg-[linear-gradient(180deg,#ffe27a_0%,#e99b1a_100%)] text-[11px] font-black uppercase tracking-[0.3em] text-[#4a3100] shadow-[0_10px_20px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(255,255,255,0.5)]">
        Pharmacy+
      </div>
    </div>
  );
}

function ShakeArena({
  shaking,
  completed,
  onShake,
  onNext,
}: {
  shaking: boolean;
  completed: boolean;
  onShake: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 ring-1 ring-emerald-300/30">
          <Sparkles size={10} /> Step 1 of 3
        </div>
        <h1 className="mt-2 text-[2.1rem] font-black leading-none tracking-tight drop-shadow-[0_4px_12px_rgba(52,211,153,0.25)]">
          {shaking ? "กำลังเขย่า..." : completed ? "พร้อมเลือกแล้ว!" : "เขย่าจับโชค"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/70">
          {shaking
            ? "บอลกำลังกระเด้งในเครื่อง อย่าเพิ่งปล่อย!"
            : completed
              ? "ไปแตะเลือกลูกโชคดีได้เลย"
              : "แตะปุ่มด้านล่างเพื่อคลุกลูกบอล"}
        </p>
      </div>

      <div className="my-6 flex w-full flex-1 items-center justify-center">
        <BigShakeJar shaking={shaking} />
      </div>

      <div className="w-full max-w-xs">
        {completed ? (
          <GameButton onClick={onNext}>
            <Pill size={18} />
            <span>เลือกลูกโชคดี</span>
          </GameButton>
        ) : (
          <GameButton onClick={onShake} disabled={shaking} pulse={!shaking}>
            <Smartphone size={18} />
            <span>{shaking ? "กำลังเขย่า" : "เขย่าเลย"}</span>
          </GameButton>
        )}
      </div>
    </>
  );
}

function PickArena({
  selectedBall,
  drawing,
  onPick,
}: {
  selectedBall: number | null;
  drawing: boolean;
  onPick: (index: number) => void;
}) {
  return (
    <>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 ring-1 ring-emerald-300/30">
          <Sparkles size={10} /> Step 2 of 3
        </div>
        <h1 className="mt-2 text-[2.1rem] font-black leading-none tracking-tight">
          {drawing ? "กำลังเปิดรางวัล..." : "แตะเลือก 1 ลูก"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/70">
          {drawing ? "เสี่ยงทายของคุณกำลังเปิดออก" : "เลือกลูกบอลที่รู้สึกใช่ แล้วเปิดรางวัลทันที"}
        </p>
      </div>

      <div className="my-4 flex w-full flex-1 items-center justify-center">
        <div className="relative h-80 w-full max-w-[22rem]">
          <div className="pointer-events-none absolute inset-0 -m-6 rounded-[3rem] bg-[radial-gradient(ellipse_at_50%_50%,rgba(94,211,155,0.22)_0%,rgba(94,211,155,0)_70%)] blur-md" />
          {BALLS.map((ball, index) => (
            <Ball
              key={index}
              color={ball.color}
              gloss={ball.gloss}
              size="lg"
              selected={selectedBall === index}
              disabled={drawing}
              onClick={() => onPick(index)}
              style={PICK_LAYOUT[index]}
              className={
                selectedBall === null && !drawing
                  ? "pp-float"
                  : selectedBall === index
                    ? "pp-pop"
                    : "opacity-40"
              }
            />
          ))}
        </div>
      </div>

      <div className="flex h-10 items-center justify-center">
        {drawing ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-5 py-2 ring-1 ring-emerald-400/40 backdrop-blur">
            <LoaderCircle className="animate-spin text-emerald-300" size={16} />
            <div className="text-sm font-semibold text-emerald-100">กำลังเปิดรางวัล...</div>
          </div>
        ) : (
          <div className="text-xs text-white/50">แตะ 1 ลูกเพื่อเปิดรางวัล</div>
        )}
      </div>
    </>
  );
}

function RewardArena({
  reward,
  isFriend,
  onClaim,
  claiming,
}: {
  reward: CampaignReward;
  isFriend: boolean;
  onClaim: () => void;
  claiming: boolean;
}) {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.42 },
      colors: ["#ffd64a", "#ff6b6b", "#4ea7ff", "#58c247", "#ff7ec3"],
    });
  }, []);

  return (
    <>
      <div className="pp-flash pointer-events-none absolute inset-0 bg-white" />
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-amber-200 ring-1 ring-amber-300/40">
          <Trophy size={12} /> You win!
        </div>
        <h1 className="mt-3 text-[2.3rem] font-black leading-none tracking-tight drop-shadow-[0_4px_12px_rgba(255,213,74,0.35)]">
          {reward.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/75">{reward.detail}</p>
      </div>

      <div className="my-5 flex flex-1 items-center justify-center">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-16 rounded-full bg-[conic-gradient(from_0deg,rgba(255,213,94,0.35),rgba(255,107,107,0.3),rgba(94,188,255,0.3),rgba(94,247,168,0.35),rgba(255,213,94,0.35))] blur-2xl pp-orbit" />
          <div className="relative">
            <RewardCapsule reward={reward} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <GameButton onClick={onClaim} disabled={claiming}>
          <Ticket size={18} />
          <span>{claiming ? "กำลังบันทึก..." : "รับสิทธิ์ผ่าน LINE"}</span>
        </GameButton>
        {!isFriend ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-2.5 text-center text-xs leading-5 text-amber-100">
            ต้องเพิ่มเพื่อน LINE OA เพื่อปลดล็อกคูปอง
          </div>
        ) : null}
      </div>
    </>
  );
}

function LandingHero({ onStart, rewardTeasers }: { onStart: () => void; rewardTeasers: string[] }) {
  const [previewShaking, setPreviewShaking] = useState(false);

  const triggerPreview = () => {
    if (previewShaking) return;
    setPreviewShaking(true);
    window.setTimeout(() => setPreviewShaking(false), 1400);
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(180deg,#41c07b_0%,#0f7a43_100%)] p-5 pb-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white ring-1 ring-white/30 backdrop-blur">
          <Sparkles size={12} /> Pharmacy+ Lucky Draw
        </div>
        <h1 className="mt-3 text-[2.8rem] font-black leading-[1.02] tracking-tight drop-shadow-[0_4px_0_rgba(11,84,42,0.25)]">
          เขย่าบอล<span className="text-[#ffe1ec]">ลุ้นโชค</span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/90">เขย่า 1 ครั้ง แตะเลือก 1 ลูก แล้วรับรางวัลเลย</p>

        <div
          role="button"
          tabIndex={0}
          onClick={triggerPreview}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              triggerPreview();
            }
          }}
          aria-label="ลองเขย่าลูกบอล"
          className="relative mx-auto mt-5 block h-72 w-full cursor-pointer select-none"
        >
          <div className={`relative mx-auto h-full w-[15rem] ${previewShaking ? "pp-shake" : ""}`}>
            <div className="absolute inset-x-2 top-0 h-20 rounded-t-[5rem] border-x-[6px] border-t-[6px] border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(221,247,255,0.92)_100%)]" />
            <div className="absolute inset-x-2 top-14 bottom-12 overflow-hidden rounded-[2.4rem] border-[6px] border-white/90 bg-[radial-gradient(circle_at_50%_25%,#ffffff_0%,#e6f5ff_55%,#a7dcff_100%)] shadow-[inset_0_0_25px_rgba(255,255,255,0.9),0_22px_32px_rgba(15,23,42,0.18)]">
              <div className="pointer-events-none absolute inset-x-4 top-3 h-6 rounded-full bg-white/50 blur-[2px]" />
              {SHAKE_BALLS.slice(0, 10).map((ball, index) => {
                const layout = CLUSTER_LAYOUT[index % CLUSTER_LAYOUT.length];
                return (
                  <Ball
                    key={index}
                    color={ball.color}
                    gloss={ball.gloss}
                    size="md"
                    style={{ left: layout.left, top: layout.top }}
                    className={previewShaking ? layout.spin : index % 2 === 0 ? "pp-float" : "pp-bob"}
                  />
                );
              })}
            </div>
            <div className="absolute inset-x-6 bottom-0 flex h-14 items-center justify-center rounded-b-[1.8rem] bg-[linear-gradient(180deg,#ffd64a_0%,#f39a1d_100%)] text-sm font-black uppercase tracking-[0.22em] text-[#5a3a00] shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
              Pharmacy+
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-white px-5 py-4 text-lg font-black text-[#0f7a43] shadow-[0_18px_30px_rgba(15,23,42,0.18)] transition hover:bg-[#f4fff8]"
        >
          <Sparkles size={20} /> เริ่มเล่นเลย
        </button>
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <div className="text-lg font-black text-slate-950">วิธีเล่น</div>
        <div className="mt-3 divide-y divide-slate-100">
          {BOARD_STEPS.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#ebfff0] text-[#0f7a43]">
                <Icon size={20} />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f7a43] text-[10px] font-black text-white shadow-sm">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="text-sm font-black text-slate-950">{title}</div>
                <div className="mt-0.5 text-sm leading-6 text-slate-600">{description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {rewardTeasers.length ? (
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#ebfff0] p-1.5 text-[#0f7a43]"><Gift size={14} /></div>
            <div className="text-lg font-black text-slate-950">ของรางวัล</div>
          </div>
          <div className="mt-3 grid gap-2">
            {rewardTeasers.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
