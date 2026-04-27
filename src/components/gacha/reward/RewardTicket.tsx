"use client";

import Image from "next/image";
import { Copy, Eye } from "lucide-react";
import { ASSETS } from "../theme/gacha-assets";
import { formatThaiDate } from "../theme/gacha-theme";
import type { CampaignReward } from "@/lib/pharmacy-plus";

interface RewardTicketProps {
  reward: CampaignReward;
  label: string;
  copied: boolean;
  staffMode: boolean;
  onCopyCode: () => void;
  onShowForStaff: () => void;
}

export function RewardTicket({
  reward,
  label,
  copied,
  staffMode,
  onCopyCode,
  onShowForStaff,
}: RewardTicketProps) {
  const expiryText = formatThaiDate(reward.expiresAt);

  return (
    <div className="relative w-full max-w-xs" style={{ minHeight: 200 }}>
      {/* Ticket coupon background frame */}
      <Image
        src={ASSETS.rewards.ticketCoupon}
        alt="Coupon ticket"
        fill
        style={{ objectFit: "fill" }}
      />

      {/* Ticket content overlay — warm orange-gold theme, brown text on cream background */}
      <div className="relative z-10 flex flex-col items-center px-6 py-5">
        {/* Label — small text at the top */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">
          {label}
        </p>

        {/* Reward title */}
        <p className="mt-2 text-center text-base font-black leading-snug text-amber-900">
          {reward.title}
        </p>

        {/* Reward detail */}
        <p className="mt-1 text-center text-xs leading-relaxed text-amber-800">
          {reward.detail}
        </p>

        {/* Coupon code — extra large in staff mode */}
        <div className="mt-3 w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-center">
          <span
            className={
              staffMode
                ? "font-mono text-3xl font-black tracking-widest text-amber-900"
                : "font-mono text-base font-bold tracking-widest text-amber-900"
            }
          >
            {reward.couponCode}
          </span>
        </div>

        {/* Action buttons row */}
        <div className="mt-3 flex w-full gap-2">
          <button
            type="button"
            onClick={onCopyCode}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            <Copy size={13} />
            {copied ? "คัดลอกแล้ว" : "คัดลอกโค้ด"}
          </button>

          <button
            type="button"
            onClick={onShowForStaff}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-400 bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800 shadow-sm transition active:scale-95"
          >
            <Eye size={13} />
            โชว์พนักงาน
          </button>
        </div>

        {/* Expiry date — rendered only when present */}
        {expiryText != null && (
          <p className="mt-2 text-[10px] text-amber-600">
            หมดอายุ: {expiryText}
          </p>
        )}
      </div>
    </div>
  );
}
