import { NextResponse } from "next/server";
import { CAMPAIGN_KEY, defaultRewardPool, type CampaignConfig } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let rewardTeasers = defaultRewardPool.map((item) => item.title);

  if (hasSupabaseAdmin()) {
    try {
      const db = supabaseAdmin();
      const { data } = await db
        .from("campaign_reward_pool")
        .select("reward_title")
        .eq("campaign_key", CAMPAIGN_KEY)
        .eq("is_active", true)
        .order("id", { ascending: true })
        .limit(3);
      if (data?.length) {
        rewardTeasers = data.map((row) => row.reward_title);
      }
    } catch {
      // fallback to defaults
    }
  }

  const body: CampaignConfig = {
    campaignKey: CAMPAIGN_KEY,
    campaignName: "ร้านยาพรัส Shake to Win",
    addFriendUrl: process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL ?? null,
    benefitBullets: [
      "เพิ่มเพื่อนแล้วเริ่มเล่นได้ทันที",
      "ทุกคนได้สิทธิ์คูปองอย่างน้อย 1 รางวัล",
      "มีลุ้นโบนัสเพิ่มเมื่อกลับมาเล่นรอบใหม่",
    ],
    rewardTeasers,
    branches: ["สาขาใกล้ฉัน", "สาขาในเมือง", "สาขาหน้าโรงพยาบาล"],
  };

  return NextResponse.json(body);
}
