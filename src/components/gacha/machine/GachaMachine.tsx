"use client";

import Image from "next/image";
import { ASSETS } from "../theme/gacha-assets";
import type { PlayPhase } from "../theme/gacha-theme";

interface GachaMachineProps {
  phase: PlayPhase;
  children?: React.ReactNode;
}

export function GachaMachine({ phase, children }: GachaMachineProps) {
  const showFull = phase === "idle" || phase === "shaking";
  const isShaking = phase === "shaking";

  return (
    <div className="relative inline-block select-none">
      {/* Machine body — shake animation applied to the wrapper so children move with it */}
      <div
        className={
          isShaking
            ? "animate-[gacha-shake_0.15s_ease-in-out_infinite]"
            : undefined
        }
      >
        <Image
          src={showFull ? ASSETS.machine.full : ASSETS.machine.empty}
          alt={showFull ? "Gacha machine with capsules" : "Empty gacha machine"}
          width={280}
          height={350}
          style={{ height: "auto" }}
          priority
        />

        {/* Capsule overlay — sits over the globe/dome area (upper ~55% of the image) */}
        {children != null && (
          <div
            className="absolute inset-0"
            aria-hidden="true"
          >
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: "8%", width: "76%" }}
            >
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
