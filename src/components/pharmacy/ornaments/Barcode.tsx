import { useMemo } from "react";

function hashCode(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function Barcode({
  code,
  height = 30,
  className = "",
}: {
  code: string;
  height?: number;
  className?: string;
}) {
  const bars = useMemo(() => {
    // deterministic bar widths from code hash
    let seed = hashCode(code || "pharmacy-plus");
    const out: { w: number; on: boolean }[] = [];
    for (let i = 0; i < 48; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const w = 1 + (seed % 4);
      out.push({ w, on: i % 2 === 0 ? true : (seed & 1) === 1 });
    }
    return out;
  }, [code]);

  return (
    <div className={`flex items-end gap-[1px] ${className}`} style={{ height }} aria-hidden>
      {bars.map((b, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: b.w,
            height: "100%",
            background: b.on ? "#3A2A18" : "transparent",
          }}
        />
      ))}
    </div>
  );
}
