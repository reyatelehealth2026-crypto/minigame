"use client";

import Image from "next/image";
import { ASSETS } from "../theme/gacha-assets";

interface GameShellProps {
  children: React.ReactNode;
  variant?: "outdoor" | "indoor";
}

export function GameShell({ children, variant = "indoor" }: GameShellProps) {
  if (variant === "outdoor") {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-[512px] flex-col overflow-hidden">
        {/* Sky gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #E1F5FE 70%, #FFF8E1 100%)",
          }}
          aria-hidden="true"
        />
        {/* Hills parallax background */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-1/2" aria-hidden="true">
          <Image
            src={ASSETS.bg.hills}
            alt=""
            fill
            className="object-cover object-bottom"
            priority
          />
        </div>
        {/* Content */}
        <div className="relative z-20 flex min-h-screen flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex min-h-screen w-full max-w-[512px] flex-col"
      style={{
        background:
          "linear-gradient(180deg, #FFF8E1 0%, #FFE0B2 50%, #FFCC80 100%)",
      }}
    >
      <div className="flex min-h-screen flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        {children}
      </div>
    </div>
  );
}
