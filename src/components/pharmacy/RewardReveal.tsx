"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { CapsuleSvg, type CapsuleTone } from "./Capsule";
import { CouponFrame } from "./ornaments/CouponFrame";
import { RayBurst } from "./ornaments/RayBurst";
import { WaxSeal } from "./ornaments/WaxSeal";

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

function formatThaiDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

export function RewardReveal({
  capsuleTone,
  amount,
  isPremium,
  rewardTitle,
  rewardDetail,
  rewardCode,
  rewardExpiresAt,
  onComplete,
  onGlassCrack,
}: {
  capsuleTone: CapsuleTone;
  amount: number | null;
  isPremium: boolean;
  rewardTitle: string;
  rewardDetail: string;
  rewardCode?: string;
  rewardExpiresAt?: string | null;
  onComplete?: () => void;
  onGlassCrack?: () => void;
}) {
  const isMonetary = Boolean(amount && amount > 0);
  const [phase, setPhase] = useState<Phase>("shake");
  const [displayAmount, setDisplayAmount] = useState(0);
  const counter = useMotionValue(0);
  const fired = useRef({ crack: false, complete: false });

  useEffect(() => {
    fired.current = { crack: false, complete: false };
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

  const code = rewardCode ?? "PHRM-0000";
  const expiry = formatThaiDate(rewardExpiresAt);

  return (
    <div className="relative mx-auto flex min-h-[22rem] w-full max-w-sm items-center justify-center">
      {/* parchment halo */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(247,230,190,0.6)_0%,rgba(245,237,216,0)_65%)] blur-2xl" />

      {/* Ray burst behind reveal */}
      {phase === "reveal" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pp-ray-burst opacity-80">
            <RayBurst size={460} color="#C9A55E" rays={26} />
          </div>
        </div>
      )}

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
                className="pp-gold-particle absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                  ["--pp-px" as string]: p.px,
                  ["--pp-py" as string]: p.py,
                  animationDelay: `${p.delay}s`,
                  background: "#B8944A",
                  boxShadow: "0 0 10px rgba(184,148,74,0.9)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase: reveal — vintage coupon rises */}
      {phase === "reveal" && (
        <div className="pp-coupon-rise relative z-10 w-full">
          <div className="relative">
            <CouponFrame
              amount={amount && amount > 0 ? displayAmount : null}
              title={rewardTitle}
              detail={rewardDetail}
              code={code}
              expiry={expiry}
            />
            {isPremium ? (
              <div className="pointer-events-none absolute -right-2 -top-3 z-10 pp-wax-stamp">
                <WaxSeal size={78} label="พิเศษ" latin="PREMIUM" />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
