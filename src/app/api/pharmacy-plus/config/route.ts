import { NextResponse } from "next/server";
import { CAMPAIGN_KEY, type CampaignConfig } from "@/lib/pharmacy-plus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const body: CampaignConfig = {
    campaignKey: CAMPAIGN_KEY,
    campaignName: "ร้านยาพรัส Shake to Win",
    addFriendUrl: process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL ?? null,
    benefitBullets: [
      "เพิ่มเพื่อนแล้วเริ่มเล่นได้ทันที",
      "ทุกคนได้สิทธิ์คูปองอย่างน้อย 1 รางวัล",
      "มีลุ้นโบนัสเพิ่มเมื่อกลับมาเล่นรอบใหม่",
    ],
    rewardTeasers: ["คูปองลด 30 บาท", "คูปองลด 50 บาท", "ของแถมสุขภาพหน้าร้าน"],
    branches: ["สาขาใกล้ฉัน", "สาขาในเมือง", "สาขาหน้าโรงพยาบาล"],
  };

  return NextResponse.json(body);
}
