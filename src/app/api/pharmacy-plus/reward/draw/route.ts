import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { pickReward, type CampaignReward } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildFallbackReward(): CampaignReward {
  const picked = pickReward();
  return {
    ...picked,
    rewardCode: `pp-${randomUUID().slice(0, 8)}`,
    status: "issued",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
      return NextResponse.json({
        ok: true,
        storage: "db",
        existing: true,
        reward: {
          rewardCode: existing.reward_code,
          title: existing.reward_title,
          detail: existing.reward_detail,
          tone: existing.reward_tone,
          couponCode: existing.coupon_code,
          status: existing.status,
          expiresAt: existing.expires_at,
        },
      });
    }

    const reward = buildFallbackReward();
    const { error } = await db.from("campaign_rewards").insert({
      campaign_key: campaignKey,
      session_id: sessionId,
      line_user_id: lineUserId ?? null,
      reward_code: reward.rewardCode,
      reward_title: reward.title,
      reward_detail: reward.detail,
      reward_tone: reward.tone,
      coupon_code: reward.couponCode,
      status: reward.status,
      expires_at: reward.expiresAt,
    });

    if (error) {
      return NextResponse.json({ ok: true, storage: "noop", reward });
    }

    return NextResponse.json({ ok: true, storage: "db", reward });
  } catch {
    return NextResponse.json({ ok: true, storage: "noop", reward: fallbackReward });
  }
}
