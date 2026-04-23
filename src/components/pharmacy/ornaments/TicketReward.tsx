import type { SVGProps } from "react";

export function TicketReward({
  size = 96,
  ...rest
}: { size?: number } & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 120 84"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <defs>
        <linearGradient id="pp-tk-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5EDD8" />
          <stop offset="100%" stopColor="#E8D9B5" />
        </linearGradient>
      </defs>
      {/* Base ticket */}
      <path d="M6 18 C 6 14 10 10 14 10 L 106 10 C 110 10 114 14 114 18 L 114 28 C 110 28 108 32 108 36 C 108 40 110 44 114 44 L 114 66 C 114 70 110 74 106 74 L 14 74 C 10 74 6 70 6 66 L 6 44 C 10 44 12 40 12 36 C 12 32 10 28 6 28 Z"
        fill="url(#pp-tk-paper)" stroke="#3A2A18" strokeWidth="1.4" />
      {/* Perforation */}
      <line x1="60" y1="14" x2="60" y2="70" stroke="#3A2A18" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.8" />
      {/* Text lines */}
      <text x="30" y="34" textAnchor="middle" fontFamily="var(--font-pp-display), Georgia, serif" fontSize="9" fontWeight="700" letterSpacing="1.2" fill="#3A2A18">TICKET</text>
      <text x="30" y="48" textAnchor="middle" fontFamily="var(--font-pp-display), Georgia, serif" fontSize="6" letterSpacing="1" fill="#6B4A24">ADMIT · ONE</text>
      <text x="30" y="60" textAnchor="middle" fontFamily="var(--font-pp-display), Georgia, serif" fontSize="5" letterSpacing="1" fill="#6B4A24">No. A-0001</text>
      {/* Stub star */}
      <g transform="translate(90 42)">
        <circle r="12" fill="none" stroke="#3A2A18" strokeWidth="0.8" opacity="0.7" />
        <path d="M0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z" fill="#8E3B53" />
      </g>
      {/* Border decoration */}
      <rect x="10" y="14" width="96" height="56" rx="4" ry="4" fill="none" stroke="#3A2A18" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5" />
    </svg>
  );
}
