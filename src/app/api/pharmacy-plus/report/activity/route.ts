import { NextRequest, NextResponse } from "next/server";
import { CAMPAIGN_KEY } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const campaignKey = req.nextUrl.searchParams.get("campaignKey") ?? CAMPAIGN_KEY;
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 100);

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({
      ok: true,
      storage: "noop",
      campaignKey,
      entries: [],
      rewards: [],
    });
  }

  try {
    const db = supabaseAdmin();
    const [entriesRes, rewardsRes] = await Promise.all([
      db
        .from("campaign_entries")
        .select("id, full_name, phone, branch, is_line_friend, created_at")
        .eq("campaign_key", campaignKey)
        .order("created_at", { ascending: false })
        .limit(limit),
      db
        .from("campaign_rewards")
        .select("id, title, detail, coupon_code, tone, status, created_at, claimed_at, redeemed_at, expires_at")
        .eq("campaign_key", campaignKey)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    return NextResponse.json({
      ok: true,
      storage: "db",
      campaignKey,
      entries: entriesRes.data ?? [],
      rewards: rewardsRes.data ?? [],
    });
  } catch (error: unknown) {
    return NextResponse.json({
      ok: true,
      storage: "noop",
      campaignKey,
      detail: error instanceof Error ? error.message : "activity unavailable",
      entries: [],
      rewards: [],
    });
  }
}
