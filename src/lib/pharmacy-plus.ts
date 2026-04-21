export const CAMPAIGN_KEY = "pharmacy-plus-shake-to-win";

export const CAMPAIGN_EVENT_NAMES = [
  "campaign_view",
  "add_friend_click",
  "add_friend_success",
  "registration_start",
  "registration_submit",
  "game_start",
  "game_complete",
  "reward_reveal",
  "reward_claim_click",
  "wallet_view",
  "success_view",
  "coupon_redeem_click",
] as const;

export type CampaignEventName = (typeof CAMPAIGN_EVENT_NAMES)[number];
export type RewardTone = "peach" | "green" | "blue";

export type CampaignSource = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  branch?: string | null;
  qrId?: string | null;
};

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

export type CampaignEventPayload = {
  campaignKey: string;
  sessionId: string;
  eventName: CampaignEventName;
  step: string;
  lineUserId?: string | null;
  source?: CampaignSource;
  payload?: Record<string, unknown>;
};

export type CampaignEntryPayload = {
  campaignKey: string;
  sessionId: string;
  lineUserId?: string | null;
  displayName?: string | null;
  fullName: string;
  phone?: string | null;
  branch?: string | null;
  isLineFriend?: boolean;
  source?: CampaignSource;
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

export function createSourceFromParams(params: URLSearchParams): CampaignSource {
  return {
    source: params.get("utm_source") ?? params.get("source"),
    medium: params.get("utm_medium") ?? params.get("medium"),
    campaign: params.get("utm_campaign") ?? params.get("campaign"),
    branch: params.get("branch"),
    qrId: params.get("qr_id"),
  };
}

export async function postCampaignEvent(body: CampaignEventPayload) {
  try {
    await fetch("/api/pharmacy-plus/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // no-op for MVP telemetry
  }
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
