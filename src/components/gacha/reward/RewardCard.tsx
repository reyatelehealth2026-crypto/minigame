"use client";

import Image from "next/image";
import { rewardCardAsset, ASSETS } from "../theme/gacha-assets";

interface RewardCardProps {
  isPremium: boolean;
  amount: number | null;
  title: string;
  detail: string;
  displayAmount?: number;
}

export function RewardCard({
  isPremium,
  amount,
  title,
  detail,
  displayAmount,
}: RewardCardProps) {
  // Card dimensions: 260 × 380 matches the 3:4 asset ratio
  const cardW = 260;
  const cardH = 380;

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl"
      style={{ width: cardW, height: cardH }}
    >
      {/* Background card asset — blue for common, gold/purple for rare */}
      <Image
        src={rewardCardAsset(isPremium)}
        alt={isPremium ? "Rare reward card" : "Common reward card"}
        fill
        style={{ objectFit: "cover" }}
        priority
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-start px-5 pt-10">
        {/* Reward title — upper portion, large and centered */}
        <p
          className="text-center text-lg font-black leading-snug tracking-wide"
          style={{ color: isPremium ? "#FFD700" : "#1A2520" }}
        >
          {title}
        </p>

        {/* Animated monetary amount — only rendered when reward has a numeric value */}
        {amount != null && (
          <div className="mt-4 flex items-baseline gap-1">
            <span
              className="text-6xl font-black tabular-nums leading-none"
              style={{ color: isPremium ? "#FFD700" : "#E65100" }}
            >
              {displayAmount ?? amount}
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: isPremium ? "#FFE082" : "#F5922A" }}
            >
              บาท
            </span>
          </div>
        )}

        {/* Detail — smaller, below title */}
        <p
          className="mt-3 text-center text-sm leading-relaxed"
          style={{ color: isPremium ? "#FFF8E1" : "#5D4037" }}
        >
          {detail}
        </p>
      </div>

      {/* Bottom decoration — diamond cluster for premium, coin pile for common */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
        {isPremium ? (
          <Image
            src={ASSETS.currency.diamonds}
            alt=""
            width={80}
            height={48}
            style={{ height: "auto", opacity: 0.9 }}
          />
        ) : (
          <Image
            src={ASSETS.currency.coinPile}
            alt=""
            width={72}
            height={44}
            style={{ height: "auto", opacity: 0.85 }}
          />
        )}
      </div>
    </div>
  );
}
