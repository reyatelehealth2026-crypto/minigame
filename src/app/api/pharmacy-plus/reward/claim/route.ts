import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { campaignKey, sessionId } = await req.json();

  if (!campaignKey || !sessionId) {
    return NextResponse.json({ error: "campaignKey and sessionId required" }, { status: 400 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: false, storage: "noop", error: "Supabase admin is not configured" }, { status: 503 });
  }

  try {
    const db = supabaseAdmin();
    const claimedAt = new Date().toISOString();
    const { data, error } = await db
      .from("campaign_rewards")
      .update({ status: "claimed", claimed_at: claimedAt })
      .eq("campaign_key", campaignKey)
      .eq("session_id", sessionId)
      .select("reward_code, reward_title, reward_detail, reward_tone, coupon_code, status, expires_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, storage: "db", error: error?.message ?? "reward not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      storage: "db",
      reward: {
        rewardCode: data.reward_code,
        title: data.reward_title,
        detail: data.reward_detail,
        tone: data.reward_tone,
        couponCode: data.coupon_code,
        status: data.status,
        expiresAt: data.expires_at,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, storage: "db", error: error instanceof Error ? error.message : "claim unavailable" }, { status: 500 });
  }
}
