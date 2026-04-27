"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ASSETS } from "../theme/gacha-assets";
import { STAFF_PROMPT } from "../theme/gacha-theme";
import { ConfettiOverlay } from "../ui/ConfettiOverlay";
import { MascotImage } from "../ui/MascotImage";
import { GameButton } from "../ui/GameButton";
import type { CampaignReward } from "@/lib/pharmacy-plus";

interface SuccessScreenProps {
  reward: CampaignReward;
  onRestart: () => void;
}

export function SuccessScreen({ reward, onRestart }: SuccessScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-4 pb-8 pt-4">
      <ConfettiOverlay active />

      {/* Bird mascot celebrating */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-2"
      >
        <MascotImage mascot="bird" size={100} animation="bounce" />
        <div className="flex items-center gap-1.5 text-[#F5922A]">
          <CheckCircle2 size={18} />
          <span className="text-sm font-black">เสร็จสมบูรณ์!</span>
        </div>
      </motion.div>

      {/* Reward summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-[1.8rem] border border-[#F5922A]/40 bg-[linear-gradient(180deg,#FFF8E1_0%,#FFE0B2_100%)] p-6 text-center shadow-[0_16px_40px_rgba(245,146,42,0.2)]"
      >
        {/* Gift box decoration */}
        <div className="relative mx-auto mb-4 h-16 w-16">
          <Image
            src={ASSETS.currency.giftBox}
            alt="Gift box"
            fill
            className="object-contain"
          />
        </div>

        <p className="text-3xl font-black leading-tight text-[#5D4037]">
          เรียบร้อย!
        </p>
        <p className="mt-2 text-sm leading-6 text-[#8D6E63]">{STAFF_PROMPT}</p>

        {/* Reward title + coupon code summary */}
        <div className="mt-4 rounded-2xl border border-[#F5922A]/30 bg-white/70 px-4 py-3 font-mono text-sm font-bold tracking-[0.16em] text-[#5D4037]">
          {reward.title} · {reward.couponCode}
        </div>
      </motion.div>

      {/* Back to landing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full"
      >
        <GameButton
          variant="secondary"
          onClick={onRestart}
          className="w-full py-3.5 text-base font-bold"
        >
          กลับหน้าแรก
        </GameButton>
      </motion.div>
    </div>
  );
}
