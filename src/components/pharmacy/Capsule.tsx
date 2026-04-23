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
  amber: { top: "#F4D58A", bottom: "#7D5A24", band: "#E3B763" },
  rose: { top: "#E8B6C2", bottom: "#704055", band: "#CFA6B2" },
  sage: { top: "#9ED2A8", bottom: "#1E5A42", band: "#6DAD7E" },
  ivory: { top: "#F2EADB", bottom: "#8E8168", band: "#DCC9A2" },
  cobalt: { top: "#A4C2E7", bottom: "#214E73", band: "#7CA8D3" },
  amethyst: { top: "#CDBCE6", bottom: "#4A3A6E", band: "#A18BC8" },
  teal: { top: "#90D5CC", bottom: "#1B6058", band: "#64B7AC" },
  sand: { top: "#E5D2AD", bottom: "#6F5430", band: "#CFA972" },
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
  const dim_ = dim ? "opacity-35 saturate-75" : "opacity-100";
  const ring = selected
    ? "scale-[1.08] drop-shadow-[0_0_18px_rgba(232,201,148,0.88)] drop-shadow-[0_0_36px_rgba(232,201,148,0.42)]"
    : "drop-shadow-[0_8px_18px_rgba(3,18,12,0.5)]";
  const interactive = Boolean(onClick) && !disabled;
  const stateCls = disabled
    ? "cursor-not-allowed opacity-30 grayscale"
    : interactive
      ? "cursor-pointer hover:scale-[1.04] hover:-translate-y-0.5 hover:drop-shadow-[0_0_16px_rgba(212,175,122,0.4)] active:scale-[0.96]"
      : "cursor-default";
  const cls = `absolute transition duration-250 ease-out ${dim_} ${ring} ${stateCls} ${className}`;
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
