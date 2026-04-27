"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ASSETS } from "../theme/gacha-assets";
import { rewardAmount } from "../theme/gacha-theme";
import type { CampaignReward } from "@/lib/pharmacy-plus";
import { classifyReward } from "@/lib/pharmacy-plus-theme";
import { RewardCard } from "./RewardCard";

type RevealPhase = "shake" | "crack" | "reveal";

interface RewardRevealNewProps {
  reward: CampaignReward;
  isPremium: boolean;
  amount: number | null;
  onComplete: () => void;
  onGlassCrack: () => void;
}

export function RewardRevealNew({
  reward,
  isPremium,
  amount,
  onComplete,
  onGlassCrack,
}: RewardRevealNewProps) {
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("shake");
  const [displayAmount, setDisplayAmount] = useState(0);

  // Drive the three-phase animation timeline with timeouts
  useEffect(() => {
    // 0–800 ms: "shake"
    const crackTimer = window.setTimeout(() => {
      setRevealPhase("crack");
      onGlassCrack();
    }, 800);

    // 800–1500 ms: "crack"
    const revealTimer = window.setTimeout(() => {
      setRevealPhase("reveal");
    }, 1500);

    // 2300 ms: complete
    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      window.clearTimeout(crackTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, onGlassCrack]);

  // Animate numeric counter from 0 → amount during the reveal phase
  useEffect(() => {
    if (revealPhase !== "reveal" || amount == null) return;

    const steps = 18;
    const stepDuration = Math.floor(800 / steps);
    let current = 0;

    const interval = window.setInterval(() => {
      current += 1;
      setDisplayAmount(Math.round((amount / steps) * current));
      if (current >= steps) {
        setDisplayAmount(amount);
        window.clearInterval(interval);
      }
    }, stepDuration);

    return () => window.clearInterval(interval);
  }, [revealPhase, amount]);

  const derivedIsPremium =
    isPremium || classifyReward(reward.title) === "premium";
  const derivedAmount = amount ?? rewardAmount(reward.title);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ minHeight: 380 }}
    >
      {/* Glow layer — activates from crack phase onward */}
      <AnimatePresence>
        {(revealPhase === "crack" || revealPhase === "reveal") && (
          <motion.div
            key="prize-glow"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <Image
              src={ASSETS.rewards.glow}
              alt=""
              width={340}
              height={340}
              style={{ height: "auto" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase "shake": egg wobbles */}
      <AnimatePresence>
        {revealPhase === "shake" && (
          <motion.div
            key="egg-shake"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            animate={{ rotate: [-5, 5, -5, 5, -3, 3, 0] }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            className="absolute"
          >
            <Image
              src={ASSETS.capsules.loadingEgg}
              alt="Opening egg"
              width={140}
              height={140}
              style={{ height: "auto" }}
            />
          </motion.div>
        )}

        {/* Phase "crack": egg splits into two halves flying apart */}
        {revealPhase === "crack" && (
          <>
            <motion.div
              key="egg-left"
              initial={{ x: 0, rotate: 0, opacity: 1 }}
              animate={{ x: -50, rotate: -15, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute"
            >
              <Image
                src={ASSETS.capsules.loadingEgg}
                alt=""
                width={140}
                height={140}
                style={{
                  height: "auto",
                  clipPath: "inset(0 50% 0 0)",
                }}
              />
            </motion.div>

            <motion.div
              key="egg-right"
              initial={{ x: 0, rotate: 0, opacity: 1 }}
              animate={{ x: 50, rotate: 15, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute"
            >
              <Image
                src={ASSETS.capsules.loadingEgg}
                alt=""
                width={140}
                height={140}
                style={{
                  height: "auto",
                  clipPath: "inset(0 0 0 50%)",
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Phase "reveal": reward card springs in */}
      <AnimatePresence>
        {revealPhase === "reveal" && (
          <motion.div
            key="reward-card"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
          >
            <RewardCard
              isPremium={derivedIsPremium}
              amount={derivedAmount}
              title={reward.title}
              detail={reward.detail}
              displayAmount={displayAmount}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
