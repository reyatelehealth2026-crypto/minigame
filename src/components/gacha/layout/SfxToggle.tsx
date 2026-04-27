"use client";

import { Volume2, VolumeX } from "lucide-react";

interface SfxToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export function SfxToggle({ muted, onToggle }: SfxToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
      className="fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#F5922A]/30 bg-white/60 text-[#E65100] shadow-md backdrop-blur-sm transition hover:bg-white/80 active:scale-95"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}
