"use client";

import Image from "next/image";
import { ASSETS } from "../theme/gacha-assets";

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function GameButton({
  variant = "primary",
  children,
  disabled,
  className = "",
  ...rest
}: GameButtonProps) {
  if (variant === "secondary") {
    return (
      <button
        disabled={disabled}
        className={`min-h-[56px] rounded-2xl border-2 border-[#F5922A] px-6 font-bold text-[#F5922A] transition-opacity ${
          disabled ? "cursor-not-allowed opacity-50" : "hover:opacity-80"
        } ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`relative min-h-[56px] w-full rounded-2xl font-bold transition-opacity ${
        disabled ? "cursor-not-allowed opacity-50" : "hover:opacity-90 active:scale-95"
      } ${className}`}
      {...rest}
    >
      <Image
        src={ASSETS.ui.playButton}
        alt=""
        fill
        className="rounded-2xl object-fill"
        aria-hidden="true"
      />
      <span className="relative z-10 px-6 text-white drop-shadow-sm">{children}</span>
    </button>
  );
}
