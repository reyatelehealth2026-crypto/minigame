"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Eye,
  Gift,
  HeartHandshake,
  LoaderCircle,
  LogIn,
  Pill,
  Sparkles,
  Smartphone,
  Ticket,
  Trophy,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLiff } from "@/components/LiffProvider";
import {
  getSfxMutedSnapshot,
  playGlassCrack,
  playHeartbeat,
  playReveal,
  playSoftConfirm,
  playTap,
  playWin,
  setSfxMuted,
  startSustainedRumble,
  subscribeSfxMute,
  unlockSfxFromUserGesture,
} from "@/lib/pharmacy-plus-audio";
import { safeVibrate } from "@/lib/pharmacy-plus-feedback";
import {
  CAMPAIGN_KEY,
  createSourceFromParams,
  postCampaignEvent,
  type CampaignConfig,
  type CampaignDrawResponse,
  type CampaignEventName,
  type CampaignReward,
} from "@/lib/pharmacy-plus";
import { Capsule, CAPSULE_TONES, type CapsuleTone } from "@/components/pharmacy/Capsule";
import { RewardReveal } from "@/components/pharmacy/RewardReveal";
import { classifyReward } from "@/lib/pharmacy-plus-theme";

type Step = "landing" | "play" | "reward" | "gate" | "wallet" | "success";
type PlayPhase = "idle" | "shaking" | "settled" | "drawing";
const STAFF_PROMPT = "โชว์โค้ดนี้กับพนักงานที่ร้าน";

const BOARD_STEPS = [
  { key: "play", title: "เขย่าเลือก", description: "เขย่าแล้วแตะลูกที่ใช่", icon: Smartphone },
  { key: "reward", title: "เปิดรางวัล", description: "ลุ้นรางวัลที่ได้", icon: Gift },
  { key: "wallet", title: "รับสิทธิ์", description: "ปลดล็อกผ่าน LINE", icon: HeartHandshake },
] as const;

const BOARD_KEYS = BOARD_STEPS.map((item) => item.key) as readonly Step[];

const CAPSULE_LIST: readonly CapsuleTone[] = [CAPSULE_TONES[2], CAPSULE_TONES[0], CAPSULE_TONES[4]];

const CLUSTER_LAYOUT = [
  { left: "16%", top: "46%" },
  { left: "42%", top: "18%" },
  { left: "66%", top: "46%" },
] as const;

const PICK_LAYOUT = [
  { left: "14%", top: "36%" },
  { left: "42%", top: "18%" },
  { left: "68%", top: "36%" },
] as const;

const STEP_COPY: Record<Exclude<Step, "play">, { eyebrow: string; title: string; description: string }> = {
  landing: { eyebrow: "Lucky Draw", title: "เขย่าบอล ลุ้นโชค", description: "เขย่ามือถือแล้วแตะ 1 ลูกเพื่อรับรางวัล" },
  reward: { eyebrow: "Your Reward", title: "เปิดรางวัล", description: "" },
  gate: { eyebrow: "LINE Unlock", title: "เพิ่มเพื่อนรับสิทธิ์", description: "ปลดล็อกคูปองผ่าน LINE OA" },
  wallet: { eyebrow: "Coupon Wallet", title: "สิทธิ์พร้อมใช้", description: STAFF_PROMPT },
  success: { eyebrow: "Completed", title: "เรียบร้อยแล้ว", description: STAFF_PROMPT },
};

function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] px-5 py-3.5 text-base font-bold tracking-wide text-[#1A2520] shadow-[0_16px_30px_rgba(212,175,122,0.4),inset_0_1px_0_rgba(255,255,255,0.55)] transition hover:brightness-105 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-[#D4AF7A]/40 bg-transparent px-5 py-3.5 text-base font-semibold text-[#F5EFE0] transition hover:bg-[#F5EFE0]/5 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function StoryboardHeader({ current }: { current: Step }) {
  const rawIndex = BOARD_KEYS.indexOf(current);
  const activeIndex = Math.max(0, rawIndex);
  const nextStep = BOARD_STEPS[activeIndex + 1];
  const nextLabel = nextStep ? `ขั้นตอนถัดไป: ${nextStep.title}` : "ขั้นตอนถัดไป: เสร็จแล้ว";
  return (
    <section className="rounded-[1.8rem] border border-[#D4AF7A]/30 bg-[#0A4632]/70 p-3 backdrop-blur-md shadow-[0_16px_40px_rgba(3,38,28,0.45)]">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="text-[10px] font-bold tracking-[0.2em] text-[#C8C0A8]">ขั้นตอน</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#E8C994]">
          {`${activeIndex + 1}/${BOARD_STEPS.length}`}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {BOARD_STEPS.map(({ key, title, icon: Icon }, index) => {
          const isActive = key === current;
          const isDone = activeIndex > index;
          return (
            <div key={key} className="flex flex-col items-center text-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                  isActive
                    ? "border border-[#F8E4B6] bg-[linear-gradient(180deg,#F7DCA9,#D4AF7A)] text-[#0A2D21] shadow-[0_12px_28px_rgba(212,175,122,0.45)]"
                    : isDone
                      ? "border border-[#D4AF7A]/20 bg-[#D4AF7A]/12 text-[#E8C994]/75"
                      : "border border-[#F5EFE0]/5 bg-[#F5EFE0]/[0.03] text-[#C8C0A8]/40"
                }`}
              >
                <Icon size={18} />
              </div>
              <div className={`mt-1 text-[10px] font-bold leading-tight ${isActive ? "text-[#FFF8E8]" : isDone ? "text-[#C8C0A8]/75" : "text-[#C8C0A8]/50"}`}>{title}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1">
        {BOARD_STEPS.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full ${index <= activeIndex ? "bg-[linear-gradient(90deg,#D4AF7A,#E8C994)]" : "bg-[#F5EFE0]/10"}`}
          />
        ))}
      </div>
      <div className="mt-2 px-1 text-[10px] font-medium text-[#C8C0A8]">{nextLabel}</div>
    </section>
  );
}

function PhoneFrame({ children, step }: { children: ReactNode; step: Exclude<Step, "play"> }) {
  const meta = STEP_COPY[step];
  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-[#D4AF7A]/30 bg-[#063A2A]/80 p-2 shadow-[0_30px_80px_rgba(3,18,12,0.55)] backdrop-blur-md">
      <div className="pp-noise-overlay" />
      <div className="relative overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0A4632_0%,#063A2A_100%)] ring-1 ring-[#D4AF7A]/20">
        <div className="px-6 pb-4 pt-6 text-[#F5EFE0]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#E8C994]">{meta.eyebrow}</div>
          <h1 className="font-pp-display mt-2 text-[2rem] font-semibold leading-tight tracking-tight">{meta.title}</h1>
          {meta.description ? <p className="mt-1.5 text-sm leading-6 text-[#C8C0A8]">{meta.description}</p> : null}
          <div className="pp-gold-divider mt-4" />
        </div>
        <div className="px-6 pb-6 pt-3">{children}</div>
      </div>
    </section>
  );
}

function formatThaiDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function rewardToneToCapsule(tone: CampaignReward["tone"]): CapsuleTone {
  switch (tone) {
    case "green": return "sage";
    case "blue": return "cobalt";
    default: return "amber";
  }
}

function rewardAmount(title: string): number | null {
  const m = title.match(/\d+/);
  return m ? Number(m[0]) : null;
}

function RewardTicketCard({
  reward,
  label,
  copied,
  onCopyCode,
  onShowForStaff,
  staffMode,
}: {
  reward: CampaignReward;
  label: string;
  copied: boolean;
  onCopyCode: () => void;
  onShowForStaff: () => void;
  staffMode: boolean;
}) {
  return (
    <div className="rounded-[1.8rem] border border-[#D4AF7A]/40 bg-[linear-gradient(180deg,#0F5A3D_0%,#063A2A_100%)] p-5 text-[#F5EFE0] shadow-[0_24px_48px_rgba(3,18,12,0.6)]">
      <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#E8C994]">{label}</div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <div className="font-pp-display text-2xl font-semibold leading-tight">{reward.title}</div>
          <div className="mt-1 text-sm leading-snug text-[#C8C0A8]">{reward.detail}</div>
        </div>
        <div className="rounded-2xl border border-[#D4AF7A]/30 bg-[#063A2A] p-3 text-[#E8C994]"><Ticket size={22} /></div>
      </div>
      <div
        className={`mt-4 rounded-2xl border px-4 text-center font-mono font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition ${
          staffMode
            ? "border-[#E8C994] bg-[#FFF9EE] py-5 text-3xl tracking-[0.28em] text-[#1A2520]"
            : "border-[#D4AF7A]/45 bg-[#F5EFE0] py-4 text-2xl tracking-[0.24em] text-[#163128]"
        }`}
      >
        {reward.couponCode}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCopyCode}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF7A]/40 bg-[#03261C] px-3 py-2.5 text-sm font-bold text-[#F5EFE0] transition hover:bg-[#0A4632]"
        >
          <Copy size={16} />
          {copied ? "คัดลอกแล้ว" : "คัดลอกรหัส"}
        </button>
        <button
          type="button"
          onClick={onShowForStaff}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF7A]/40 bg-[#03261C] px-3 py-2.5 text-sm font-bold text-[#F5EFE0] transition hover:bg-[#0A4632]"
        >
          <Eye size={16} />
          แสดงให้พนักงาน
        </button>
      </div>
      {reward.expiresAt ? <div className="mt-3 text-xs text-[#C8C0A8]">ใช้ได้ถึง {formatThaiDate(reward.expiresAt)}</div> : null}
    </div>
  );
}

export default function PharmacyPlusPage() {
  const { ready, loggedIn, profile, friendship, refreshFriendship, login, error } = useLiff();
  const params = useSearchParams();
  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [step, setStep] = useState<Step>("landing");
  const [playPhase, setPlayPhase] = useState<PlayPhase>("idle");
  const [sessionId] = useState(() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  const [reward, setReward] = useState<CampaignReward | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [gateReturnStep, setGateReturnStep] = useState<Step>("reward");
  const [gateChecking, setGateChecking] = useState(false);
  const [gateAttempts, setGateAttempts] = useState(0);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [staffMode, setStaffMode] = useState(false);
  const sfxMuted = useSyncExternalStore(subscribeSfxMute, getSfxMutedSnapshot, () => false);
  const source = useMemo(() => createSourceFromParams(params), [params]);
  const lastStepEventRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pharmacy-plus/config", { cache: "no-store" });
      setConfig(await res.json());
    })();
  }, []);

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
    if (step !== "gate" || !ready || !loggedIn) return;
    void refreshFriendship();
  }, [step, ready, loggedIn, refreshFriendship]);

  useEffect(() => {
    const stepEventMap: Partial<Record<Step, CampaignEventName>> = {
      landing: "campaign_view",
      wallet: "wallet_view",
      success: "success_view",
    };
    const eventName = stepEventMap[step];
    const dedupeKey = `${step}:${eventName ?? ""}`;
    if (!eventName || lastStepEventRef.current === dedupeKey) return;
    lastStepEventRef.current = dedupeKey;
    void logEvent(eventName, reward ? { reward: reward.title } : undefined);
  }, [logEvent, reward, step]);

  const toggleSfx = useCallback(() => setSfxMuted(!getSfxMutedSnapshot()), []);

  const handleStart = async () => {
    if (registering) return;
    const fullName = profile?.displayName?.trim();
    if (!fullName) return;
    void unlockSfxFromUserGesture();
    void playTap();
    setRegistering(true);
    try {
      await logEvent("registration_start", undefined, "landing");
      await fetch("/api/pharmacy-plus/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignKey: CAMPAIGN_KEY,
          sessionId,
          lineUserId: profile?.userId ?? null,
          displayName: profile?.displayName ?? null,
          fullName,
          isLineFriend: isFriend,
          source,
        }),
      });
      await logEvent("registration_submit", { qrId: source.qrId ?? null }, "landing");
      setSelectedCapsule(null);
      setReward(null);
      setRevealComplete(false);
      setPlayPhase("idle");
      setStep("play");
    } finally {
      setRegistering(false);
    }
  };

  const handleSettled = useCallback(() => {
    setPlayPhase("settled");
    safeVibrate([28, 40, 32]);
  }, []);

  const handlePickCapsule = async (index: number) => {
    if (drawing || playPhase !== "settled") return;
    void unlockSfxFromUserGesture();
    void playTap();
    safeVibrate(14);
    setSelectedCapsule(index);
    setDrawing(true);
    setPlayPhase("drawing");
    await logEvent("game_complete", { trigger: "tap_capsule", capsuleIndex: index + 1 }, "play");

    const heartbeat = await playHeartbeat();
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
          { reward: data.reward.title, storage: data.storage, existing: data.existing ?? false, qrId: source.qrId ?? null, capsuleIndex: index + 1 },
          "reward",
        );
        window.setTimeout(() => {
          heartbeat?.stop();
          setStep("reward");
          setRevealComplete(false);
        }, 600);
      }
    } finally {
      setDrawing(false);
      // safety: if step didn't advance, stop heartbeat
      window.setTimeout(() => heartbeat?.stop(), 1200);
    }
  };

  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
    void playWin();
    safeVibrate([18, 35, 22, 40, 55]);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#E8C994", "#D4AF7A", "#F5EFE0", "#9C7A3F"],
    });
  }, []);

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
        void playSoftConfirm();
        safeVibrate([20, 30, 20]);
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
    setStaffMode(false);
    setCopiedCode(null);
    setStep("success");
  };

  const handleCopyCode = async () => {
    if (!reward?.couponCode) return;
    try {
      await navigator.clipboard.writeText(reward.couponCode);
      setCopiedCode(reward.couponCode);
      safeVibrate([14, 24, 14]);
      void playTap();
    } catch {
      setCopiedCode(null);
    }
  };

  const handleShowForStaff = () => {
    setStaffMode(true);
    safeVibrate(18);
    void playTap();
  };

  const boardStep: Step = step === "landing" ? "play" : step === "gate" || step === "success" ? "wallet" : step;
  const isGameMode = step === "play" || step === "reward";
  const stepKey = step !== "play" ? step : null;

  return (
    <>
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 pb-24">
        {step === "landing" ? (
          <LandingHero
            configLoading={config === null}
            campaignName={config?.campaignName ?? null}
            benefitBullets={config?.benefitBullets ?? []}
            rewardTeasers={config?.rewardTeasers ?? []}
            onStart={handleStart}
            starting={registering}
            liffReady={ready}
            loggedIn={loggedIn}
            onLogin={login}
            displayName={profile?.displayName ?? null}
          />
        ) : isGameMode ? null : stepKey ? (
          <>
            <StoryboardHeader current={boardStep} />
            <PhoneFrame step={stepKey}>
              {!ready ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <LoaderCircle className="animate-spin text-[#E8C994]" size={28} />
                  <div className="text-sm text-[#C8C0A8]">กำลังเตรียม LINE LIFF...</div>
                </div>
              ) : error ? (
                <div className="space-y-4 rounded-[1.6rem] border border-rose-300/40 bg-rose-500/10 p-4 text-rose-200">
                  <div className="text-base font-black">เปิด LIFF ไม่สำเร็จ</div>
                  <div className="text-sm leading-6">{error}</div>
                  {!loggedIn ? <PrimaryButton onClick={login}>เข้าใช้งานผ่าน LINE</PrimaryButton> : null}
                </div>
              ) : (
                <>
                  {step === "gate" && (
                    <div className="space-y-4 text-center">
                      <div className="rounded-[1.75rem] border border-[#D4AF7A]/30 bg-[#0A4632]/70 p-5">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#D4AF7A]/15 text-[#E8C994]">
                          <HeartHandshake size={34} />
                        </div>
                        <div className="font-pp-display mt-4 text-2xl font-semibold tracking-tight text-[#F5EFE0]">เพิ่มเพื่อน LINE OA</div>
                        <div className="mt-2 text-sm leading-6 text-[#C8C0A8]">ปลดล็อกสิทธิ์รับคูปองและเก็บไว้ใน LINE ของคุณ</div>
                        <ul className="mt-4 space-y-2 rounded-[1.2rem] border border-[#D4AF7A]/25 bg-[#03261C] p-4 text-left text-sm text-[#C8C0A8]">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#E8C994]" />
                            รับคูปองได้ทันทีหลังปลดล็อก
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#E8C994]" />
                            ใช้งานสิทธิ์ได้ที่ร้านโดยแสดงโค้ดให้พนักงาน
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#E8C994]" />
                            ไม่เสียค่าใช้จ่ายในการเข้าร่วม
                          </li>
                        </ul>
                        <div className="mt-4 rounded-[1.4rem] border border-[#D4AF7A]/25 bg-[#03261C] px-4 py-3 text-sm text-[#C8C0A8]">
                          สถานะปัจจุบัน: <span className="font-bold text-[#F5EFE0]">{isFriend ? "เพิ่มเพื่อนแล้ว" : "ยังไม่ได้เพิ่มเพื่อน"}</span>
                        </div>
                        <a
                          href={config?.addFriendUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => void logEvent("add_friend_click", { qrId: source.qrId ?? null }, "gate")}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] px-5 py-3.5 text-base font-bold text-[#1A2520] shadow-[0_16px_30px_rgba(212,175,122,0.4)]"
                        >
                          <HeartHandshake size={18} />
                          เพิ่มเพื่อน LINE OA
                        </a>
                        <SecondaryButton className="mt-3" onClick={handleGateCheck} disabled={gateChecking || claiming}>
                          {gateChecking ? "กำลังตรวจสอบสถานะ..." : isFriend ? "ตรวจสอบสถานะแล้ว ไปต่อ" : "ตรวจสอบสถานะการเพิ่มเพื่อน"}
                        </SecondaryButton>
                        {gateChecking ? (
                          <div className="mt-3 flex items-center gap-2 rounded-[1.2rem] border border-[#D4AF7A]/30 bg-[#D4AF7A]/10 px-4 py-3 text-left text-sm text-[#F5EFE0]">
                            <LoaderCircle size={16} className="shrink-0 animate-spin text-[#E8C994]" />
                            กำลังเช็กสถานะการเพิ่มเพื่อน กรุณารอสักครู่...
                          </div>
                        ) : null}
                        {gateMessage ? (
                          <div className="mt-3 rounded-[1.2rem] border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-left text-sm text-amber-100">
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
                      <RewardTicketCard
                        reward={reward}
                        label={reward.status === "redeemed" ? "Coupon Redeemed" : "Coupon Claimed"}
                        copied={copiedCode === reward.couponCode}
                        onCopyCode={() => void handleCopyCode()}
                        onShowForStaff={handleShowForStaff}
                        staffMode={staffMode}
                      />
                      <div className="rounded-[1.4rem] border border-[#D4AF7A]/25 bg-[#0A4632]/60 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-[#D4AF7A]/15 p-2 text-[#E8C994]"><ShieldCheck size={18} /></div>
                          <div>
                            <div className="text-sm font-black text-[#F5EFE0]">วิธีใช้สิทธิ์</div>
                            <div className="mt-1 text-sm leading-6 text-[#C8C0A8]">{STAFF_PROMPT}</div>
                            {reward.expiresAt ? <div className="mt-2 text-xs text-[#C8C0A8]/80">ใช้ได้ถึง {formatThaiDate(reward.expiresAt)}</div> : null}
                          </div>
                        </div>
                      </div>
                      <PrimaryButton onClick={handleFinishWallet}>เข้าใจแล้ว</PrimaryButton>
                    </div>
                  )}

                  {step === "success" && reward && (
                    <div className="space-y-4 text-center">
                      <div className="rounded-[1.75rem] border border-[#D4AF7A]/30 bg-[linear-gradient(180deg,#0F5A3D_0%,#063A2A_100%)] p-5">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#D4AF7A]/15 text-[#E8C994]">
                          <CheckCircle2 size={30} />
                        </div>
                        <div className="font-pp-display mt-4 text-3xl font-semibold tracking-tight text-[#F5EFE0]">เรียบร้อย!</div>
                        <p className="mt-2 text-sm leading-6 text-[#C8C0A8]">{STAFF_PROMPT}</p>
                        <div className="mt-4 rounded-2xl border border-[#D4AF7A]/30 bg-[#03261C] px-4 py-3 font-mono text-sm font-bold tracking-[0.18em] text-[#F5EFE0]">
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
        ) : null}
      </div>
      {isGameMode ? (
        <GameOverlay
          step={step as "play" | "reward"}
          phase={playPhase}
          setPhase={setPlayPhase}
          selectedCapsule={selectedCapsule}
          drawing={drawing}
          reward={reward}
          revealComplete={revealComplete}
          isFriend={isFriend}
          claiming={claiming}
          sfxMuted={sfxMuted}
          onToggleSfx={toggleSfx}
          onSettled={handleSettled}
          onPickCapsule={(i) => void handlePickCapsule(i)}
          onRevealComplete={handleRevealComplete}
          onClaim={() => void handleClaim()}
        />
      ) : null}
    </>
  );
}

function GameOverlay({
  step,
  phase,
  setPhase,
  selectedCapsule,
  drawing,
  reward,
  revealComplete,
  isFriend,
  claiming,
  sfxMuted,
  onToggleSfx,
  onSettled,
  onPickCapsule,
  onRevealComplete,
  onClaim,
}: {
  step: "play" | "reward";
  phase: PlayPhase;
  setPhase: (phase: PlayPhase) => void;
  selectedCapsule: number | null;
  drawing: boolean;
  reward: CampaignReward | null;
  revealComplete: boolean;
  isFriend: boolean;
  claiming: boolean;
  sfxMuted: boolean;
  onToggleSfx: () => void;
  onSettled: () => void;
  onPickCapsule: (index: number) => void;
  onRevealComplete: () => void;
  onClaim: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const stageIndex = step === "play" ? 0 : 1;
  const stageEn = step === "play" ? "PLAY" : "REVEAL";

  const stepPanelVariants = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    exit: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 },
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden text-[#F5EFE0]"
      style={{ background: "linear-gradient(180deg, #063A2A 0%, #0F5A3D 50%, #03261C 100%)" }}
    >
      <div className="pp-noise-overlay" />
      <div className="pp-vignette-gold pointer-events-none absolute inset-0" />

      <div className="relative flex w-full flex-col" style={{ minHeight: "100dvh" }}>
        <header className="flex items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#D4AF7A]/30 bg-[#063A2A]/80 backdrop-blur">
              <Pill size={16} className="text-[#E8C994]" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.34em] text-[#E8C994]">Pharmacy+ · Apothecary</div>
              <div className="text-[11px] font-semibold text-[#C8C0A8]">
                STAGE {stageIndex + 1}/2 · <span className="text-[#F5EFE0]">{stageEn}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSfx}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF7A]/30 bg-[#063A2A]/80 text-[#F5EFE0] backdrop-blur transition hover:bg-[#0A4632]"
              aria-label={sfxMuted ? "เปิดเสียง" : "ปิดเสียง"}
            >
              {sfxMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < stageIndex
                      ? "w-5 bg-[#D4AF7A]/70"
                      : i === stageIndex
                        ? "w-7 bg-[#E8C994] shadow-[0_0_12px_rgba(232,201,148,0.6)]"
                        : "w-3 bg-[#F5EFE0]/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-8 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              role="presentation"
              variants={stepPanelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: reduceMotion ? 0.16 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-0 w-full flex-1 flex-col items-center justify-center"
            >
              {step === "play" ? (
                <PlayStage
                  phase={phase}
                  setPhase={setPhase}
                  selectedCapsule={selectedCapsule}
                  drawing={drawing}
                  onSettled={onSettled}
                  onPick={onPickCapsule}
                />
              ) : null}
              {step === "reward" && reward ? (
                <RewardStage
                  reward={reward}
                  revealComplete={revealComplete}
                  isFriend={isFriend}
                  onClaim={onClaim}
                  claiming={claiming}
                  onRevealComplete={onRevealComplete}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PlayStage({
  phase,
  setPhase,
  selectedCapsule,
  drawing,
  onSettled,
  onPick,
}: {
  phase: PlayPhase;
  setPhase: (phase: PlayPhase) => void;
  selectedCapsule: number | null;
  drawing: boolean;
  onSettled: () => void;
  onPick: (index: number) => void;
}) {
  const rumbleRef = useRef<{ setIntensity: (v: number) => void; stop: () => void } | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const intensityTimerRef = useRef<number | null>(null);

  const endHold = useCallback(() => {
    if (intensityTimerRef.current) {
      window.clearInterval(intensityTimerRef.current);
      intensityTimerRef.current = null;
    }
    rumbleRef.current?.stop();
    rumbleRef.current = null;
    holdStartRef.current = null;
    safeVibrate([12, 8, 24]);
    // brief slow-mo before settle
    window.setTimeout(() => onSettled(), 380);
  }, [onSettled]);

  const startHold = useCallback(async () => {
    if (phase !== "idle") return;
    void unlockSfxFromUserGesture();
    setPhase("shaking");
    safeVibrate(20);
    holdStartRef.current = Date.now();
    rumbleRef.current = await startSustainedRumble();
    if (intensityTimerRef.current) window.clearInterval(intensityTimerRef.current);
    intensityTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (holdStartRef.current ?? Date.now());
      const v = Math.min(1, elapsed / 2200);
      rumbleRef.current?.setIntensity(v);
      if (elapsed >= 2500) {
        endHold();
      }
    }, 80);
  }, [endHold, phase, setPhase]);

  const releaseHold = useCallback(() => {
    if (phase !== "shaking") return;
    endHold();
  }, [phase, endHold]);

  useEffect(() => () => {
    if (intensityTimerRef.current) window.clearInterval(intensityTimerRef.current);
    rumbleRef.current?.stop();
  }, []);

  const isInteracting = phase === "idle" || phase === "shaking";
  const slowMo = phase === "shaking" ? "transition-transform duration-150" : "transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]";
  const layout = phase === "settled" || phase === "drawing" ? PICK_LAYOUT : CLUSTER_LAYOUT;

  const caption = phase === "idle"
    ? "กดค้างเพื่อเขย่า"
    : phase === "shaking"
      ? "ค้างไว้... รู้สึกถึงพลังไหม?"
      : phase === "settled"
        ? "แตะลูกที่ใช่"
        : "เปิดรางวัลของคุณ...";

  const headline = phase === "idle"
    ? "ปลุกโชคของคุณ"
    : phase === "shaking"
      ? "กำลังเขย่า..."
      : phase === "settled"
        ? "เลือก 1 ลูก"
        : "ลุ้นรางวัล";

  return (
    <>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF7A]/40 bg-[#063A2A]/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.32em] text-[#E8C994] backdrop-blur">
          <Sparkles size={10} /> Apothecary Draw
        </div>
        <h1 className="font-pp-display mt-3 text-[2.4rem] font-semibold leading-none tracking-tight text-[#F5EFE0]">{headline}</h1>
        <p className="mt-2 text-sm leading-6 text-[#C8C0A8]">{caption}</p>
      </div>

      {/* Glass apothecary jar */}
      <div className="my-6 flex w-full flex-1 items-center justify-center">
        <div className={`relative aspect-[4/5] w-full max-w-[20rem] ${phase === "shaking" ? "pp-shake" : ""}`}>
          <div className="pointer-events-none absolute -inset-6 rounded-[3.5rem] bg-[radial-gradient(circle_at_50%_35%,rgba(232,201,148,0.35)_0%,rgba(232,201,148,0)_65%)] blur-xl" />
          <div className={`relative h-full w-full overflow-hidden rounded-[2.6rem] border border-[#D4AF7A]/40 bg-[linear-gradient(180deg,rgba(245,239,224,0.08)_0%,rgba(245,239,224,0.02)_100%)] shadow-[inset_0_0_40px_rgba(232,201,148,0.15),0_30px_55px_rgba(3,18,12,0.6)] ${phase === "shaking" ? "pp-edge-glow-strong" : "pp-edge-glow"}`}>
            <div className="pointer-events-none absolute inset-x-8 top-4 h-8 rounded-full bg-[#F5EFE0]/15 blur-[3px]" />
            <div className="pointer-events-none absolute inset-x-12 bottom-2 h-1 rounded-full bg-[#D4AF7A]/30 blur-[1px]" />

            {CAPSULE_LIST.map((tone, index) => {
              const pos = layout[index];
              const isSelected = selectedCapsule === index;
              const isOther = selectedCapsule !== null && !isSelected;
              const breatheClass = phase === "settled" && selectedCapsule === null
                ? `pp-breathe-delay-${(index % 4) || ""}`
                : "";
              const stateClass = phase === "drawing"
                ? isSelected
                  ? "pp-rise-rotate"
                  : "pp-dust-away"
                : "";
              const disabled = phase !== "settled" || drawing || (selectedCapsule !== null && !isSelected);
              return (
                <motion.div
                  key={tone}
                  layout
                  layoutId={`capsule-${tone}`}
                  transition={{ duration: phase === "shaking" ? 0.2 : 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                  className={`absolute ${slowMo} ${stateClass}`}
                  style={{ left: pos.left, top: pos.top, width: phase === "settled" ? (index === 1 ? "29%" : "22%") : (index === 1 ? "25%" : "20%") }}
                >
                  <Capsule
                    tone={tone}
                    size={phase === "shaking" ? "md" : "lg"}
                    selected={isSelected}
                    dim={isOther && phase === "settled"}
                    disabled={disabled}
                    onClick={phase === "settled" ? () => onPick(index) : undefined}
                    className={breatheClass}
                    style={{ position: "static" }}
                  />
                </motion.div>
              );
            })}
          </div>
          <div className="absolute inset-x-10 -bottom-2 flex h-11 items-center justify-center rounded-[1.3rem] bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] text-[11px] font-black uppercase tracking-[0.32em] text-[#1A2520] shadow-[0_10px_20px_rgba(3,18,12,0.4),inset_0_2px_0_rgba(255,255,255,0.55)]">
            Pharmacy+
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs">
        {isInteracting ? (
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); void startHold(); }}
            onPointerUp={releaseHold}
            onPointerLeave={releaseHold}
            onPointerCancel={releaseHold}
            disabled={drawing}
            className={`relative inline-flex w-full items-center justify-center gap-2.5 rounded-[1.6rem] bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] px-8 py-4 text-base font-black uppercase tracking-[0.24em] text-[#1A2520] shadow-[0_18px_38px_rgba(212,175,122,0.4),inset_0_-5px_0_rgba(0,0,0,0.18),inset_0_2px_0_rgba(255,255,255,0.55)] transition-transform select-none ${phase === "shaking" ? "scale-[0.97]" : "active:translate-y-0.5"}`}
          >
            <span className="pointer-events-none absolute inset-x-2 top-1 h-1/2 rounded-[1.3rem] bg-gradient-to-b from-white/35 to-white/0" />
            <Smartphone size={18} />
            <span className="relative">{phase === "shaking" ? "ค้างไว้..." : "กดค้างเพื่อเขย่า"}</span>
          </button>
        ) : phase === "settled" ? (
          <div className="space-y-1 text-center">
            <div className="text-xs text-[#C8C0A8]">— แตะแคปซูลเพื่อเปิดรางวัล —</div>
            <div className="text-[11px] font-semibold text-[#E8C994]">แตะเพื่อเลือก 1 ลูก</div>
          </div>
        ) : (
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D4AF7A]/40 bg-[#063A2A]/60 px-5 py-3 backdrop-blur">
            <LoaderCircle className="animate-spin text-[#E8C994]" size={16} />
            <div className="text-sm font-semibold text-[#F5EFE0]">กำลังเปิดรางวัล...</div>
          </div>
        )}
      </div>
    </>
  );
}

function RewardStage({
  reward,
  revealComplete,
  isFriend,
  onClaim,
  claiming,
  onRevealComplete,
}: {
  reward: CampaignReward;
  revealComplete: boolean;
  isFriend: boolean;
  onClaim: () => void;
  claiming: boolean;
  onRevealComplete: () => void;
}) {
  const tone = rewardToneToCapsule(reward.tone);
  const amount = rewardAmount(reward.title);
  const tier = classifyReward(reward.title);
  const isPremium = tier === "premium";

  useEffect(() => { void playReveal(); }, []);

  return (
    <>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF7A]/45 bg-[#063A2A]/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.34em] text-[#E8C994] backdrop-blur">
          <Trophy size={12} /> {revealComplete ? "Your Reward" : "Opening..."}
        </div>
      </div>

      <div className="my-5 flex flex-1 items-center justify-center">
        <RewardReveal
          capsuleTone={tone}
          amount={amount}
          isPremium={isPremium}
          rewardTitle={reward.title}
          rewardDetail={reward.detail}
          onComplete={onRevealComplete}
          onGlassCrack={() => void playGlassCrack()}
        />
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={onClaim}
          disabled={!revealComplete || claiming}
          className="relative inline-flex w-full items-center justify-center gap-2.5 rounded-[1.6rem] bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] px-8 py-4 text-base font-black uppercase tracking-[0.22em] text-[#1A2520] shadow-[0_18px_38px_rgba(212,175,122,0.45),inset_0_-5px_0_rgba(0,0,0,0.2),inset_0_2px_0_rgba(255,255,255,0.55)] transition active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="pointer-events-none absolute inset-x-2 top-1 h-1/2 rounded-[1.3rem] bg-gradient-to-b from-white/30 to-white/0" />
          <Ticket size={18} />
          <span className="relative">{claiming ? "กำลังบันทึก..." : "รับสิทธิ์ผ่าน LINE"}</span>
        </button>
        {!isFriend ? (
          <div className="rounded-2xl border border-[#D4AF7A]/30 bg-[#063A2A]/70 px-4 py-2.5 text-center text-xs leading-5 text-[#E8C994]">
            ต้องเพิ่มเพื่อน LINE OA เพื่อปลดล็อกคูปอง
          </div>
        ) : null}
      </div>
    </>
  );
}

function LandingHero({
  configLoading,
  campaignName,
  benefitBullets,
  rewardTeasers,
  onStart,
  starting,
  liffReady,
  loggedIn,
  onLogin,
  displayName,
}: {
  configLoading: boolean;
  campaignName: string | null;
  benefitBullets: string[];
  rewardTeasers: string[];
  onStart: () => void;
  starting: boolean;
  liffReady: boolean;
  loggedIn: boolean;
  onLogin: () => void;
  displayName: string | null;
}) {
  const [previewShaking, setPreviewShaking] = useState(false);

  const heroCandidates = [
    { key: "a", src: "/images/pharmacy-plus/hero-a.svg" },
    { key: "b", src: "/images/pharmacy-plus/hero-b.svg" },
    { key: "c", src: "/images/pharmacy-plus/hero-c.svg" },
  ] as const;

  const selectedHero = useMemo(() => {
    if (typeof window === "undefined") return heroCandidates[0];
    const requested = new URLSearchParams(window.location.search).get("hero");
    return heroCandidates.find((item) => item.key === requested) ?? heroCandidates[0];
  }, []);

  const triggerPreview = () => {
    if (previewShaking) return;
    void unlockSfxFromUserGesture();
    void playTap();
    setPreviewShaking(true);
    window.setTimeout(() => setPreviewShaking(false), 1400);
  };

  const canStart = liffReady && loggedIn && Boolean(displayName?.trim());
  const startDisabled = starting || !canStart;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-[#D4AF7A]/40 bg-[#063A2A] text-[#F5EFE0] shadow-[0_30px_80px_rgba(3,18,12,0.55)]">
        <div className="relative h-[28rem]">
          <Image
            src={selectedHero.src}
            alt="Pharmacy Plus Lucky Draw Hero"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 28rem"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,38,28,0.08)_5%,rgba(3,38,28,0.58)_48%,rgba(3,38,28,0.9)_100%)]" />
        </div>

        <div className="relative space-y-4 px-6 pb-7 pt-5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF7A]/50 bg-[#03261C]/65 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#E8C994] backdrop-blur">
            <Sparkles size={12} /> Apothecary Draw
          </div>

          {configLoading ? (
            <div className="h-4 w-48 max-w-full animate-pulse rounded-full bg-[#F5EFE0]/15" aria-hidden />
          ) : campaignName ? (
            <p className="text-sm font-semibold leading-snug text-[#E8C994]">{campaignName}</p>
          ) : null}

          <p className="font-pp-display text-2xl font-semibold leading-tight tracking-tight text-[#F5EFE0]">ลุ้นคูปองส่วนลดทันที</p>

          {liffReady && loggedIn && displayName ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF7A]/40 bg-[#03261C]/60 px-3 py-1.5 text-xs font-semibold text-[#F5EFE0] backdrop-blur">
              เล่นในชื่อ <span className="font-pp-display text-base font-semibold text-[#E8C994]">{displayName}</span>
            </div>
          ) : null}

          {configLoading ? (
            <ul className="mt-4 space-y-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-[#F5EFE0]/15 animate-pulse" />
                  <span className="h-3 flex-1 rounded-full bg-[#F5EFE0]/10 animate-pulse" />
                </li>
              ))}
            </ul>
          ) : benefitBullets.length ? (
            <ul className="mt-4 space-y-2">
              {benefitBullets.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm font-semibold leading-snug text-[#F5EFE0]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#E8C994]" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {!liffReady ? (
            <button
              type="button"
              disabled
              className="mt-5 inline-flex w-full cursor-wait items-center justify-center gap-2 rounded-[1.4rem] bg-[#F5EFE0]/10 px-5 py-4 text-base font-bold text-[#F5EFE0] opacity-80"
            >
              <LoaderCircle className="animate-spin" size={20} /> กำลังเตรียม LINE...
            </button>
          ) : !loggedIn ? (
            <button
              type="button"
              onClick={onLogin}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] px-5 py-4 text-base font-black uppercase tracking-[0.18em] text-[#1A2520] shadow-[0_18px_30px_rgba(212,175,122,0.4)]"
            >
              <LogIn size={20} /> เข้าใช้งานผ่าน LINE
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { triggerPreview(); onStart(); }}
              disabled={startDisabled}
              className={`mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] px-5 py-4 text-base font-black uppercase tracking-[0.22em] text-[#1A2520] shadow-[0_18px_30px_rgba(212,175,122,0.4),inset_0_-4px_0_rgba(0,0,0,0.18),inset_0_2px_0_rgba(255,255,255,0.55)] transition hover:brightness-105 disabled:opacity-60 ${previewShaking ? "pp-shake" : ""}`}
            >
              {starting ? (
                <>
                  <LoaderCircle className="animate-spin" size={20} /> กำลังเริ่ม...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> เริ่มเล่นเลย
                </>
              )}
            </button>
          )}

          {!liffReady ? (
            <p className="mt-2 text-center text-[11px] text-[#C8C0A8]">กำลังโหลด LINE LIFF เพื่อเชื่อมต่อบัญชีของคุณ</p>
          ) : !loggedIn ? (
            <p className="mt-2 text-center text-[11px] text-[#C8C0A8]">เข้าสู่ระบบ LINE เพื่อเริ่มเล่นและบันทึกสิทธิ์</p>
          ) : !displayName ? (
            <div className="mt-2 space-y-2 text-center">
              <p className="text-[11px] text-[#C8C0A8]">รอดึงชื่อจากโปรไฟล์ LINE สักครู่...</p>
              <button
                type="button"
                onClick={onLogin}
                className="text-xs font-bold text-[#E8C994] underline decoration-[#D4AF7A]/40 underline-offset-2 hover:text-[#F5EFE0]"
              >
                ลองเข้าสู่ระบบใหม่
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-[#D4AF7A]/30 bg-[#0A4632]/60 p-5 backdrop-blur-md">
        <div className="font-pp-display text-xl font-semibold text-[#F5EFE0]">วิธีเล่น</div>
        <div className="pp-gold-divider mt-2" />
        <div className="mt-3 divide-y divide-[#D4AF7A]/15">
          {BOARD_STEPS.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#D4AF7A]/15 text-[#E8C994] ring-1 ring-[#D4AF7A]/30">
                <Icon size={20} />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[linear-gradient(180deg,#E8C994,#9C7A3F)] text-[10px] font-black text-[#1A2520]">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="text-sm font-black text-[#F5EFE0]">{title}</div>
                <div className="mt-0.5 text-sm leading-6 text-[#C8C0A8]">{description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {configLoading ? (
        <section className="rounded-[1.8rem] border border-[#D4AF7A]/30 bg-[#0A4632]/60 p-5 backdrop-blur-md" aria-hidden>
          <div className="h-5 w-32 animate-pulse rounded-lg bg-[#F5EFE0]/15" />
          <div className="mt-3 flex gap-2 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-40 shrink-0 animate-pulse rounded-full bg-[#F5EFE0]/10" />
            ))}
          </div>
        </section>
      ) : rewardTeasers.length ? (
        <section className="rounded-[1.8rem] border border-[#D4AF7A]/30 bg-[#0A4632]/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#D4AF7A]/15 p-1.5 text-[#E8C994] ring-1 ring-[#D4AF7A]/30"><Gift size={14} /></div>
            <div className="font-pp-display text-xl font-semibold text-[#F5EFE0]">ของรางวัล</div>
          </div>
          <div className="pp-reward-scroll mt-3">
            {rewardTeasers.map((item) => (
              <div
                key={item}
                className="pp-reward-chip rounded-full border border-[#D4AF7A]/40 bg-[linear-gradient(180deg,rgba(245,239,224,0.08),rgba(245,239,224,0.02))] px-4 py-2.5 text-sm font-bold text-[#F5EFE0]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

// helper kept around for backwards-compat with previous CSS prop type (no-op)
export type { CSSProperties };
