"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ASSETS } from "../theme/gacha-assets";

interface PrizeGlowProps {
  active: boolean;
  className?: string;
}

export function PrizeGlow({ active, className = "" }: PrizeGlowProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={active ? { opacity: [0.6, 1, 0.6] } : { opacity: 0 }}
      transition={active ? { duration: 2, ease: "easeInOut", repeat: Infinity } : undefined}
    >
      <motion.div
        animate={active ? { rotate: 360 } : {}}
        transition={active ? { duration: 20, ease: "linear", repeat: Infinity } : undefined}
        className="relative h-full w-full"
      >
        <Image
          src={ASSETS.rewards.glow}
          alt="Prize glow effect"
          fill
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
