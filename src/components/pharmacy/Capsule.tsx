"use client";

import { type CSSProperties } from "react";

export type CapsuleTone = "amber" | "rose" | "sage" | "ivory" | "cobalt" | "amethyst" | "teal" | "sand";

export const CAPSULE_TONES: readonly CapsuleTone[] = [
  "amber",
  "rose",
  "sage",
  "ivory",
  "cobalt",
  "amethyst",
  "teal",
  "sand",
];

const TONE_FILL: Record<CapsuleTone, { top: string; bottom: string; band: string }> = {
  amber: { top: "#F4D58A", bottom: "#9C7236", band: "#E8C994" },
  rose: { top: "#F2B8C6", bottom: "#8E3B53", band: "#E89BB0" },
  sage: { top: "#C6E5C0", bottom: "#3F6E47", band: "#A8D6A2" },
  ivory: { top: "#F5EFE0", bottom: "#A89F86", band: "#E8DFC4" },
  cobalt: { top: "#A6C8F0", bottom: "#244A7B", band: "#7FAEE3" },
  amethyst: { top: "#D9C6F2", bottom: "#4F3878", band: "#B8A0E0" },
  teal: { top: "#A6E0DA", bottom: "#1F5E58", band: "#7CCBC2" },
  sand: { top: "#EBD8B5", bottom: "#7C5E32", band: "#D4B985" },
};

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, { w: number; h: number }> = {
  sm: { w: 44, h: 60 },
  md: { w: 64, h: 88 },
  lg: { w: 80, h: 110 },
};

export function Capsule({
  tone,
  size = "md",
  selected = false,
  dim = false,
  style,
  onClick,
  disabled = false,
  className = "",
  ariaLabel,
}: {
  tone: CapsuleTone;
  size?: Size;
  selected?: boolean;
  dim?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const dim_ = dim ? "opacity-35" : "opacity-100";
  const ring = selected
    ? "drop-shadow-[0_0_18px_rgba(232,201,148,0.85)] drop-shadow-[0_0_38px_rgba(232,201,148,0.45)]"
    : "drop-shadow-[0_8px_18px_rgba(3,18,12,0.5)]";
  const interactive = Boolean(onClick) && !disabled;
  const cls = `absolute transition-opacity duration-300 ${dim_} ${ring} ${interactive ? "cursor-pointer active:scale-95" : "cursor-default"} ${className}`;
  const { w, h } = SIZE_PX[size];

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      style={style}
      aria-label={ariaLabel ?? `capsule ${tone}`}
      className={cls}
    >
      <CapsuleSvg tone={tone} width={w} height={h} />
    </button>
  );
}

export function CapsuleSvg({
  tone,
  width = 64,
  height = 88,
  half,
}: {
  tone: CapsuleTone;
  width?: number;
  height?: number;
  half?: "left" | "right";
}) {
  const fills = TONE_FILL[tone];
  const id = `cap-${tone}-${half ?? "full"}`;

  return (
    <svg width={width} height={height} viewBox="0 0 64 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fills.top} stopOpacity="1" />
          <stop offset="1" stopColor={fills.band} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`${id}-bottom`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fills.band} stopOpacity="1" />
          <stop offset="1" stopColor={fills.bottom} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,0.32)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>

      {(!half || half === "left") && (
        <g>
          <path d="M32 4 C 14 4 6 18 6 32 V 44 H 58 V 32 C 58 18 50 4 32 4 Z" fill={`url(#${id}-top)`} />
        </g>
      )}
      {(!half || half === "right") && (
        <g>
          <path d="M6 44 V 56 C 6 70 14 84 32 84 C 50 84 58 70 58 56 V 44 Z" fill={`url(#${id}-bottom)`} />
        </g>
      )}

      <ellipse cx="22" cy="20" rx="8" ry="14" fill={`url(#${id}-shell)`} opacity="0.55" />
      <ellipse cx="44" cy="64" rx="6" ry="10" fill="rgba(0,0,0,0.18)" />

      <rect x="6" y="42" width="52" height="4" rx="2" fill="#3a2a14" opacity="0.55" />
      <rect x="6" y="42" width="52" height="1" rx="0.5" fill="rgba(255,255,255,0.22)" />

      <path d="M32 4 C 14 4 6 18 6 32" stroke="rgba(255,255,255,0.45)" strokeWidth="1" fill="none" />
      <path d="M58 56 C 58 70 50 84 32 84" stroke="rgba(0,0,0,0.18)" strokeWidth="1" fill="none" />
    </svg>
  );
}
