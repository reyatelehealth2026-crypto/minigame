"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { CapsuleSvg, type CapsuleTone } from "./Capsule";

type Phase = "idle" | "shake" | "crack" | "reveal";

const PARTICLES = Array.from({ length: 18 }).map((_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const dist = 80 + (i % 3) * 22;
  return {
    px: `${Math.cos(angle) * dist}px`,
    py: `${Math.sin(angle) * dist}px`,
    delay: (i % 6) * 0.04,
    size: 6 + (i % 3) * 3,
  };
});

export function RewardReveal({
  capsuleTone,
  amount,
  isPremium,
  rewardTitle,
  rewardDetail,
  onComplete,
  onGlassCrack,
}: {
  capsuleTone: CapsuleTone;
  amount: number | null;
  isPremium: boolean;
  rewardTitle: string;
  rewardDetail: string;
  onComplete?: () => void;
  onGlassCrack?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayAmount, setDisplayAmount] = useState(0);
  const counter = useMotionValue(0);
  const fired = useRef({ crack: false, complete: false });

  useEffect(() => {
    setPhase("shake");
    const t1 = window.setTimeout(() => {
      setPhase("crack");
      if (!fired.current.crack) {
        fired.current.crack = true;
        onGlassCrack?.();
      }
    }, 800);
    const t2 = window.setTimeout(() => {
      setPhase("reveal");
      if (amount && amount > 0) {
        const controls = animate(counter, amount, {
          duration: 0.7,
          ease: [0.2, 0.8, 0.2, 1],
          onUpdate: (v) => setDisplayAmount(Math.round(v)),
        });
        return () => controls.stop();
      }
      return undefined;
    }, 1500);
    const t3 = window.setTimeout(() => {
      if (!fired.current.complete) {
        fired.current.complete = true;
        onComplete?.();
      }
    }, 2300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [amount, counter, onComplete, onGlassCrack]);

  return (
    <div className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center">
      {/* radial halo */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(232,201,148,0.45)_0%,rgba(232,201,148,0)_60%)] blur-2xl" />

      {/* Phase: shake — capsule wobbles in place */}
      {phase === "shake" && (
        <div className="pp-shake-vibrate">
          <CapsuleSvg tone={capsuleTone} width={140} height={190} />
        </div>
      )}

      {/* Phase: crack — two halves separate, particles burst */}
      {(phase === "crack" || phase === "reveal") && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: 140, height: 190 }}>
            <div className="pp-crack-left absolute left-0 top-0">
              <CapsuleSvg tone={capsuleTone} width={140} height={190} half="left" />
            </div>
            <div className="pp-crack-right absolute left-0 top-0">
              <CapsuleSvg tone={capsuleTone} width={140} height={190} half="right" />
            </div>
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                className="pp-gold-particle absolute left-1/2 top-1/2 rounded-full bg-[#E8C994]"
                style={{
                  width: p.size,
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                  ["--pp-px" as string]: p.px,
                  ["--pp-py" as string]: p.py,
                  animationDelay: `${p.delay}s`,
                  boxShadow: "0 0 12px rgba(232,201,148,0.9)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase: reveal — coupon card rises */}
      {phase === "reveal" && (
        <div className="pp-coupon-rise relative z-10 text-center">
          {isPremium && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E8C994]/60 bg-[#063A2A]/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.32em] text-[#E8C994] shadow-[0_0_24px_rgba(232,201,148,0.4)]">
              ★ Big Win ★
            </div>
          )}
          <div className="rounded-[1.4rem] border border-[#D4AF7A]/45 bg-[linear-gradient(180deg,#0F5A3D_0%,#063A2A_100%)] px-7 py-5 shadow-[0_24px_48px_rgba(3,18,12,0.65),inset_0_1px_0_rgba(212,175,122,0.3)]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#C8C0A8]">คูปอง</div>
            {amount && amount > 0 ? (
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="font-pp-display pp-shimmer-text text-[3.6rem] font-bold leading-none">
                  {displayAmount}
                </span>
                <span className="font-pp-display text-xl font-medium text-[#E8C994]">บาท</span>
              </div>
            ) : (
              <div className="font-pp-display pp-shimmer-text mt-1 text-[2.2rem] font-bold leading-tight">
                {rewardTitle}
              </div>
            )}
            <div className="mt-1 text-xs leading-snug text-[#C8C0A8]">{rewardDetail}</div>
          </div>
        </div>
      )}
    </div>
  );
}
