"use client";

import Image from "next/image";
import { CheckCircle2, Gift, LoaderCircle, LogIn, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ASSETS } from "../theme/gacha-assets";
import { BOARD_STEPS, GACHA_COLORS } from "../theme/gacha-theme";
import { GameButton } from "../ui/GameButton";
import { WoodSignHeading } from "../ui/WoodSignHeading";
import { MascotImage } from "../ui/MascotImage";
import type { CampaignConfig } from "@/lib/pharmacy-plus";

interface LandingScreenProps {
  config: CampaignConfig | null;
  starting: boolean;
  liffReady: boolean;
  loggedIn: boolean;
  displayName: string | null;
  onStart: () => void;
  onLogin: () => void;
}

export function LandingScreen({
  config,
  starting,
  liffReady,
  loggedIn,
  displayName,
  onStart,
  onLogin,
}: LandingScreenProps) {
  const configLoading = config === null;
  const canStart = liffReady && loggedIn && Boolean(displayName?.trim());
  const startDisabled = starting || !canStart;

  return (
    <div className="space-y-5 pb-8">
      {/* Wood sign heading with floating cat mascot */}
      <div className="relative flex items-center justify-center pt-2">
        <WoodSignHeading text="Cute Pet Gacha" className="max-w-[260px]" />
        <MascotImage
          mascot="cat"
          size={72}
          animation="float"
          className="absolute -right-2 -top-4"
        />
      </div>

      {/* Hero poster card */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[#F5922A]/40 bg-[#FFF8E1] shadow-[0_16px_40px_rgba(245,146,42,0.18)]">
        <div className="relative h-72 w-full">
          <Image
            src={ASSETS.bg.poster}
            alt="Cute Pet Gacha event poster"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FFF8E1]/90" />
        </div>

        <div className="relative space-y-3 px-5 pb-6 pt-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F5922A]/50 bg-[#FFF3E0] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#E65100]">
            <Sparkles size={11} /> Lucky Gacha
          </div>

          {configLoading ? (
            <div className="h-4 w-44 animate-pulse rounded-full bg-[#F5922A]/20" aria-hidden />
          ) : config?.campaignName ? (
            <p className="text-sm font-semibold text-[#8D6E63]">{config.campaignName}</p>
          ) : null}

          <p className="text-2xl font-bold leading-tight tracking-tight text-[#5D4037]">
            หมุนไข่ ลุ้นโชค รับรางวัล
          </p>

          {liffReady && loggedIn && displayName ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#FFAB40]/50 bg-[#FFF9C4] px-3 py-1.5 text-xs font-semibold text-[#5D4037]"
            >
              เล่นในชื่อ{" "}
              <span className="font-bold text-[#E65100]">{displayName}</span>
            </motion.div>
          ) : null}

          {/* Benefit bullets */}
          {configLoading ? (
            <ul className="space-y-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-[#F5922A]/20" />
                  <span className="h-3 flex-1 animate-pulse rounded-full bg-[#F5922A]/10" />
                </li>
              ))}
            </ul>
          ) : (config?.benefitBullets ?? []).length > 0 ? (
            <ul className="space-y-1.5">
              {(config?.benefitBullets ?? []).map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-sm font-medium leading-snug text-[#5D4037]"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#F5922A]"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* CTA button */}
          <div className="pt-1">
            {!liffReady ? (
              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-wait items-center justify-center gap-2 rounded-2xl bg-[#F5922A]/20 px-5 py-4 text-base font-bold text-[#8D6E63] opacity-80"
              >
                <LoaderCircle className="animate-spin" size={20} />
                กำลังเตรียม LINE...
              </button>
            ) : !loggedIn ? (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#FFAB40_0%,#F5922A_55%,#E65100_100%)] px-5 py-4 text-base font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(245,146,42,0.4)]"
              >
                <LogIn size={20} /> เข้าใช้งานผ่าน LINE
              </button>
            ) : (
              <GameButton
                onClick={onStart}
                disabled={startDisabled}
                className="py-4 text-base font-black uppercase tracking-[0.18em]"
              >
                {starting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle className="animate-spin" size={20} />
                    กำลังเริ่ม...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={20} />
                    เริ่มเล่นเลย
                  </span>
                )}
              </GameButton>
            )}

            {!liffReady ? (
              <p className="mt-2 text-center text-[11px] text-[#8D6E63]">
                กำลังโหลด LINE LIFF เพื่อเชื่อมต่อบัญชีของคุณ
              </p>
            ) : !loggedIn ? (
              <p className="mt-2 text-center text-[11px] text-[#8D6E63]">
                เข้าสู่ระบบ LINE เพื่อเริ่มเล่นและบันทึกสิทธิ์
              </p>
            ) : !displayName ? (
              <div className="mt-2 space-y-1 text-center">
                <p className="text-[11px] text-[#8D6E63]">
                  รอดึงชื่อจากโปรไฟล์ LINE สักครู่...
                </p>
                <button
                  type="button"
                  onClick={onLogin}
                  className="text-xs font-bold text-[#F5922A] underline underline-offset-2"
                >
                  ลองเข้าสู่ระบบใหม่
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* How to play */}
      <section className="rounded-[1.6rem] border border-[#F5922A]/25 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
        <p className="text-lg font-bold" style={{ color: GACHA_COLORS.brown.text }}>
          วิธีเล่น
        </p>
        <div className="mt-3 divide-y divide-[#F5922A]/15">
          {BOARD_STEPS.map(({ title, description }, index) => (
            <div
              key={title}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3E0] ring-1 ring-[#F5922A]/30">
                <span className="text-lg font-black text-[#F5922A]">{index + 1}</span>
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[linear-gradient(180deg,#FFAB40,#E65100)] text-[9px] font-black text-white">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-black text-[#5D4037]">{title}</p>
                <p className="mt-0.5 text-sm leading-6 text-[#8D6E63]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reward teasers */}
      {configLoading ? (
        <section
          className="rounded-[1.6rem] border border-[#F5922A]/25 bg-white/70 p-5"
          aria-hidden
        >
          <div className="h-5 w-28 animate-pulse rounded-lg bg-[#F5922A]/20" />
          <div className="mt-3 flex gap-2 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-9 w-32 shrink-0 animate-pulse rounded-full bg-[#F5922A]/10"
              />
            ))}
          </div>
        </section>
      ) : (config?.rewardTeasers ?? []).length > 0 ? (
        <section className="rounded-[1.6rem] border border-[#F5922A]/25 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#FFF3E0] p-1.5 ring-1 ring-[#F5922A]/30">
              <Gift size={14} className="text-[#F5922A]" />
            </div>
            <p className="text-lg font-bold text-[#5D4037]">ของรางวัล</p>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {(config?.rewardTeasers ?? []).map((item) => (
              <div
                key={item}
                className="shrink-0 rounded-full border border-[#F5922A]/40 bg-[#FFF3E0] px-4 py-2 text-sm font-bold text-[#E65100]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
