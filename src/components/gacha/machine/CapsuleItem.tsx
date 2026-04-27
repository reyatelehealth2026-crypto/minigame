"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { capsuleAsset, type CapsuleColor } from "../theme/gacha-assets";

interface CapsuleItemProps {
  color: CapsuleColor;
  selected: boolean;
  dimmed: boolean;
  disabled: boolean;
  onClick?: () => void;
  className?: string;
}

export function CapsuleItem({
  color,
  selected,
  dimmed,
  disabled,
  onClick,
  className,
}: CapsuleItemProps) {
  const isInteractive = !disabled && !selected && !dimmed;

  const stateClasses = [
    selected
      ? "scale-110 ring-4 ring-yellow-400 drop-shadow-[0_0_20px_rgba(255,213,79,0.6)]"
      : "",
    dimmed ? "opacity-40 grayscale-[30%] scale-90" : "",
    disabled ? "pointer-events-none cursor-default" : "",
    isInteractive ? "hover:scale-105 cursor-pointer" : "",
    "rounded-full transition-[transform,opacity,filter] duration-200",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      className={stateClasses}
      aria-pressed={selected}
      aria-disabled={disabled}
      style={{ background: "none", border: "none", padding: 0 }}
    >
      <Image
        src={capsuleAsset(color)}
        alt={`${color} capsule`}
        width={80}
        height={80}
        style={{ height: "auto", display: "block" }}
      />
    </motion.button>
  );
}
