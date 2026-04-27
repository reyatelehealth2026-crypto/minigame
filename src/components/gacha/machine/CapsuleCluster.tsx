"use client";

import { motion } from "framer-motion";
import { CAPSULE_COLORS, type CapsuleColor } from "../theme/gacha-assets";
import type { PlayPhase } from "../theme/gacha-theme";
import { CapsuleItem } from "./CapsuleItem";

interface CapsuleClusterProps {
  phase: PlayPhase;
  selectedCapsule: number | null;
  drawing: boolean;
  onPick: (index: number) => void;
}

// Positions for each layout state
// "cluster" — capsules overlap slightly in a triangular arrangement
const CLUSTER_POSITIONS = [
  { x: -32, y: 14 },
  { x: 0, y: -14 },
  { x: 32, y: 14 },
] as const;

// "pick" — capsules spread evenly in a horizontal row
const PICK_POSITIONS = [
  { x: -52, y: 0 },
  { x: 0, y: 0 },
  { x: 52, y: 0 },
] as const;

export function CapsuleCluster({
  phase,
  selectedCapsule,
  drawing,
  onPick,
}: CapsuleClusterProps) {
  const isPick = phase === "settled" || phase === "drawing";
  const isShaking = phase === "shaking";

  return (
    <div className="relative flex items-center justify-center" style={{ height: 110 }}>
      {CAPSULE_COLORS.map((color: CapsuleColor, index: number) => {
        const positions = isPick ? PICK_POSITIONS : CLUSTER_POSITIONS;
        const pos = positions[index];

        const isSelected = selectedCapsule === index;
        const isOther = selectedCapsule !== null && !isSelected;
        const isDimmed = isOther && phase === "settled";

        // Drawing animation: selected capsule rises and spins, others fade out
        const drawAnimate =
          drawing && phase === "drawing"
            ? isSelected
              ? { y: -100, rotate: 360, scale: 1.2, opacity: 1 }
              : { opacity: 0, scale: 0.5 }
            : {};

        // Shaking: small jiggle applied to all capsules
        const shakeAnimate = isShaking ? { rotate: [0, -6, 6, -4, 4, 0] } : {};

        const isDisabled =
          phase !== "settled" ||
          drawing ||
          (selectedCapsule !== null && !isSelected);

        return (
          <motion.div
            key={color}
            layoutId={`gacha-capsule-${color}`}
            layout
            animate={{
              x: pos.x,
              y: pos.y,
              ...drawAnimate,
              ...shakeAnimate,
            }}
            transition={
              isShaking
                ? { duration: 0.35, repeat: Infinity, repeatType: "mirror" }
                : { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }
            }
            className="absolute"
          >
            <CapsuleItem
              color={color}
              selected={isSelected}
              dimmed={isDimmed}
              disabled={isDisabled}
              onClick={() => onPick(index)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
