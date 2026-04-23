import type { SVGProps } from "react";

export function LeafSprig({
  size = 24,
  color = "currentColor",
  ...rest
}: { size?: number; color?: string } & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 26 C 14 24, 22 16, 26 6" />
        <path d="M14 20 C 8 20, 8 14, 14 14 C 20 14, 20 20, 14 20 Z" fill={color} fillOpacity="0.2" />
        <path d="M18 14 C 20 14, 22 12, 22 8 C 18 8, 16 10, 16 14 Z" fill={color} fillOpacity="0.2" />
        <path d="M8 24 L 11 21 M11 22 L 14 19 M14 19 L 16 17" opacity="0.6" />
      </g>
    </svg>
  );
}

export function CinnamomumLeaf({
  size = 40,
  color = "currentColor",
  ...rest
}: { size?: number; color?: string } & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <g fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 4 C 14 8, 8 18, 10 34 C 10 40, 16 44, 24 44 C 32 44, 38 40, 38 34 C 40 18, 34 8, 24 4 Z" />
        <path d="M24 6 L 24 42" opacity="0.5" />
        <path d="M24 14 L 16 18 M24 14 L 32 18 M24 22 L 14 26 M24 22 L 34 26 M24 30 L 16 34 M24 30 L 32 34" opacity="0.35" />
      </g>
    </svg>
  );
}

export function RauvolfiaLeaf({
  size = 40,
  color = "currentColor",
  ...rest
}: { size?: number; color?: string } & Omit<SVGProps<SVGSVGElement>, "color">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <g fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 44 L 24 10" />
        <path d="M24 10 C 18 8, 14 12, 14 18 C 14 22, 18 24, 24 22" />
        <path d="M24 10 C 30 8, 34 12, 34 18 C 34 22, 30 24, 24 22" />
        <path d="M24 18 C 20 16, 18 18, 18 22 C 18 26, 22 28, 24 26" />
        <path d="M24 18 C 28 16, 30 18, 30 22 C 30 26, 26 28, 24 26" />
        <circle cx="20" cy="32" r="1.8" opacity="0.7" />
        <circle cx="28" cy="32" r="1.8" opacity="0.7" />
        <circle cx="24" cy="36" r="1.8" opacity="0.7" />
      </g>
    </svg>
  );
}
