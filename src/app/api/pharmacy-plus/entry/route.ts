import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body?.campaignKey || !body?.fullName) {
    return NextResponse.json({ error: "campaignKey and fullName required" }, { status: 400 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, entry: body, storage: "noop" });
  }

  try {
    const db = supabaseAdmin();
    const sessionId = body.sessionId ?? crypto.randomUUID();
    const { error } = await db.from("campaign_entries").upsert(
      {
        campaign_key: body.campaignKey,
        session_id: sessionId,
        line_user_id: body.lineUserId ?? null,
        display_name: body.displayName ?? null,
        full_name: body.fullName,
        phone: body.phone ?? null,
        branch: body.branch ?? null,
        is_line_friend: body.isLineFriend ?? false,
        source: body.source ?? {},
      },
      { onConflict: "campaign_key,session_id" },
    );

    if (error) {
      return NextResponse.json({ ok: true, entry: { ...body, sessionId }, storage: "noop", detail: error.message });
    }

    return NextResponse.json({ ok: true, entry: { ...body, sessionId }, storage: "db" });
  } catch (error: unknown) {
    return NextResponse.json({ ok: true, entry: body, storage: "noop", detail: error instanceof Error ? error.message : "unavailable" });
  }
}
