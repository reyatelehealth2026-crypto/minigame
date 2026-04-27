"use client";

import { useCallback, useEffect, useRef } from "react";
import { startSustainedRumble, unlockSfxFromUserGesture } from "@/lib/pharmacy-plus-audio";
import { safeVibrate } from "@/lib/pharmacy-plus-feedback";
import type { PlayPhase } from "../theme/gacha-theme";

export interface ShakeInteractionOptions {
  phase: PlayPhase;
  setPhase: (phase: PlayPhase) => void;
  onSettled: () => void;
}

export interface ShakeInteraction {
  startHold: () => Promise<void>;
  releaseHold: () => void;
}

export function useShakeInteraction({
  phase,
  setPhase,
  onSettled,
}: ShakeInteractionOptions): ShakeInteraction {
  const rumbleRef = useRef<{ setIntensity: (v: number) => void; stop: () => void } | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const intensityTimerRef = useRef<number | null>(null);

  const endHold = useCallback(() => {
    if (intensityTimerRef.current) {
      window.clearInterval(intensityTimerRef.current);
      intensityTimerRef.current = null;
    }
    rumbleRef.current?.stop();
    rumbleRef.current = null;
    holdStartRef.current = null;
    safeVibrate([12, 8, 24]);
    window.setTimeout(() => onSettled(), 380);
  }, [onSettled]);

  const startHold = useCallback(async () => {
    if (phase !== "idle") return;
    void unlockSfxFromUserGesture();
    setPhase("shaking");
    safeVibrate(20);
    holdStartRef.current = Date.now();
    rumbleRef.current = await startSustainedRumble();
    if (intensityTimerRef.current) window.clearInterval(intensityTimerRef.current);
    intensityTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (holdStartRef.current ?? Date.now());
      const v = Math.min(1, elapsed / 2200);
      rumbleRef.current?.setIntensity(v);
      if (elapsed >= 2500) {
        endHold();
      }
    }, 80);
  }, [endHold, phase, setPhase]);

  const releaseHold = useCallback(() => {
    if (phase !== "shaking") return;
    endHold();
  }, [phase, endHold]);

  useEffect(
    () => () => {
      if (intensityTimerRef.current) window.clearInterval(intensityTimerRef.current);
      rumbleRef.current?.stop();
    },
    [],
  );

  return { startHold, releaseHold };
}
