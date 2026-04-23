import type { SVGProps } from "react";

export function RayBurst({
  size = 320,
  color = "#B8944A",
  rays = 24,
  className = "",
  ...rest
}: {
  size?: number;
  color?: string;
  rays?: number;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "color">) {
  const wedges = Array.from({ length: rays });
  const step = 360 / rays;
  const halfWedge = step * 0.38;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <defs>
        <radialGradient id="pp-ray-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="25%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g>
        {wedges.map((_, i) => {
          const angle = i * step;
          const a1 = ((angle - halfWedge) * Math.PI) / 180;
          const a2 = ((angle + halfWedge) * Math.PI) / 180;
          const r = 94;
          const x1 = Math.cos(a1) * r;
          const y1 = Math.sin(a1) * r;
          const x2 = Math.cos(a2) * r;
          const y2 = Math.sin(a2) * r;
          return (
            <path
              key={i}
              d={`M0 0 L${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
              fill="url(#pp-ray-fade)"
              opacity={i % 2 === 0 ? 0.9 : 0.45}
            />
          );
        })}
        <circle r="16" fill={color} opacity="0.12" />
      </g>
    </svg>
  );
}
