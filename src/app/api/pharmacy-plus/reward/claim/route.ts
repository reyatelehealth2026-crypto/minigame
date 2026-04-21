import { NextRequest, NextResponse } from "next/server";
import { type CampaignReward } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function claimFallbackReward(reward?: CampaignReward | null): CampaignReward | null {
  if (!reward) return null;
  return {
    ...reward,
    status: reward.status === "redeemed" ? "redeemed" : "claimed",
  };
}

export async function POST(req: NextRequest) {
  const { campaignKey, sessionId, reward } = (await req.json()) as {
    campaignKey?: string;
    sessionId?: string;
    reward?: CampaignReward | null;
  };

  if (!campaignKey || !sessionId) {
    return NextResponse.json({ error: "campaignKey and sessionId required" }, { status: 400 });
  }

  if (!hasSupabaseAdmin()) {
    const fallbackReward = claimFallbackReward(reward);
    return NextResponse.json({ ok: Boolean(fallbackReward), storage: "noop", reward: fallbackReward });
  }

  try {
    const db = supabaseAdmin();
    const { data: existing, error: existingError } = await db
      .from("campaign_rewards")
      .select("reward_code, reward_title, reward_detail, reward_tone, coupon_code, status, expires_at")
      .eq("campaign_key", campaignKey)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ ok: false, storage: "db", error: existingError.message }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ ok: false, storage: "db", error: "reward not found" }, { status: 404 });
    }

    if (existing.status === "claimed" || existing.status === "redeemed") {
      return NextResponse.json({ ok: true, storage: "db", reward: mapRewardRow(existing as RewardRow), existing: true });
    }

    const claimedAt = new Date().toISOString();
    const { data, error } = await db
      .from("campaign_rewards")
      .update({ status: "claimed", claimed_at: claimedAt })
      .eq("campaign_key", campaignKey)
      .eq("session_id", sessionId)
      .eq("status", "issued")
      .select("reward_code, reward_title, reward_detail, reward_tone, coupon_code, status, expires_at")
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({ ok: true, storage: "db", reward: mapRewardRow(data as RewardRow) });
    }

    const { data: afterConflict } = await db
      .from("campaign_rewards")
      .select("reward_code, reward_title, reward_detail, reward_tone, coupon_code, status, expires_at")
      .eq("campaign_key", campaignKey)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (afterConflict) {
      return NextResponse.json({ ok: true, storage: "db", reward: mapRewardRow(afterConflict as RewardRow), existing: true });
    }

    return NextResponse.json({ ok: false, storage: "db", error: error?.message ?? "claim unavailable" }, { status: 500 });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, storage: "db", error: error instanceof Error ? error.message : "claim unavailable" }, { status: 500 });
  }
}
