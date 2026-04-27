"use client";

import { CheckCircle2, HeartHandshake, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { MascotImage } from "../ui/MascotImage";
import type { CampaignConfig } from "@/lib/pharmacy-plus";

interface GateScreenProps {
  config: CampaignConfig | null;
  isFriend: boolean;
  gateChecking: boolean;
  gateAttempts: number;
  gateMessage: string | null;
  claiming: boolean;
  onCheck: () => void;
  onBypass: () => void;
  onBack: () => void;
  onAddFriendClick: () => void;
}

const BENEFIT_LINES = [
  "รับคูปองได้ทันทีหลังปลดล็อก",
  "ใช้งานสิทธิ์ได้ที่ร้านโดยแสดงโค้ดให้พนักงาน",
  "ไม่เสียค่าใช้จ่ายในการเข้าร่วม",
];

export function GateScreen({
  config,
  isFriend,
  gateChecking,
  gateAttempts,
  gateMessage,
  claiming,
  onCheck,
  onBypass,
  onBack,
  onAddFriendClick,
}: GateScreenProps) {
  return (
    <div className="space-y-4 pb-8">
      {/* Mascot pair with heart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-center gap-3 pt-2"
      >
        <MascotImage mascot="cat" size={72} animation="float" />
        <div className="flex flex-col items-center gap-1">
          <HeartHandshake size={28} className="text-[#F5922A]" />
          <span className="text-[10px] font-bold text-[#8D6E63]">LINE OA</span>
        </div>
        <MascotImage mascot="bird" size={72} animation="bounce" />
      </motion.div>

      {/* Main card */}
      <div className="rounded-[1.8rem] border border-[#F5922A]/30 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <h2 className="text-center text-xl font-black text-[#5D4037]">
          เพิ่มเพื่อน LINE OA
        </h2>
        <p className="mt-1 text-center text-sm leading-6 text-[#8D6E63]">
          ปลดล็อกสิทธิ์รับคูปองและเก็บไว้ใน LINE ของคุณ
        </p>

        {/* Benefits list */}
        <ul className="mt-4 space-y-2 rounded-2xl border border-[#F5922A]/20 bg-[#FFF8E1] p-4">
          {BENEFIT_LINES.map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm text-[#5D4037]">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-[#F5922A]"
                aria-hidden
              />
              {line}
            </li>
          ))}
        </ul>

        {/* Current status */}
        <div className="mt-4 rounded-2xl border border-[#F5922A]/20 bg-[#FFF3E0] px-4 py-3 text-center text-sm text-[#8D6E63]">
          สถานะปัจจุบัน:{" "}
          <span className="font-bold text-[#5D4037]">
            {isFriend ? "เพิ่มเพื่อนแล้ว" : "ยังไม่ได้เพิ่มเพื่อน"}
          </span>
        </div>

        {/* Add friend link button */}
        <a
          href={config?.addFriendUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          onClick={onAddFriendClick}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(180deg,#FFAB40_0%,#F5922A_55%,#E65100_100%)] px-5 py-3.5 text-base font-black text-white shadow-[0_8px_24px_rgba(245,146,42,0.35)] transition hover:brightness-105"
        >
          <HeartHandshake size={18} />
          เพิ่มเพื่อน LINE OA
        </a>

        {/* Check status button */}
        <button
          type="button"
          onClick={onCheck}
          disabled={gateChecking || claiming}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] border-2 border-[#F5922A]/50 bg-white px-5 py-3.5 text-base font-bold text-[#F5922A] transition hover:bg-[#FFF3E0] disabled:opacity-50"
        >
          {gateChecking
            ? "กำลังตรวจสอบสถานะ..."
            : isFriend
            ? "ตรวจสอบสถานะแล้ว ไปต่อ"
            : "ตรวจสอบสถานะการเพิ่มเพื่อน"}
        </button>

        {/* Checking spinner message */}
        {gateChecking ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#F5922A]/25 bg-[#FFF3E0] px-4 py-3 text-sm text-[#5D4037]">
            <LoaderCircle size={16} className="shrink-0 animate-spin text-[#F5922A]" />
            กำลังเช็กสถานะการเพิ่มเพื่อน กรุณารอสักครู่...
          </div>
        ) : null}

        {/* Status message */}
        {gateMessage ? (
          <div className="mt-3 rounded-2xl border border-[#FFAB40]/40 bg-[#FFF9C4] px-4 py-3 text-sm text-[#5D4037]">
            {gateMessage}
          </div>
        ) : null}

        {/* Bypass button — shown after 2 failed attempts */}
        {gateAttempts >= 2 && !isFriend ? (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={onBypass}
            disabled={claiming}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] border-2 border-[#8D6E63]/40 bg-white px-5 py-3.5 text-base font-bold text-[#8D6E63] transition hover:bg-[#FFF8E1] disabled:opacity-50"
          >
            ยืนยันว่าเพิ่มแล้ว ดำเนินการต่อ
          </motion.button>
        ) : null}

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          disabled={claiming || gateChecking}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-[#D7CCC8] bg-white/60 px-5 py-3 text-sm font-semibold text-[#8D6E63] transition hover:bg-white/80 disabled:opacity-50"
        >
          กลับไปหน้ารางวัล
        </button>
      </div>
    </div>
  );
}
