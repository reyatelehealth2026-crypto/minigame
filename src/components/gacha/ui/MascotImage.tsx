"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { mascotAsset, type MascotType } from "../theme/gacha-assets";

interface MascotImageProps {
  mascot: MascotType;
  size?: number;
  animation?: "float" | "bounce" | "none";
  className?: string;
}

const ALT_TEXT: Record<MascotType, string> = {
  cat: "Cat mascot",
  monkey: "Monkey mascot",
  bird: "Bird mascot",
};

const FLOAT_ANIM = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 2.8, ease: "easeInOut", repeat: Infinity },
};

const BOUNCE_ANIM = {
  animate: { scale: [1, 1.08, 1] },
  transition: { duration: 1.4, ease: "easeInOut", repeat: Infinity },
};

export function MascotImage({
  mascot,
  size = 120,
  animation = "float",
  className = "",
}: MascotImageProps) {
  const animProps = animation === "float" ? FLOAT_ANIM : animation === "bounce" ? BOUNCE_ANIM : {};

  return (
    <motion.div
      style={{ width: size, height: size }}
      className={`relative flex-shrink-0 ${className}`}
      {...animProps}
    >
      <Image
        src={mascotAsset(mascot)}
        alt={ALT_TEXT[mascot]}
        fill
        className="object-contain"
      />
    </motion.div>
  );
}
