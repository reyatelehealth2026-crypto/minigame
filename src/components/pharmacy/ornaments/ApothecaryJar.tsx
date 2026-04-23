import type { SVGProps } from "react";

const PILL_COLORS = [
  { top: "#F4D58A", bot: "#9C7236" },
  { top: "#F2B8C6", bot: "#8E3B53" },
  { top: "#C6E5C0", bot: "#3F6E47" },
  { top: "#A6C8F0", bot: "#244A7B" },
  { top: "#D9C6F2", bot: "#4F3878" },
  { top: "#EBD8B5", bot: "#7C5E32" },
];

type PillPos = { cx: number; cy: number; r: number; tone: number; rot: number };

const PILLS: PillPos[] = [
  { cx: 60, cy: 120, r: 9, tone: 0, rot: -18 },
  { cx: 78, cy: 130, r: 9, tone: 1, rot: 32 },
  { cx: 94, cy: 118, r: 9, tone: 2, rot: -22 },
  { cx: 112, cy: 132, r: 9, tone: 3, rot: 28 },
  { cx: 130, cy: 120, r: 9, tone: 4, rot: -30 },
  { cx: 66, cy: 148, r: 9, tone: 2, rot: 12 },
  { cx: 84, cy: 158, r: 9, tone: 5, rot: -40 },
  { cx: 104, cy: 148, r: 9, tone: 1, rot: 24 },
  { cx: 122, cy: 156, r: 9, tone: 0, rot: -14 },
  { cx: 74, cy: 176, r: 9, tone: 3, rot: 36 },
  { cx: 94, cy: 176, r: 9, tone: 4, rot: -20 },
  { cx: 114, cy: 178, r: 9, tone: 5, rot: 16 },
];

export function ApothecaryJar({
  width = 200,
  height = 260,
  className = "",
  ...rest
}: { width?: number; height?: number; className?: string } & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 260"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <defs>
        <linearGradient id="pp-jar-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5EDD8" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#E8D9B5" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#C9B07A" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="pp-jar-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B7E5A" />
          <stop offset="100%" stopColor="#2E4A33" />
        </linearGradient>
        <pattern id="pp-jar-hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#3A2A18" strokeWidth="0.4" opacity="0.25" />
        </pattern>
      </defs>

      {/* shadow under jar */}
      <ellipse cx="100" cy="242" rx="64" ry="6" fill="#3A2A18" opacity="0.18" />

      {/* Cap */}
      <rect x="62" y="18" width="76" height="20" rx="3" fill="url(#pp-jar-cap)" stroke="#3A2A18" strokeWidth="1.2" />
      <rect x="62" y="18" width="76" height="20" rx="3" fill="url(#pp-jar-hatch)" />
      {/* green cross */}
      <g transform="translate(92 22)">
        <rect x="0" y="3" width="16" height="4" fill="#F5EDD8" />
        <rect x="6" y="-3" width="4" height="16" fill="#F5EDD8" />
      </g>

      {/* Neck */}
      <path d="M70 38 L 70 52 C 70 56 74 60 80 60 L 120 60 C 126 60 130 56 130 52 L 130 38" fill="url(#pp-jar-glass)" stroke="#3A2A18" strokeWidth="1.4" />

      {/* Body */}
      <path d="M58 60 C 50 66 46 78 46 92 L 46 210 C 46 226 58 238 80 238 L 120 238 C 142 238 154 226 154 210 L 154 92 C 154 78 150 66 142 60 Z" fill="url(#pp-jar-glass)" stroke="#3A2A18" strokeWidth="1.6" />

      {/* Label */}
      <rect x="64" y="88" width="72" height="24" fill="#F5EDD8" stroke="#3A2A18" strokeWidth="0.8" />
      <rect x="66" y="90" width="68" height="20" fill="none" stroke="#3A2A18" strokeWidth="0.4" />
      <text x="100" y="98" textAnchor="middle" fontFamily="var(--font-pp-display), Georgia, serif" fontSize="6" fontWeight="700" letterSpacing="1.4" fill="#3A2A18">
        PHARMACIA ·  ยาพรัส
      </text>
      <text x="100" y="108" textAnchor="middle" fontFamily="var(--font-pp-display), Georgia, serif" fontSize="5" letterSpacing="1.2" fill="#6B4A24">
        CAPSULA MAGICA · Est. 1898
      </text>

      {/* Pills inside */}
      <g>
        {PILLS.map((p, i) => (
          <g key={i} transform={`translate(${p.cx} ${p.cy}) rotate(${p.rot})`}>
            <rect x={-p.r * 1.6} y={-p.r * 0.7} width={p.r * 3.2} height={p.r * 1.4} rx={p.r * 0.7}
              fill={PILL_COLORS[p.tone % PILL_COLORS.length].top} />
            <rect x={-p.r * 1.6} y={-p.r * 0.7 + p.r * 0.7} width={p.r * 3.2} height={p.r * 0.7} rx={p.r * 0.35}
              fill={PILL_COLORS[p.tone % PILL_COLORS.length].bot} opacity="0.85" />
            <rect x={-p.r * 1.6} y={-p.r * 0.7} width={p.r * 3.2} height={p.r * 1.4} rx={p.r * 0.7}
              fill="none" stroke="#3A2A18" strokeWidth="0.6" opacity="0.8" />
            <ellipse cx={-p.r * 0.8} cy={-p.r * 0.3} rx={p.r * 0.5} ry={p.r * 0.25} fill="#F5EDD8" opacity="0.55" />
          </g>
        ))}
      </g>

      {/* Glass highlight */}
      <path d="M56 72 C 52 92, 52 160, 58 210" stroke="#F5EDD8" strokeWidth="3" fill="none" opacity="0.55" strokeLinecap="round" />
      <path d="M60 74 C 57 94, 57 158, 62 204" stroke="#FFF8E6" strokeWidth="1" fill="none" opacity="0.55" strokeLinecap="round" />

      {/* Engraved hatch shadow on right */}
      <path d="M140 84 C 144 120, 144 190, 138 220" stroke="#3A2A18" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M144 88 C 146 120, 146 188, 142 218" stroke="#3A2A18" strokeWidth="0.5" fill="none" opacity="0.25" />
      <path d="M148 92 C 149 120, 149 186, 146 214" stroke="#3A2A18" strokeWidth="0.5" fill="none" opacity="0.18" />
    </svg>
  );
}
