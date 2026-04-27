import Image from "next/image";
import { ASSETS } from "../theme/gacha-assets";
import { GACHA_COLORS } from "../theme/gacha-theme";

interface WoodSignHeadingProps {
  text?: string;
  className?: string;
}

export function WoodSignHeading({ text, className = "" }: WoodSignHeadingProps) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: "3 / 1" }}
    >
      <Image
        src={ASSETS.ui.logoSign}
        alt="Wood sign"
        fill
        className="object-contain"
      />
      {text && (
        <span
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-base font-bold leading-tight"
          style={{ color: GACHA_COLORS.brown.text }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
