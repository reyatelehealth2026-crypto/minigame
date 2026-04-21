import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildCouponCode, pickReward, type CampaignReward, type RewardPoolItemInput } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DbPoolRow = {
  id: number;
  reward_title: string;
  reward_detail: string;
  reward_tone: "peach" | "green" | "blue";
  coupon_code_prefix: string;
  weight: number;
  stock_total: number | null;
  stock_issued: number;
  is_active: boolean;
};

function buildFallbackReward(poolItem?: RewardPoolItemInput): CampaignReward {
  const picked = pickReward(poolItem ? [poolItem] : undefined);
  return {
    title: picked.title,
    detail: picked.detail,
    tone: picked.tone,
    couponCode: buildCouponCode(picked.couponPrefix),
    rewardCode: `pp-${randomUUID().slice(0, 8)}`,
    status: "issued",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function mapPoolRow(row: DbPoolRow): RewardPoolItemInput {
  return {
    id: row.id,
    title: row.reward_title,
    detail: row.reward_detail,
    tone: row.reward_tone,
    couponPrefix: row.coupon_code_prefix,
    weight: row.weight,
    stockTotal: row.stock_total,
    stockIssued: row.stock_issued,
    isActive: row.is_active,
  };
}

type RewardRow = {
  reward_code: string;
  reward_title: string;
  reward_detail: string;
  reward_tone: CampaignReward["tone"];
  coupon_code: string;
  status: NonNullable<CampaignReward["status"]>;
  expires_at: string | null;
};

function mapRewardRow(row: RewardRow): CampaignReward {
  return {
    rewardCode: row.reward_code,
    title: row.reward_title,
    detail: row.reward_detail,
    tone: row.reward_tone,
    couponCode: row.coupon_code,
    status: row.status,
    expiresAt: row.expires_at,
  };
}

export async function POST(req: NextRequest) {
  const { campaignKey, sessionId, lineUserId } = await req.json();

  if (!campaignKey || !sessionId) {
    return NextResponse.json({ error: "campaignKey and sessionId required" }, { status: 400 });
  }

  const fallbackReward = buildFallbackReward();

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, storage: "noop", reward: fallbackReward });
  }

  try {
    const db = supabaseAdmin();
    const { data: existing } = await db
      .from("campaign_rewards")
      .select("reward_code, reward_title, reward_detail, reward_tone, coupon_code, status, expires_at")
      .eq("campaign_key", campaignKey)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, storage: "db", existing: true, reward: mapRewardRow(existing as RewardRow) });
    }

    const { data: poolRows } = await db
      .from("campaign_reward_pool")
      .select("id, reward_title, reward_detail, reward_tone, coupon_code_prefix, weight, stock_total, stock_issued, is_active")
      .eq("campaign_key", campaignKey)
      .eq("is_active", true)
      .order("id", { ascending: true });

    const selectedPool = pickReward((poolRows ?? []).map((row) => mapPoolRow(row as DbPoolRow)));
    const reward = buildFallbackReward(selectedPool);

    const { error } = await db.from("campaign_rewards").insert({
      campaign_key: campaignKey,
      session_id: sessionId,
      line_user_id: lineUserId ?? null,
      reward_pool_id: selectedPool.id ?? null,
      reward_code: reward.rewardCode,
      reward_title: reward.title,
      reward_detail: reward.detail,
      reward_tone: reward.tone,
      coupon_code: reward.couponCode,
      status: reward.status,
      expires_at: reward.expiresAt,
      metadata: { couponPrefix: selectedPool.couponPrefix },
    });

    if (error) {
      const { data: conflicted } = await db
        .from("campaign_rewards")
        .select("reward_code, reward_title, reward_detail, reward_tone, coupon_code, status, expires_at")
        .eq("campaign_key", campaignKey)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (conflicted) {
        return NextResponse.json({ ok: true, storage: "db", existing: true, reward: mapRewardRow(conflicted as RewardRow) });
      }

      return NextResponse.json({ ok: true, storage: "noop", reward });
    }

    if (selectedPool.id) {
      await db
        .from("campaign_reward_pool")
        .update({ stock_issued: (selectedPool.stockIssued ?? 0) + 1 })
        .eq("id", selectedPool.id);
    }

    return NextResponse.json({ ok: true, storage: "db", reward });
  } catch {
    return NextResponse.json({ ok: true, storage: "noop", reward: fallbackReward });
  }
}
