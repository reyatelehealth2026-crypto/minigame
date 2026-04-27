import Image from "next/image";
import { ASSETS } from "../theme/gacha-assets";

interface InfoBannerProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoBanner({ children, className = "" }: InfoBannerProps) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ minHeight: 64 }}
    >
      <Image
        src={ASSETS.ui.infoBanner}
        alt="Info banner"
        fill
        className="object-fill"
      />
      <div className="relative z-10 flex h-full min-h-[64px] items-center justify-center px-12 py-3 text-center text-sm font-semibold text-white">
        {children}
      </div>
    </div>
  );
}
