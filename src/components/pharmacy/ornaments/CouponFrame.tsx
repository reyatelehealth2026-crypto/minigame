import { CornerFlourish } from "./CornerFlourish";
import { MortarEmblem } from "./MortarEmblem";
import { RauvolfiaLeaf, CinnamomumLeaf } from "./LeafSprig";
import { Barcode } from "./Barcode";

export function CouponFrame({
  amount,
  title,
  detail,
  code,
  expiry,
  serial,
  className = "",
  children,
}: {
  amount: number | null;
  title: string;
  detail?: string;
  code: string;
  expiry?: string | null;
  serial?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const serialNum = serial ?? formatSerial(code);
  return (
    <div
      className={`pp-ink-border pp-ink-border-dashed relative overflow-hidden rounded-[1.1rem] bg-[#F5EDD8] px-6 py-5 text-[#3A2A18] shadow-[0_18px_38px_rgba(58,42,24,0.35),inset_0_0_80px_rgba(232,217,181,0.9)] ${className}`}
    >
      {/* botanical watermarks */}
      <div className="pointer-events-none absolute -right-2 top-4 opacity-[0.09]" aria-hidden>
        <CinnamomumLeaf size={96} color="#3A2A18" />
      </div>
      <div className="pointer-events-none absolute -left-3 bottom-6 opacity-[0.09] rotate-[-14deg]" aria-hidden>
        <RauvolfiaLeaf size={96} color="#3A2A18" />
      </div>

      {/* corner flourishes */}
      <div className="pointer-events-none absolute left-1.5 top-1.5 text-[#3A2A18]/75" aria-hidden>
        <CornerFlourish orientation="tl" size={36} />
      </div>
      <div className="pointer-events-none absolute right-1.5 top-1.5 text-[#3A2A18]/75" aria-hidden>
        <CornerFlourish orientation="tr" size={36} />
      </div>
      <div className="pointer-events-none absolute left-1.5 bottom-1.5 text-[#3A2A18]/75" aria-hidden>
        <CornerFlourish orientation="bl" size={36} />
      </div>
      <div className="pointer-events-none absolute right-1.5 bottom-1.5 text-[#3A2A18]/75" aria-hidden>
        <CornerFlourish orientation="br" size={36} />
      </div>

      {/* top ribbon */}
      <div className="relative -mx-6 -mt-5 mb-3 bg-[#8E3B53] px-6 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[#F5EDD8] shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]">
        คูปองส่วนลดพิเศษ
        <span className="mx-2 opacity-60">·</span>
        Coupon
      </div>

      {/* crest + brand */}
      <div className="relative flex flex-col items-center">
        <div className="text-[#6B4A24]">
          <MortarEmblem size={40} />
        </div>
        <div className="font-pp-vintage mt-1 text-sm font-bold leading-none text-[#3A2A18]">
          ร้านยาพรัส <span className="opacity-60">·</span> Pharmacy Plus
        </div>
        <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.36em] text-[#6B4A24]">
          Plate I — Praemium Oraculi
        </div>
      </div>

      <div className="pp-gold-divider relative my-3" />

      {/* Amount or title */}
      <div className="relative text-center">
        {amount && amount > 0 ? (
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-pp-display pp-shimmer-text text-[3.8rem] font-bold leading-none">{amount}</span>
            <span className="font-pp-display text-2xl font-semibold text-[#8A6A2E]">บาท</span>
          </div>
        ) : (
          <div className="font-pp-display pp-shimmer-text text-[2rem] font-bold leading-tight">{title}</div>
        )}
        {detail ? (
          <div className="mt-1 text-sm leading-snug text-[#6B4A24]">{detail}</div>
        ) : null}
      </div>

      {/* Bottom row */}
      <div className="pp-gold-divider relative my-3" />
      <div className="relative flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#6B4A24]">No.</span>
          <span className="font-pp-display text-sm font-bold tracking-[0.18em] text-[#3A2A18]">A{serialNum}</span>
        </div>
        <Barcode code={code} height={22} />
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#6B4A24]">Est.</span>
          <span className="font-pp-display text-sm font-bold tracking-[0.18em] text-[#3A2A18]">2025</span>
        </div>
      </div>

      {/* Code row */}
      <div className="relative mt-3 rounded-md border border-dashed border-[#3A2A18]/50 bg-[#F1E6CC] px-3 py-2 text-center font-mono text-sm font-bold tracking-[0.22em] text-[#3A2A18]">
        {code}
      </div>

      {expiry ? (
        <div className="relative mt-2 text-center text-[11px] italic text-[#6B4A24]">
          Valid until / ใช้ได้ถึง {expiry}
        </div>
      ) : null}

      {children}
    </div>
  );
}

function formatSerial(code: string): string {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) & 0xffff;
  return String(h % 10000).padStart(4, "0");
}
