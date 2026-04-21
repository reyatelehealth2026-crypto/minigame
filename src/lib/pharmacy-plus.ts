export const CAMPAIGN_KEY = "pharmacy-plus-shake-to-win";

export type CampaignConfig = {
  campaignKey: string;
  campaignName: string;
  addFriendUrl: string | null;
  benefitBullets: string[];
  rewardTeasers: string[];
  branches: string[];
};

export type CampaignReward = {
  rewardCode?: string;
  title: string;
  detail: string;
  couponCode: string;
  tone: "peach" | "green" | "blue";
  status?: "issued" | "claimed" | "redeemed" | "expired" | "cancelled";
  expiresAt?: string | null;
};

export type CampaignDrawResponse = {
  ok: boolean;
  reward: CampaignReward;
  storage: "db" | "noop";
  existing?: boolean;
};

export function pickReward(): CampaignReward {
  const pool: CampaignReward[] = [
    { title: "คูปองลด 30 บาท", detail: "ใช้ได้เมื่อซื้อครบ 299 บาท", couponCode: "PP-30299", tone: "peach" },
    { title: "คูปองลด 50 บาท", detail: "ใช้ได้กับสินค้าสุขภาพที่ร่วมรายการ", couponCode: "PP-50CARE", tone: "green" },
    { title: "ฟรีเจลแอลกอฮอล์พกพา", detail: "รับที่หน้าร้านเมื่อแสดงสิทธิ์", couponCode: "PP-GEL01", tone: "blue" },
  ];
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

export function getToneClasses(tone: CampaignReward["tone"]) {
  switch (tone) {
    case "green":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "blue":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-orange-200 bg-orange-50 text-orange-700";
  }
}
