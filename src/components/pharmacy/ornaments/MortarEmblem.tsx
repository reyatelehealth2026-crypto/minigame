import type { SVGProps } from "react";

export function MortarEmblem({
  size = 48,
  color = "currentColor",
  ...rest
}: { size?: number; color?: string } & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="29" opacity="0.9" />
        <circle cx="32" cy="32" r="26" opacity="0.45" strokeDasharray="1 2" />
        {/* pestle */}
        <path d="M18 8 L 34 24" strokeWidth="2" />
        <circle cx="16" cy="7" r="2.2" fill={color} />
        {/* mortar bowl */}
        <path d="M18 34 L 46 34 L 42 50 C 42 54 38 56 32 56 C 26 56 22 54 22 50 Z" strokeWidth="1.6" />
        <path d="M18 34 L 46 34" strokeWidth="1.6" />
        <path d="M22 34 C 22 31, 26 30, 32 30 C 38 30, 42 31, 42 34" opacity="0.6" />
        {/* hatching shadow */}
        <path d="M26 44 L 26 50 M30 45 L 30 52 M34 45 L 34 52 M38 44 L 38 50" opacity="0.35" />
        {/* leaf sprig */}
        <path d="M44 20 C 50 18, 54 22, 54 28" opacity="0.7" />
        <path d="M48 18 L 48 22 M52 20 L 52 24" opacity="0.55" />
      </g>
    </svg>
  );
}
