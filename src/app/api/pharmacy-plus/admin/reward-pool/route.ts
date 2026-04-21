import { NextRequest, NextResponse } from "next/server";
import { CAMPAIGN_KEY, defaultRewardPool, type RewardPoolItemInput } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePoolItem(item: RewardPoolItemInput): RewardPoolItemInput {
  return {
    title: item.title.trim(),
    detail: item.detail.trim(),
    tone: item.tone,
    couponPrefix: item.couponPrefix.trim(),
    weight: Math.max(1, Number(item.weight ?? 1)),
    stockTotal: item.stockTotal === null || item.stockTotal === undefined || item.stockTotal === "" ? null : Math.max(0, Number(item.stockTotal)),
    isActive: item.isActive ?? true,
  };
}

export async function GET(req: NextRequest) {
  const campaignKey = req.nextUrl.searchParams.get("campaignKey") ?? CAMPAIGN_KEY;

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, storage: "noop", campaignKey, items: defaultRewardPool });
  }

  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("campaign_reward_pool")
      .select("id, reward_title, reward_detail, reward_tone, coupon_code_prefix, weight, stock_total, stock_issued, is_active")
      .eq("campaign_key", campaignKey)
      .order("id", { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json({ ok: true, storage: error ? "noop" : "db", campaignKey, items: defaultRewardPool });
    }

    return NextResponse.json({
      ok: true,
      storage: "db",
      campaignKey,
      items: data.map((row) => ({
        id: row.id,
        title: row.reward_title,
        detail: row.reward_detail,
        tone: row.reward_tone,
        couponPrefix: row.coupon_code_prefix,
        weight: row.weight,
        stockTotal: row.stock_total,
        stockIssued: row.stock_issued,
        isActive: row.is_active,
      })),
    });
  } catch {
    return NextResponse.json({ ok: true, storage: "noop", campaignKey, items: defaultRewardPool });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const campaignKey = body?.campaignKey ?? CAMPAIGN_KEY;
  const items: RewardPoolItemInput[] = Array.isArray(body?.items) ? (body.items as RewardPoolItemInput[]) : [];

  if (!items.length) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }

  const normalized = items
    .map((item: RewardPoolItemInput) => normalizePoolItem(item))
    .filter((item: RewardPoolItemInput) => item.title && item.detail && item.couponPrefix);

  if (!normalized.length) {
    return NextResponse.json({ error: "no valid items" }, { status: 400 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, storage: "noop", campaignKey, items: normalized });
  }

  try {
    const db = supabaseAdmin();
    const { error: deleteError } = await db.from("campaign_reward_pool").delete().eq("campaign_key", campaignKey);
    if (deleteError) {
      return NextResponse.json({ ok: false, storage: "db", error: deleteError.message }, { status: 500 });
    }

    const { data, error } = await db
      .from("campaign_reward_pool")
      .insert(
        normalized.map((item: RewardPoolItemInput) => ({
          campaign_key: campaignKey,
          reward_title: item.title,
          reward_detail: item.detail,
          reward_tone: item.tone,
          coupon_code_prefix: item.couponPrefix,
          weight: item.weight ?? 1,
          stock_total: item.stockTotal,
          is_active: item.isActive ?? true,
        })),
      )
      .select("id, reward_title, reward_detail, reward_tone, coupon_code_prefix, weight, stock_total, stock_issued, is_active");

    if (error) {
      return NextResponse.json({ ok: false, storage: "db", error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      storage: "db",
      campaignKey,
      items: (data ?? []).map((row) => ({
        id: row.id,
        title: row.reward_title,
        detail: row.reward_detail,
        tone: row.reward_tone,
        couponPrefix: row.coupon_code_prefix,
        weight: row.weight,
        stockTotal: row.stock_total,
        stockIssued: row.stock_issued,
        isActive: row.is_active,
      })),
    });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, storage: "db", error: error instanceof Error ? error.message : "save unavailable" }, { status: 500 });
  }
}
