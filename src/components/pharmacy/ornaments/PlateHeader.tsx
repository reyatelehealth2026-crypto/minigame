import type { ReactNode } from "react";

export function PlateHeader({
  plate,
  title,
  subtitle,
  children,
  align = "center",
}: {
  plate?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${alignCls} gap-1`}>
      {plate ? (
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[#6B4A24]">
          <span className="h-px w-5 bg-[#6B4A24]/60" aria-hidden />
          <span className="pp-roman">{plate}</span>
          <span className="h-px w-5 bg-[#6B4A24]/60" aria-hidden />
        </div>
      ) : null}
      {title ? (
        <h2 className="font-pp-vintage text-2xl font-bold leading-tight text-[#3A2A18]">{title}</h2>
      ) : null}
      {subtitle ? (
        <div className="text-[11px] italic tracking-wide text-[#6B4A24]/90">{subtitle}</div>
      ) : null}
      {children}
    </div>
  );
}
