"use client";

import { Ticket, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { RewardReveal } from "@/components/pharmacy/RewardReveal";
import { ConfettiOverlay } from "../ui/ConfettiOverlay";
import { GameButton } from "../ui/GameButton";
import { rewardAmount } from "../theme/gacha-theme";
import { classifyReward } from "@/lib/pharmacy-plus-theme";
import type { CampaignReward } from "@/lib/pharmacy-plus";

interface RewardScreenProps {
  reward: CampaignReward;
  revealComplete: boolean;
  isFriend: boolean;
  claiming: boolean;
  onClaim: () => void;
  onRevealComplete: () => void;
  sfxMuted: boolean;
  onToggleSfx: () => void;
}

function rewardToneToCapsule(tone: CampaignReward["tone"]) {
  switch (tone) {
    case "green":
      return "sage" as const;
    case "blue":
      return "cobalt" as const;
    default:
      return "amber" as const;
  }
}

export function RewardScreen({
  reward,
  revealComplete,
  isFriend,
  claiming,
  onClaim,
  onRevealComplete,
}: RewardScreenProps) {
  const capsuleTone = rewardToneToCapsule(reward.tone);
  const amount = rewardAmount(reward.title);
  const tier = classifyReward(reward.title);
  const isPremium = tier === "premium";

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-4 py-4">
      <ConfettiOverlay active={revealComplete} />

      {/* Stage label */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F5922A]/40 bg-[#FFF3E0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-[#E65100]">
          <Trophy size={12} />
          {revealComplete ? "Your Reward" : "Opening..."}
        </div>
      </div>

      {/* Reveal animation */}
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <RewardReveal
            capsuleTone={capsuleTone}
            amount={amount}
            isPremium={isPremium}
            rewardTitle={reward.title}
            rewardDetail={reward.detail}
            onComplete={onRevealComplete}
            onGlassCrack={() => {}}
          />
        </motion.div>
      </div>

      {/* Claim area */}
      <div className="w-full max-w-xs space-y-3 pb-4">
        <GameButton
          onClick={onClaim}
          disabled={!revealComplete || claiming}
          className="py-4 text-base font-black uppercase tracking-[0.2em]"
        >
          <span className="flex items-center justify-center gap-2">
            <Ticket size={18} />
            {claiming ? "กำลังบันทึก..." : "รับสิทธิ์ผ่าน LINE"}
          </span>
        </GameButton>

        {!isFriend ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[#F5922A]/30 bg-[#FFF3E0] px-4 py-2.5 text-center text-xs leading-5 text-[#E65100]"
          >
            ต้องเพิ่มเพื่อน LINE OA เพื่อปลดล็อกคูปอง
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
