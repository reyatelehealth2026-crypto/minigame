"use client";

import { Copy, Eye, ShieldCheck, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { InfoBanner } from "../ui/InfoBanner";
import { GameButton } from "../ui/GameButton";
import { formatThaiDate, STAFF_PROMPT } from "../theme/gacha-theme";
import type { CampaignReward } from "@/lib/pharmacy-plus";

interface WalletScreenProps {
  reward: CampaignReward;
  copiedCode: string | null;
  staffMode: boolean;
  onCopyCode: () => void;
  onShowForStaff: () => void;
  onFinish: () => void;
}

export function WalletScreen({
  reward,
  copiedCode,
  staffMode,
  onCopyCode,
  onShowForStaff,
  onFinish,
}: WalletScreenProps) {
  const isCopied = copiedCode === reward.couponCode;
  const label =
    reward.status === "redeemed" ? "Coupon Redeemed" : "Coupon Claimed";

  return (
    <div className="space-y-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4"
      >
        {/* Reward ticket card */}
        <div className="rounded-[1.8rem] border border-[#F5922A]/40 bg-[linear-gradient(180deg,#FFF8E1_0%,#FFE0B2_100%)] p-5 shadow-[0_16px_40px_rgba(245,146,42,0.18)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F5922A]">
            {label}
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl font-black leading-tight text-[#5D4037]">
                {reward.title}
              </p>
              <p className="mt-1 text-sm leading-snug text-[#8D6E63]">
                {reward.detail}
              </p>
            </div>
            <div className="rounded-2xl border border-[#F5922A]/30 bg-white/70 p-3 text-[#F5922A]">
              <Ticket size={22} />
            </div>
          </div>

          {/* Coupon code display — enlarges in staffMode */}
          <div
            className={`mt-4 rounded-2xl border px-4 text-center font-mono font-black shadow-inner transition-all ${
              staffMode
                ? "border-[#F5922A] bg-white py-5 text-3xl tracking-[0.28em] text-[#5D4037] shadow-[0_0_0_3px_rgba(245,146,42,0.2)]"
                : "border-[#F5922A]/30 bg-white/80 py-4 text-2xl tracking-[0.22em] text-[#5D4037]"
            }`}
          >
            {reward.couponCode}
          </div>

          {/* Copy / show-for-staff buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCopyCode}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#F5922A]/35 bg-white/70 px-3 py-2.5 text-sm font-bold text-[#5D4037] transition hover:bg-white"
            >
              <Copy size={15} />
              {isCopied ? "คัดลอกแล้ว" : "คัดลอกรหัส"}
            </button>
            <button
              type="button"
              onClick={onShowForStaff}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#F5922A]/35 bg-white/70 px-3 py-2.5 text-sm font-bold text-[#5D4037] transition hover:bg-white"
            >
              <Eye size={15} />
              แสดงให้พนักงาน
            </button>
          </div>

          {reward.expiresAt ? (
            <p className="mt-3 text-xs text-[#8D6E63]">
              ใช้ได้ถึง {formatThaiDate(reward.expiresAt)}
            </p>
          ) : null}
        </div>

        {/* Usage instructions */}
        <div className="rounded-[1.4rem] border border-[#F5922A]/25 bg-white/70 px-4 py-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#FFF3E0] p-2 text-[#F5922A] ring-1 ring-[#F5922A]/25">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-[#5D4037]">วิธีใช้สิทธิ์</p>
              <p className="mt-1 text-sm leading-6 text-[#8D6E63]">{STAFF_PROMPT}</p>
              {reward.expiresAt ? (
                <p className="mt-2 text-xs text-[#8D6E63]/80">
                  ใช้ได้ถึง {formatThaiDate(reward.expiresAt)}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Info banner */}
        <InfoBanner>โชว์โค้ดนี้กับพนักงานที่ร้านเพื่อรับสิทธิ์</InfoBanner>

        {/* Confirm CTA */}
        <GameButton onClick={onFinish} className="py-4 text-base font-black">
          เข้าใจแล้ว
        </GameButton>
      </motion.div>
    </div>
  );
}
