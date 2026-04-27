import Image from "next/image";
import { ASSETS } from "../theme/gacha-assets";
import { GACHA_COLORS } from "../theme/gacha-theme";

interface WoodPlankBannerProps {
  text: string;
  className?: string;
}

export function WoodPlankBanner({ text, className = "" }: WoodPlankBannerProps) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: "4 / 1" }}
    >
      <Image
        src={ASSETS.ui.subtitlePlank}
        alt="Wood plank banner"
        fill
        className="object-contain"
      />
      <span
        className="absolute bottom-[15%] left-0 right-0 flex items-center justify-center px-6 text-center text-sm font-bold leading-snug"
        style={{ color: GACHA_COLORS.brown.text }}
      >
        {text}
      </span>
    </div>
  );
}
