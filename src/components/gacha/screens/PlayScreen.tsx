"use client";

import Image from "next/image";
import { LoaderCircle, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ASSETS, CAPSULE_COLORS, capsuleAsset, type CapsuleColor } from "../theme/gacha-assets";
import { PLAY_COPY, type PlayPhase } from "../theme/gacha-theme";
import { GachaMachine } from "../machine/GachaMachine";
import { useShakeInteraction } from "../hooks/useShakeInteraction";

interface PlayScreenProps {
  phase: PlayPhase;
  setPhase: (phase: PlayPhase) => void;
  selectedCapsule: number | null;
  drawing: boolean;
  onSettled: () => void;
  onPickCapsule: (index: number) => void;
  sfxMuted: boolean;
  onToggleSfx: () => void;
}

const CAPSULE_LIST: readonly CapsuleColor[] = [
  CAPSULE_COLORS[0],
  CAPSULE_COLORS[1],
  CAPSULE_COLORS[2],
];

const CLUSTER_POSITIONS = [
  { left: "14%", top: "20%" },
  { left: "40%", top: "5%" },
  { left: "64%", top: "20%" },
] as const;

const PICK_POSITIONS = [
  { left: "10%", top: "10%" },
  { left: "38%", top: "0%" },
  { left: "66%", top: "10%" },
] as const;

export function PlayScreen({
  phase,
  setPhase,
  selectedCapsule,
  drawing,
  onSettled,
  onPickCapsule,
}: PlayScreenProps) {
  const { startHold, releaseHold } = useShakeInteraction({
    phase,
    setPhase,
    onSettled,
  });

  const copy = PLAY_COPY[phase];
  const isInteracting = phase === "idle" || phase === "shaking";
  const positions =
    phase === "settled" || phase === "drawing" ? PICK_POSITIONS : CLUSTER_POSITIONS;

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-4 py-4">
      {/* Stage background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={ASSETS.bg.stage}
          alt=""
          fill
          className="object-cover object-bottom opacity-60"
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-0 h-24 w-24 opacity-70">
          <Image
            src={ASSETS.props.fence}
            alt=""
            fill
            className="object-contain object-bottom"
          />
        </div>
        <div className="absolute bottom-0 right-0 h-32 w-32 opacity-70">
          <Image
            src={ASSETS.props.trees}
            alt=""
            fill
            className="object-contain object-bottom"
          />
        </div>
        <div className="absolute bottom-0 left-8 h-28 w-28 opacity-50">
          <Image
            src={ASSETS.props.shop}
            alt=""
            fill
            className="object-contain object-bottom"
          />
        </div>
      </div>

      {/* Headline */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <h1 className="text-[2rem] font-black leading-tight tracking-tight text-[#5D4037] drop-shadow-sm">
              {copy.headline}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#8D6E63]">{copy.caption}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gacha machine with capsule cluster */}
      <div className="flex flex-1 items-center justify-center">
        <GachaMachine phase={phase}>
          <div className="relative h-32 w-full">
            {CAPSULE_LIST.map((color, index) => {
              const pos = positions[index];
              const isSelected = selectedCapsule === index;
              const isOtherSelected =
                selectedCapsule !== null && selectedCapsule !== index;
              const isDisabled =
                phase !== "settled" || drawing || isOtherSelected;

              return (
                <motion.button
                  key={color}
                  layout
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) onPickCapsule(index);
                  }}
                  aria-label={`เลือกแคปซูล ${index + 1}`}
                  className={`absolute h-14 w-14 transition-all ${
                    isDisabled ? "cursor-default" : "cursor-pointer hover:scale-110"
                  } ${
                    phase === "drawing" && !isSelected ? "scale-50 opacity-0" : ""
                  } ${
                    phase === "drawing" && isSelected ? "scale-125 opacity-100" : ""
                  } ${
                    phase === "settled" && selectedCapsule === null
                      ? "animate-bounce"
                      : ""
                  }`}
                  style={{ left: pos.left, top: pos.top }}
                  animate={
                    phase === "shaking"
                      ? { x: [0, -3, 3, -2, 2, 0], y: [0, -2, 2, -1, 1, 0] }
                      : {}
                  }
                  transition={
                    phase === "shaking"
                      ? { duration: 0.3, repeat: Infinity }
                      : { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }
                  }
                >
                  <Image
                    src={capsuleAsset(color)}
                    alt={`แคปซูล ${color}`}
                    fill
                    className="object-contain drop-shadow-md"
                  />
                </motion.button>
              );
            })}
          </div>
        </GachaMachine>
      </div>

      {/* Bottom action area */}
      <div className="w-full max-w-xs pb-4">
        <AnimatePresence mode="wait">
          {isInteracting ? (
            <motion.button
              key="shake-btn"
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onPointerDown={(e) => {
                e.preventDefault();
                void startHold();
              }}
              onPointerUp={releaseHold}
              onPointerLeave={releaseHold}
              onPointerCancel={releaseHold}
              disabled={drawing}
              className={`relative inline-flex w-full select-none items-center justify-center gap-2.5 rounded-[1.6rem] bg-[linear-gradient(180deg,#FFAB40_0%,#F5922A_55%,#E65100_100%)] px-8 py-4 text-base font-black uppercase tracking-[0.22em] text-white shadow-[0_12px_28px_rgba(245,146,42,0.4),inset_0_-4px_0_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.4)] transition-transform ${
                phase === "shaking" ? "scale-[0.97]" : "active:translate-y-0.5"
              }`}
            >
              <Smartphone size={18} />
              <span>{phase === "shaking" ? "ค้างไว้..." : "กดค้างเพื่อเขย่า"}</span>
            </motion.button>
          ) : phase === "settled" ? (
            <motion.div
              key="pick-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-1 text-center"
            >
              <p className="text-xs text-[#8D6E63]">— แตะแคปซูลเพื่อเปิดรางวัล —</p>
              <p className="text-[11px] font-bold text-[#F5922A]">แตะลูกที่ใช่</p>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#F5922A]/30 bg-white/70 px-5 py-3 backdrop-blur-sm"
            >
              <LoaderCircle className="animate-spin text-[#F5922A]" size={16} />
              <span className="text-sm font-semibold text-[#5D4037]">
                กำลังเปิดรางวัล...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
