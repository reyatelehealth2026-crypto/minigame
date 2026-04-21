export const CAMPAIGN_KEY = "pharmacy-plus-shake-to-win";

export type RewardTone = "peach" | "green" | "blue";

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
  tone: RewardTone;
  status?: "issued" | "claimed" | "redeemed" | "expired" | "cancelled";
  expiresAt?: string | null;
};

export type RewardPoolItemInput = {
  id?: number;
  title: string;
  detail: string;
  tone: RewardTone;
  couponPrefix: string;
  weight?: number;
  stockTotal?: number | null | "";
  stockIssued?: number;
  isActive?: boolean;
};

export type CampaignDrawResponse = {
  ok: boolean;
  reward: CampaignReward;
  storage: "db" | "noop";
  existing?: boolean;
};

export const defaultRewardPool: RewardPoolItemInput[] = [
  { title: "คูปองลด 30 บาท", detail: "ใช้ได้เมื่อซื้อครบ 299 บาท", couponPrefix: "PP30", tone: "peach", weight: 4, stockTotal: null, isActive: true },
  { title: "คูปองลด 50 บาท", detail: "ใช้ได้กับสินค้าสุขภาพที่ร่วมรายการ", couponPrefix: "PP50", tone: "green", weight: 2, stockTotal: null, isActive: true },
  { title: "ฟรีเจลแอลกอฮอล์พกพา", detail: "รับที่หน้าร้านเมื่อแสดงสิทธิ์", couponPrefix: "PPGEL", tone: "blue", weight: 1, stockTotal: 300, isActive: true },
];

export function pickReward(pool: RewardPoolItemInput[] = defaultRewardPool): RewardPoolItemInput {
  const activePool = pool.filter((item) => {
    const stockTotal = typeof item.stockTotal === "number" ? item.stockTotal : null;
    return (item.isActive ?? true) && (stockTotal == null || (item.stockIssued ?? 0) < stockTotal);
  });
  const usablePool = activePool.length ? activePool : defaultRewardPool;
  const totalWeight = usablePool.reduce((sum, item) => sum + Math.max(1, item.weight ?? 1), 0);
  let cursor = Math.random() * totalWeight;
  for (const item of usablePool) {
    cursor -= Math.max(1, item.weight ?? 1);
    if (cursor <= 0) return item;
  }
  return usablePool[0] ?? defaultRewardPool[0];
}

export function buildCouponCode(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${random}`;
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
