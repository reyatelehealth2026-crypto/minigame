"use client";

import { Check, Smartphone, Gift, HeartHandshake } from "lucide-react";
import { BOARD_STEPS, BOARD_KEYS, type Step } from "../theme/gacha-theme";

interface StepProgressBarProps {
  currentStep: Step;
}

const STEP_ICONS = [Smartphone, Gift, HeartHandshake] as const;

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
  const rawIndex = BOARD_KEYS.indexOf(currentStep);
  const activeIndex = Math.max(0, rawIndex);

  return (
    <div className="rounded-2xl border border-[#F5922A]/30 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm">
      {/* Step counter */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-[0.18em] text-[#8D6E63]">
          ขั้นตอน
        </span>
        <span className="text-[10px] font-bold tracking-[0.18em] text-[#F5922A]">
          {activeIndex + 1}/{BOARD_STEPS.length}
        </span>
      </div>

      {/* Step indicators */}
      <div className="grid grid-cols-3 gap-2">
        {BOARD_STEPS.map(({ key, title }, index) => {
          const isActive = key === currentStep;
          const isDone = activeIndex > index;
          const Icon = STEP_ICONS[index];

          return (
            <div key={key} className="flex flex-col items-center gap-1 text-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isActive
                    ? "border-[#F5922A] bg-[#F5922A] text-white shadow-[0_4px_12px_rgba(245,146,42,0.4)]"
                    : isDone
                    ? "border-[#F5922A]/40 bg-[#FFF8E1] text-[#F5922A]/60"
                    : "border-[#D7CCC8] bg-white/40 text-[#BCAAA4]"
                }`}
              >
                {isDone ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              <span
                className={`text-[10px] font-bold leading-tight ${
                  isActive
                    ? "text-[#E65100]"
                    : isDone
                    ? "text-[#8D6E63]/70"
                    : "text-[#BCAAA4]"
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 flex gap-1.5 px-1">
        {BOARD_STEPS.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index <= activeIndex
                ? "bg-gradient-to-r from-[#F5922A] to-[#FFAB40]"
                : "bg-[#E8D5C4]/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
