import { NextRequest, NextResponse } from "next/server";
import { CAMPAIGN_KEY } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildMetrics(entries = 0, events = 0, rewardsIssued = 0, rewardsClaimed = 0, rewardsRedeemed = 0) {
  return {
    entries,
    events,
    rewardsIssued,
    rewardsClaimed,
    rewardsRedeemed,
  };
}

function toRate(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

export async function GET(req: NextRequest) {
  const campaignKey = req.nextUrl.searchParams.get("campaignKey") ?? CAMPAIGN_KEY;

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({
      ok: true,
      storage: "noop",
      campaignKey,
      asOf: new Date().toISOString(),
      metrics: buildMetrics(),
      rates: {
        claimRateFromIssued: 0,
        redeemRateFromClaimed: 0,
        redeemRateFromIssued: 0,
      },
    });
  }

  try {
    const db = supabaseAdmin();

    const [{ count: entries }, { count: events }, { count: issued }, { count: claimed }, { count: redeemed }] = await Promise.all([
      db.from("campaign_entries").select("id", { head: true, count: "exact" }).eq("campaign_key", campaignKey),
      db.from("campaign_events").select("id", { head: true, count: "exact" }).eq("campaign_key", campaignKey),
      db.from("campaign_rewards").select("id", { head: true, count: "exact" }).eq("campaign_key", campaignKey),
      db.from("campaign_rewards").select("id", { head: true, count: "exact" }).eq("campaign_key", campaignKey).eq("status", "claimed"),
      db.from("campaign_rewards").select("id", { head: true, count: "exact" }).eq("campaign_key", campaignKey).eq("status", "redeemed"),
    ]);

    const metrics = buildMetrics(entries ?? 0, events ?? 0, issued ?? 0, claimed ?? 0, redeemed ?? 0);

    return NextResponse.json({
      ok: true,
      storage: "db",
      campaignKey,
      asOf: new Date().toISOString(),
      metrics,
      rates: {
        claimRateFromIssued: toRate(metrics.rewardsClaimed, metrics.rewardsIssued),
        redeemRateFromClaimed: toRate(metrics.rewardsRedeemed, metrics.rewardsClaimed),
        redeemRateFromIssued: toRate(metrics.rewardsRedeemed, metrics.rewardsIssued),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      ok: true,
      storage: "noop",
      campaignKey,
      asOf: new Date().toISOString(),
      detail: error instanceof Error ? error.message : "summary unavailable",
      metrics: buildMetrics(),
      rates: {
        claimRateFromIssued: 0,
        redeemRateFromClaimed: 0,
        redeemRateFromIssued: 0,
      },
    });
  }
}
