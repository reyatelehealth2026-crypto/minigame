"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ASSETS } from "../theme/gacha-assets";

interface ConfettiOverlayProps {
  active: boolean;
}

const WARM_COLORS = ["#FFAB40", "#F5922A", "#FFD54F", "#FF7043", "#4FC3F7"];

export function ConfettiOverlay({ active }: ConfettiOverlayProps) {
  useEffect(() => {
    if (!active) return;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: WARM_COLORS,
    });
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={ASSETS.ui.confetti}
            alt="Confetti celebration"
            fill
            className="object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
