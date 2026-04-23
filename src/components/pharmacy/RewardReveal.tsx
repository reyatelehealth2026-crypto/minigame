"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { CapsuleSvg, type CapsuleTone } from "./Capsule";

type Phase = "idle" | "shake" | "crack" | "reveal";

const PARTICLES = Array.from({ length: 14 }).map((_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const dist = 64 + (i % 3) * 18;
  return {
    px: `${Math.cos(angle) * dist}px`,
    py: `${Math.sin(angle) * dist}px`,
    delay: (i % 7) * 0.06,
    size: 4 + (i % 3) * 2,
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
  const isMonetary = Boolean(amount && amount > 0);
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
      if (isMonetary && amount) {
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
  }, [amount, counter, isMonetary, onComplete, onGlassCrack]);

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
                  boxShadow: "0 0 10px rgba(232,201,148,0.5)",
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
          <div
            className={`relative overflow-hidden rounded-[1.4rem] border px-7 py-5 shadow-[0_24px_48px_rgba(3,18,12,0.65)] ${
              isMonetary
                ? "border-[#D4AF7A]/55 bg-[linear-gradient(180deg,#165F45_0%,#063A2A_72%,#04261B_100%)]"
                : "border-[#7FD3B7]/35 bg-[linear-gradient(180deg,#0A4A36_0%,#073626_100%)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-8 top-2 h-14 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,235,192,0.25),rgba(255,235,192,0)_72%)] blur-lg" />
            <div className="pointer-events-none absolute -bottom-10 left-1/2 h-28 w-44 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,201,148,0.18),rgba(232,201,148,0)_72%)] blur-xl" />
            <div className="relative">
              <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#C8C0A8]">
                {isMonetary ? "คูปองเงินสด" : "รางวัลพิเศษ"}
              </div>
              {isMonetary ? (
                <>
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F5E9D0]/85">
                    มูลค่า
                  </div>
                  <div className="mt-1 flex items-end justify-center gap-1.5">
                    <span className="font-pp-display pp-shimmer-text text-[4.25rem] font-bold leading-[0.85] tracking-tight">
                      {displayAmount}
                    </span>
                    <span className="mb-2 rounded-md border border-[#E8C994]/35 bg-[#F6E4B1]/12 px-2 py-0.5 font-pp-display text-sm font-semibold text-[#F5E9D0]">
                      บาท
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-2 space-y-1.5">
                  <div className="mx-auto inline-flex items-center rounded-full border border-[#97E8D0]/35 bg-[#97E8D0]/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#C6F6E8]">
                    ✦ Lucky Reward ✦
                  </div>
                  <div className="font-pp-display pp-shimmer-text text-[2rem] font-bold leading-tight text-[#F1F0E9]">
                    {rewardTitle}
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs leading-snug text-[#C8C0A8]">{rewardDetail}</div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={`soft-particle-${i}`}
                className="pp-soft-sparkle absolute rounded-full bg-[#F5E9D0]/60"
                style={{
                  left: `${18 + i * 12}%`,
                  top: `${16 + (i % 3) * 20}%`,
                  width: 2 + (i % 2),
                  height: 2 + (i % 2),
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
