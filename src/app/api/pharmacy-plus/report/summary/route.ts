import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const campaignKey = req.nextUrl.searchParams.get("campaignKey") ?? "pharmacy-plus-shake-to-win";

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({
      ok: true,
      storage: "noop",
      campaignKey,
      metrics: {
        entries: 0,
        events: 0,
        rewardsIssued: 0,
        rewardsClaimed: 0,
        rewardsRedeemed: 0,
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

    return NextResponse.json({
      ok: true,
      storage: "db",
      campaignKey,
      metrics: {
        entries: entries ?? 0,
        events: events ?? 0,
        rewardsIssued: issued ?? 0,
        rewardsClaimed: claimed ?? 0,
        rewardsRedeemed: redeemed ?? 0,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      ok: true,
      storage: "noop",
      campaignKey,
      detail: error instanceof Error ? error.message : "summary unavailable",
      metrics: {
        entries: 0,
        events: 0,
        rewardsIssued: 0,
        rewardsClaimed: 0,
        rewardsRedeemed: 0,
      },
    });
  }
}
