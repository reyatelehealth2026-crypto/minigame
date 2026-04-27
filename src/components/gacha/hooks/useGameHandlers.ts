"use client";

import { useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  playHeartbeat,
  playSoftConfirm,
  playTap,
  playWin,
  unlockSfxFromUserGesture,
} from "@/lib/pharmacy-plus-audio";
import { safeVibrate } from "@/lib/pharmacy-plus-feedback";
import {
  CAMPAIGN_KEY,
  postCampaignEvent,
  type CampaignDrawResponse,
  type CampaignEventName,
} from "@/lib/pharmacy-plus";
import type { GameState } from "./useGameState";

export interface GameHandlers {
  logEvent: (
    eventName: CampaignEventName,
    payload?: Record<string, unknown>,
    eventStep?: string,
  ) => Promise<void>;
  handleStart: () => Promise<void>;
  handleSettled: () => void;
  handlePickCapsule: (index: number) => Promise<void>;
  handleRevealComplete: () => void;
  handleClaim: (options?: { friendOverride?: boolean }) => Promise<void>;
  handleGateCheck: () => Promise<void>;
  handleGateBypass: () => Promise<void>;
  handleFinishWallet: () => void;
  handleCopyCode: () => Promise<void>;
  handleShowForStaff: () => void;
}

export function useGameHandlers(state: GameState): GameHandlers {
  const {
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
    setSelectedCapsule,
    setRevealComplete,
    setGateReturnStep,
    gateChecking,
    setGateChecking,
    setGateAttempts,
    setGateMessage,
    setCopiedCode,
    setStaffMode,
    source,
    isFriend,
    lastStepEventRef,
    profile,
    refreshFriendship,
  } = state;

  const logEvent = useCallback(
    async (
      eventName: CampaignEventName,
      payload?: Record<string, unknown>,
      eventStep: string = step,
    ) => {
      await postCampaignEvent({
        campaignKey: CAMPAIGN_KEY,
        sessionId,
        eventName,
        step: eventStep,
        lineUserId: profile?.userId ?? null,
        source,
        payload,
      });
    },
    [profile?.userId, sessionId, source, step],
  );

  useEffect(() => {
    const stepEventMap: Partial<Record<string, CampaignEventName>> = {
      landing: "campaign_view",
      wallet: "wallet_view",
      success: "success_view",
    };
    const eventName = stepEventMap[step];
    const dedupeKey = `${step}:${eventName ?? ""}`;
    if (!eventName || lastStepEventRef.current === dedupeKey) return;
    lastStepEventRef.current = dedupeKey;
    void logEvent(eventName, reward ? { reward: reward.title } : undefined);
  }, [logEvent, reward, step, lastStepEventRef]);

  const handleStart = async () => {
    if (registering) return;
    const fullName = profile?.displayName?.trim();
    if (!fullName) return;
    void unlockSfxFromUserGesture();
    void playTap();
    setRegistering(true);
    try {
      await logEvent("registration_start", undefined, "landing");
      await fetch("/api/pharmacy-plus/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignKey: CAMPAIGN_KEY,
          sessionId,
          lineUserId: profile?.userId ?? null,
          displayName: profile?.displayName ?? null,
          fullName,
          isLineFriend: isFriend,
          source,
        }),
      });
      await logEvent("registration_submit", { qrId: source.qrId ?? null }, "landing");
      setSelectedCapsule(null);
      setReward(null);
      setRevealComplete(false);
      setPlayPhase("idle");
      setStep("play");
    } finally {
      setRegistering(false);
    }
  };

  const handleSettled = useCallback(() => {
    setPlayPhase("settled");
    safeVibrate([28, 40, 32]);
  }, [setPlayPhase]);

  const handlePickCapsule = async (index: number) => {
    if (drawing || playPhase !== "settled") return;
    void unlockSfxFromUserGesture();
    void playTap();
    safeVibrate(14);
    setSelectedCapsule(index);
    setDrawing(true);
    setPlayPhase("drawing");
    await logEvent("game_complete", { trigger: "tap_capsule", capsuleIndex: index + 1 }, "play");

    const heartbeat = await playHeartbeat();
    try {
      const res = await fetch("/api/pharmacy-plus/reward/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignKey: CAMPAIGN_KEY,
          sessionId,
          lineUserId: profile?.userId ?? null,
        }),
      });
      const data = (await res.json()) as CampaignDrawResponse;
      if (data?.reward) {
        setReward(data.reward);
        await logEvent(
          "reward_reveal",
          {
            reward: data.reward.title,
            storage: data.storage,
            existing: data.existing ?? false,
            qrId: source.qrId ?? null,
            capsuleIndex: index + 1,
          },
          "reward",
        );
        window.setTimeout(() => {
          heartbeat?.stop();
          setStep("reward");
          setRevealComplete(false);
        }, 600);
      }
    } finally {
      setDrawing(false);
      window.setTimeout(() => heartbeat?.stop(), 1200);
    }
  };

  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
    void playWin();
    safeVibrate([18, 35, 22, 40, 55]);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#E8C994", "#D4AF7A", "#F5EFE0", "#9C7A3F"],
    });
  }, [setRevealComplete]);

  const handleClaim = async ({ friendOverride = false }: { friendOverride?: boolean } = {}) => {
    if (!reward) return;
    if (!isFriend && !friendOverride) {
      setGateReturnStep("reward");
      setGateAttempts(0);
      setGateMessage(null);
      setStep("gate");
      return;
    }
    setClaiming(true);
    try {
      await logEvent(
        "reward_claim_click",
        { reward: reward.title, qrId: source.qrId ?? null },
        "reward",
      );
      const res = await fetch("/api/pharmacy-plus/reward/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignKey: CAMPAIGN_KEY, sessionId, reward }),
      });
      const data = await res.json();
      if (data?.reward) {
        setReward(data.reward);
        void playSoftConfirm();
        safeVibrate([20, 30, 20]);
        setStep("wallet");
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleGateCheck = async () => {
    if (gateChecking) return;
    setGateChecking(true);
    setGateMessage(null);
    try {
      const nextFriendship = await refreshFriendship();
      const unlocked = Boolean(nextFriendship?.friendFlag);
      setGateAttempts((count) => count + 1);
      if (unlocked) {
        await logEvent(
          "add_friend_success",
          { friendFlag: true, qrId: source.qrId ?? null },
          "gate",
        );
        setGateMessage(null);
        await handleClaim({ friendOverride: true });
        return;
      }
      setGateMessage(
        "ยังไม่พบสถานะเพิ่มเพื่อน ลองกดเพิ่มเพื่อนแล้วกลับมาตรวจสอบอีกครั้ง",
      );
    } finally {
      setGateChecking(false);
    }
  };

  const handleGateBypass = async () => {
    if (claiming) return;
    await logEvent(
      "add_friend_success",
      { friendFlag: false, bypass: true, qrId: source.qrId ?? null },
      "gate",
    );
    await handleClaim({ friendOverride: true });
  };

  const handleFinishWallet = () => {
    if (!reward) return;
    setStaffMode(false);
    setCopiedCode(null);
    setStep("success");
  };

  const handleCopyCode = async () => {
    if (!reward?.couponCode) return;
    try {
      await navigator.clipboard.writeText(reward.couponCode);
      setCopiedCode(reward.couponCode);
      safeVibrate([14, 24, 14]);
      void playTap();
    } catch {
      setCopiedCode(null);
    }
  };

  const handleShowForStaff = () => {
    setStaffMode(true);
    safeVibrate(18);
    void playTap();
  };

  return {
    logEvent,
    handleStart,
    handleSettled,
    handlePickCapsule,
    handleRevealComplete,
    handleClaim,
    handleGateCheck,
    handleGateBypass,
    handleFinishWallet,
    handleCopyCode,
    handleShowForStaff,
  };
}
