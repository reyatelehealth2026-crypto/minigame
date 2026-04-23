import type { SVGProps } from "react";

type Orientation = "tl" | "tr" | "bl" | "br";

const ROTATE: Record<Orientation, number> = {
  tl: 0,
  tr: 90,
  br: 180,
  bl: 270,
};

export function CornerFlourish({
  orientation = "tl",
  size = 56,
  color = "currentColor",
  ...rest
}: {
  orientation?: Orientation;
  size?: number;
  color?: string;
} & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${ROTATE[orientation]}deg)` }}
      aria-hidden
      {...rest}
    >
      <g stroke={color} strokeWidth="1" fill="none" strokeLinecap="round">
        {/* corner bracket */}
        <path d="M4 4 L24 4 M4 4 L4 24" />
        <path d="M7 7 L22 7 M7 7 L7 22" opacity="0.55" />
        {/* acanthus curl */}
        <path d="M10 10 C 18 10, 22 14, 22 22 C 22 30, 18 34, 10 34" opacity="0.85" />
        <path d="M14 14 C 20 14, 22 18, 22 24" opacity="0.6" />
        {/* fern fronds */}
        <path d="M26 6 C 32 8, 36 14, 34 22" opacity="0.75" />
        <path d="M28 8 L 30 11 M30 10 L 32 13 M32 12 L 33 16 M33 15 L 33 19" opacity="0.55" />
        <path d="M6 26 C 8 32, 14 36, 22 34" opacity="0.75" />
        <path d="M8 28 L 11 30 M10 30 L 13 32 M12 32 L 16 33 M15 33 L 19 33" opacity="0.55" />
        {/* small dot */}
        <circle cx="22" cy="22" r="1.3" fill={color} />
      </g>
    </svg>
  );
}
