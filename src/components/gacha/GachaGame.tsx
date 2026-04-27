"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GameShell } from "./layout/GameShell";
import { StepProgressBar } from "./layout/StepProgressBar";
import { SfxToggle } from "./layout/SfxToggle";
import { LandingScreen } from "./screens/LandingScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { RewardScreen } from "./screens/RewardScreen";
import { GateScreen } from "./screens/GateScreen";
import { WalletScreen } from "./screens/WalletScreen";
import { SuccessScreen } from "./screens/SuccessScreen";
import { useGameState } from "./hooks/useGameState";
import { useGameHandlers } from "./hooks/useGameHandlers";
import type { Step } from "./theme/gacha-theme";

const OUTDOOR_STEPS: readonly Step[] = ["play", "reward"];

const SLIDE_VARIANTS = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function GachaGame(): React.ReactElement {
  const state = useGameState();
  const handlers = useGameHandlers(state);

  const {
    step,
    config,
    reward,
    playPhase,
    setPlayPhase,
    selectedCapsule,
    drawing,
    claiming,
    registering,
    revealComplete,
    gateChecking,
    gateAttempts,
    gateMessage,
    copiedCode,
    staffMode,
    sfxMuted,
    toggleSfx,
    isFriend,
    ready,
    loggedIn,
    profile,
    login,
    gateReturnStep,
    setStep,
    source,
  } = state;

  const {
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
    logEvent,
  } = handlers;

  const shellVariant = OUTDOOR_STEPS.includes(step) ? "outdoor" : "indoor";
  const showProgressBar =
    step !== "play" && step !== "reward" && step !== "landing";

  return (
    <GameShell variant={shellVariant}>
      <SfxToggle muted={sfxMuted} onToggle={toggleSfx} />

      <div className="flex flex-1 flex-col gap-4 px-4 py-6">
        {showProgressBar && <StepProgressBar currentStep={step} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={SLIDE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            {step === "landing" && (
              <LandingScreen
                config={config}
                starting={registering}
                liffReady={ready}
                loggedIn={loggedIn}
                displayName={profile?.displayName ?? null}
                onStart={() => void handleStart()}
                onLogin={login}
              />
            )}

            {step === "play" && (
              <PlayScreen
                phase={playPhase}
                setPhase={setPlayPhase}
                selectedCapsule={selectedCapsule}
                drawing={drawing}
                onSettled={handleSettled}
                onPickCapsule={(index) => void handlePickCapsule(index)}
                sfxMuted={sfxMuted}
                onToggleSfx={toggleSfx}
              />
            )}

            {step === "reward" && reward && (
              <RewardScreen
                reward={reward}
                revealComplete={revealComplete}
                isFriend={isFriend}
                claiming={claiming}
                onClaim={() => void handleClaim()}
                onRevealComplete={handleRevealComplete}
                sfxMuted={sfxMuted}
                onToggleSfx={toggleSfx}
              />
            )}

            {step === "gate" && (
              <GateScreen
                config={config}
                isFriend={isFriend}
                gateChecking={gateChecking}
                gateAttempts={gateAttempts}
                gateMessage={gateMessage}
                claiming={claiming}
                onCheck={() => void handleGateCheck()}
                onBypass={() => void handleGateBypass()}
                onBack={() => setStep(gateReturnStep)}
                onAddFriendClick={() =>
                  void logEvent(
                    "add_friend_click",
                    { qrId: source.qrId ?? null },
                    "gate",
                  )
                }
              />
            )}

            {step === "wallet" && reward && (
              <WalletScreen
                reward={reward}
                copiedCode={copiedCode}
                staffMode={staffMode}
                onCopyCode={() => void handleCopyCode()}
                onShowForStaff={handleShowForStaff}
                onFinish={handleFinishWallet}
              />
            )}

            {step === "success" && reward && (
              <SuccessScreen
                reward={reward}
                onRestart={() => setStep("landing")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
