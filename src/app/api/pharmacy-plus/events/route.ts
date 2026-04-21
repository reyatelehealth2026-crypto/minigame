import { NextRequest, NextResponse } from "next/server";
import { CAMPAIGN_EVENT_NAMES, type CampaignEventPayload } from "@/lib/pharmacy-plus";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CampaignEventPayload;

  if (!body?.campaignKey || !body?.sessionId || !body?.eventName || !body?.step) {
    return NextResponse.json({ error: "campaignKey, eventName, and step required" }, { status: 400 });
  }

  if (!CAMPAIGN_EVENT_NAMES.includes(body.eventName)) {
    return NextResponse.json({ error: `invalid eventName: ${body.eventName}` }, { status: 400 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, received: body, storage: "noop" });
  }

  try {
    const db = supabaseAdmin();
    const { error } = await db.from("campaign_events").insert({
      campaign_key: body.campaignKey,
      session_id: body.sessionId ?? null,
      line_user_id: body.lineUserId ?? null,
      event_name: body.eventName,
      step: body.step,
      source: body.source ?? {},
      payload: body.payload ?? {},
    });

    if (error) {
      return NextResponse.json({ ok: true, received: body, storage: "noop", detail: error.message });
    }

    return NextResponse.json({ ok: true, storage: "db" });
  } catch (error: unknown) {
    return NextResponse.json({ ok: true, received: body, storage: "noop", detail: error instanceof Error ? error.message : "unavailable" });
  }
}
