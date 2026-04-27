export type Step = "landing" | "play" | "reward" | "gate" | "wallet" | "success";
export type PlayPhase = "idle" | "shaking" | "settled" | "drawing";

export const GACHA_COLORS = {
  orange: { primary: "#F5922A", light: "#FFAB40", dark: "#E65100" },
  gold: { primary: "#FFD54F", glow: "rgba(255,213,79,0.4)" },
  cream: { bg: "#FFF8E1", card: "#FFFDE7" },
  sky: { primary: "#4FC3F7", dark: "#0288D1" },
  brown: { text: "#5D4037", wood: "#8D6E63" },
  purple: { accent: "#7B1FA2", light: "#CE93D8" },
  green: { grass: "#8BC34A", dark: "#558B2F" },
} as const;

export const GACHA_GRADIENTS = {
  orangeButton: "linear-gradient(180deg, #FFAB40 0%, #F5922A 55%, #E65100 100%)",
  goldGlow: "radial-gradient(circle, rgba(255,213,79,0.5) 0%, transparent 70%)",
  warmBg: "linear-gradient(180deg, #FFF8E1 0%, #FFE0B2 50%, #FFCC80 100%)",
  skyBg: "linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #E1F5FE 100%)",
} as const;

export const STAFF_PROMPT = "โชว์โค้ดนี้กับพนักงานที่ร้าน";

export const BOARD_STEPS = [
  { key: "play" as const, title: "เขย่าเลือก", description: "เขย่าแล้วแตะลูกที่ใช่" },
  { key: "reward" as const, title: "เปิดรางวัล", description: "ลุ้นรางวัลที่ได้" },
  { key: "wallet" as const, title: "รับสิทธิ์", description: "ปลดล็อกผ่าน LINE" },
] as const;

export const BOARD_KEYS = BOARD_STEPS.map((s) => s.key) as readonly Step[];

export const STEP_COPY: Record<Exclude<Step, "play">, { eyebrow: string; title: string; description: string }> = {
  landing: { eyebrow: "Lucky Gacha", title: "หมุนไข่ ลุ้นโชค", description: "เขย่าตู้แล้วแตะ 1 ลูกเพื่อรับรางวัล" },
  reward: { eyebrow: "Your Reward", title: "เปิดรางวัล", description: "" },
  gate: { eyebrow: "LINE Unlock", title: "เพิ่มเพื่อนรับสิทธิ์", description: "ปลดล็อกคูปองผ่าน LINE OA" },
  wallet: { eyebrow: "Coupon Wallet", title: "สิทธิ์พร้อมใช้", description: STAFF_PROMPT },
  success: { eyebrow: "Completed", title: "เรียบร้อยแล้ว", description: STAFF_PROMPT },
};

export const PLAY_COPY = {
  idle: { headline: "ปลุกโชคของคุณ", caption: "กดค้างเพื่อเขย่า" },
  shaking: { headline: "กำลังเขย่า...", caption: "ค้างไว้... รู้สึกถึงพลังไหม?" },
  settled: { headline: "เลือก 1 ลูก", caption: "แตะลูกที่ใช่" },
  drawing: { headline: "ลุ้นรางวัล", caption: "เปิดรางวัลของคุณ..." },
} as const;

export function formatThaiDate(date?: string | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

export function rewardAmount(title: string): number | null {
  const m = title.match(/\d+/);
  return m ? Number(m[0]) : null;
}
