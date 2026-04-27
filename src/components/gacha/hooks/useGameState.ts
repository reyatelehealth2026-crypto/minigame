"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useLiff } from "@/components/LiffProvider";
import {
  getSfxMutedSnapshot,
  setSfxMuted,
  subscribeSfxMute,
} from "@/lib/pharmacy-plus-audio";
import { createSourceFromParams, type CampaignConfig, type CampaignReward } from "@/lib/pharmacy-plus";
import type { Step, PlayPhase } from "../theme/gacha-theme";

export interface GameState {
  config: CampaignConfig | null;
  setConfig: (config: CampaignConfig | null) => void;
  step: Step;
  setStep: (step: Step) => void;
  playPhase: PlayPhase;
  setPlayPhase: (phase: PlayPhase) => void;
  sessionId: string;
  reward: CampaignReward | null;
  setReward: (reward: CampaignReward | null) => void;
  drawing: boolean;
  setDrawing: (drawing: boolean) => void;
  claiming: boolean;
  setClaiming: (claiming: boolean) => void;
  registering: boolean;
  setRegistering: (registering: boolean) => void;
  selectedCapsule: number | null;
  setSelectedCapsule: (index: number | null) => void;
  revealComplete: boolean;
  setRevealComplete: (complete: boolean) => void;
  gateReturnStep: Step;
  setGateReturnStep: (step: Step) => void;
  gateChecking: boolean;
  setGateChecking: (checking: boolean) => void;
  gateAttempts: number;
  setGateAttempts: (updater: number | ((prev: number) => number)) => void;
  gateMessage: string | null;
  setGateMessage: (message: string | null) => void;
  copiedCode: string | null;
  setCopiedCode: (code: string | null) => void;
  staffMode: boolean;
  setStaffMode: (staffMode: boolean) => void;
  sfxMuted: boolean;
  toggleSfx: () => void;
  source: ReturnType<typeof createSourceFromParams>;
  isFriend: boolean;
  lastStepEventRef: React.MutableRefObject<string | null>;
  ready: boolean;
  loggedIn: boolean;
  profile: ReturnType<typeof useLiff>["profile"];
  friendship: ReturnType<typeof useLiff>["friendship"];
  refreshFriendship: ReturnType<typeof useLiff>["refreshFriendship"];
  login: ReturnType<typeof useLiff>["login"];
  error: string | null;
}

export function useGameState(): GameState {
  const { ready, loggedIn, profile, friendship, refreshFriendship, login, error } = useLiff();
  const params = useSearchParams();

  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [step, setStep] = useState<Step>("landing");
  const [playPhase, setPlayPhase] = useState<PlayPhase>("idle");
  const [sessionId] = useState<string>(
    () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
  );
  const [reward, setReward] = useState<CampaignReward | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [gateReturnStep, setGateReturnStep] = useState<Step>("reward");
  const [gateChecking, setGateChecking] = useState(false);
  const [gateAttempts, setGateAttempts] = useState(0);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [staffMode, setStaffMode] = useState(false);

  const sfxMuted = useSyncExternalStore(subscribeSfxMute, getSfxMutedSnapshot, () => false);

  const source = useMemo(() => createSourceFromParams(params), [params]);

  const lastStepEventRef = useRef<string | null>(null);

  const isFriend = Boolean(friendship?.friendFlag);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pharmacy-plus/config", { cache: "no-store" });
      setConfig(await res.json());
    })();
  }, []);

  useEffect(() => {
    if (step !== "gate" || !ready || !loggedIn) return;
    void refreshFriendship();
  }, [step, ready, loggedIn, refreshFriendship]);

  const toggleSfx = useCallback(() => setSfxMuted(!getSfxMutedSnapshot()), []);

  return {
    config,
    setConfig,
    step,
    setStep,
    playPhase,
    setPlayPhase,
    sessionId,
    reward,
    setReward,
    drawing,
    setDrawing,
    claiming,
    setClaiming,
    registering,
    setRegistering,
    selectedCapsule,
    setSelectedCapsule,
    revealComplete,
    setRevealComplete,
    gateReturnStep,
    setGateReturnStep,
    gateChecking,
    setGateChecking,
    gateAttempts,
    setGateAttempts,
    gateMessage,
    setGateMessage,
    copiedCode,
    setCopiedCode,
    staffMode,
    setStaffMode,
    sfxMuted,
    toggleSfx,
    source,
    isFriend,
    lastStepEventRef,
    ready,
    loggedIn,
    profile,
    friendship,
    refreshFriendship,
    login,
    error,
  };
}
