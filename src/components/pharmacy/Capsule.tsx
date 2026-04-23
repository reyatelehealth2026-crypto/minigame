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

// Muted watercolor palette — less candy, more herbal / apothecary
const TONE_FILL: Record<CapsuleTone, { top: string; bottom: string; band: string }> = {
  amber: { top: "#E7C584", bottom: "#8A6526", band: "#C9A054" },
  rose: { top: "#D99FAE", bottom: "#77324A", band: "#BA7184" },
  sage: { top: "#B5CDAC", bottom: "#3F6E47", band: "#8FAE86" },
  ivory: { top: "#EDE1C4", bottom: "#8D7F62", band: "#D4C393" },
  cobalt: { top: "#93B2D3", bottom: "#28456E", band: "#6C90B5" },
  amethyst: { top: "#BFA7D2", bottom: "#463168", band: "#9A82B3" },
  teal: { top: "#95C3BE", bottom: "#205A55", band: "#6EA6A0" },
  sand: { top: "#D7BE93", bottom: "#705028", band: "#B4935A" },
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
    ? "drop-shadow-[0_0_14px_rgba(184,148,74,0.85)] drop-shadow-[0_0_30px_rgba(138,106,46,0.5)]"
    : "drop-shadow-[0_6px_10px_rgba(58,42,24,0.35)]";
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
          <stop offset="0" stopColor="rgba(253,246,224,0.85)" />
          <stop offset="0.5" stopColor="rgba(253,246,224,0.28)" />
          <stop offset="1" stopColor="rgba(253,246,224,0.04)" />
        </linearGradient>
        <pattern id={`${id}-hatch`} patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="#3A2A18" strokeWidth="0.4" />
        </pattern>
      </defs>

      {(!half || half === "left") && (
        <g>
          <path d="M32 4 C 14 4 6 18 6 32 V 44 H 58 V 32 C 58 18 50 4 32 4 Z" fill={`url(#${id}-top)`} />
          {/* engraved hatching shadow on right */}
          <path d="M32 4 C 14 4 6 18 6 32 V 44 H 58 V 32 C 58 18 50 4 32 4 Z" fill={`url(#${id}-hatch)`} opacity="0.22" />
          <path d="M38 10 C 44 14, 50 22, 52 34" stroke="#3A2A18" strokeWidth="0.5" opacity="0.3" fill="none" />
          <path d="M42 12 C 48 16, 52 26, 54 36" stroke="#3A2A18" strokeWidth="0.5" opacity="0.22" fill="none" />
          <path d="M46 14 C 50 20, 54 30, 56 38" stroke="#3A2A18" strokeWidth="0.5" opacity="0.15" fill="none" />
        </g>
      )}
      {(!half || half === "right") && (
        <g>
          <path d="M6 44 V 56 C 6 70 14 84 32 84 C 50 84 58 70 58 56 V 44 Z" fill={`url(#${id}-bottom)`} />
          <path d="M6 44 V 56 C 6 70 14 84 32 84 C 50 84 58 70 58 56 V 44 Z" fill={`url(#${id}-hatch)`} opacity="0.28" />
          <path d="M12 50 C 12 62 18 80 32 80" stroke="#3A2A18" strokeWidth="0.5" opacity="0.22" fill="none" />
          <path d="M16 52 C 16 64 22 80 32 80" stroke="#3A2A18" strokeWidth="0.5" opacity="0.15" fill="none" />
        </g>
      )}

      {/* Cream highlight (replaces cold white) */}
      <ellipse cx="22" cy="20" rx="8" ry="14" fill={`url(#${id}-shell)`} opacity="0.65" />
      <ellipse cx="44" cy="64" rx="6" ry="10" fill="rgba(58,42,24,0.2)" />

      {/* Ink-drawn outline */}
      <path d="M32 4 C 14 4 6 18 6 32 V 44 H 58 V 32 C 58 18 50 4 32 4 Z" fill="none" stroke="#3A2A18" strokeWidth="0.8" opacity="0.55" />
      <path d="M6 44 V 56 C 6 70 14 84 32 84 C 50 84 58 70 58 56 V 44 Z" fill="none" stroke="#3A2A18" strokeWidth="0.8" opacity="0.55" />

      {/* Band */}
      <rect x="6" y="42" width="52" height="4" rx="2" fill="#3A2A18" opacity="0.6" />
      <rect x="6" y="42" width="52" height="1" rx="0.5" fill="rgba(253,246,224,0.3)" />

      <path d="M32 4 C 14 4 6 18 6 32" stroke="rgba(253,246,224,0.55)" strokeWidth="1" fill="none" />
      <path d="M58 56 C 58 70 50 84 32 84" stroke="rgba(58,42,24,0.35)" strokeWidth="1" fill="none" />
    </svg>
  );
}
