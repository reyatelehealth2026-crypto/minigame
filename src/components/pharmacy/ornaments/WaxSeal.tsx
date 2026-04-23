import { useId, type SVGProps } from "react";

export function WaxSeal({
  size = 84,
  label = "พิเศษ",
  latin = "PREMIUM",
  ...rest
}: {
  size?: number;
  label?: string;
  latin?: string;
} & Omit<SVGProps<SVGSVGElement>, "color">) {
  const reactId = useId();
  const id = `pp-wax-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${latin} seal`}
      {...rest}
    >
      <defs>
        <radialGradient id={`${id}-fill`} cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#C73953" />
          <stop offset="55%" stopColor="#A2243B" />
          <stop offset="100%" stopColor="#68132A" />
        </radialGradient>
      </defs>
      {/* drips */}
      <path
        d="M50 4 C 58 4 64 8 68 14 L 86 28 L 82 46 L 94 62 L 78 74 L 82 92 L 62 86 L 50 96 L 38 86 L 18 92 L 22 74 L 6 62 L 18 46 L 14 28 L 32 14 C 36 8 42 4 50 4 Z"
        fill={`url(#${id}-fill)`}
        opacity="0.98"
      />
      {/* main disc */}
      <circle cx="50" cy="50" r="34" fill={`url(#${id}-fill)`} />
      <circle cx="50" cy="50" r="31" fill="none" stroke="rgba(255,235,200,0.45)" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="rgba(255,235,200,0.3)" strokeWidth="0.6" strokeDasharray="2 2" />
      {/* highlight */}
      <ellipse cx="40" cy="38" rx="12" ry="6" fill="rgba(255,235,200,0.28)" />
      {/* text */}
      <text
        x="50"
        y="46"
        textAnchor="middle"
        fontFamily="var(--font-pp-display), Georgia, serif"
        fontSize="12"
        fontWeight="700"
        letterSpacing="2"
        fill="#F7E4C0"
      >
        {latin}
      </text>
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="var(--font-pp-body), 'Noto Sans Thai', sans-serif"
        fontSize="13"
        fontWeight="700"
        fill="#F7E4C0"
      >
        {label}
      </text>
      {/* star points */}
      <g fill="#F7E4C0" opacity="0.75">
        <circle cx="50" cy="26" r="1" />
        <circle cx="50" cy="74" r="1" />
        <circle cx="26" cy="50" r="1" />
        <circle cx="74" cy="50" r="1" />
      </g>
    </svg>
  );
}
