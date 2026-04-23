"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  DatabaseZap,
  Gift,
  Percent,
  RefreshCw,
  ScanLine,
  Settings2,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import { CAMPAIGN_KEY } from "@/lib/pharmacy-plus";

type SummaryResponse = {
  ok?: boolean;
  storage: "db" | "noop";
  asOf?: string;
  metrics: {
    entries: number;
    events: number;
    rewardsIssued: number;
    rewardsClaimed: number;
    rewardsRedeemed: number;
  };
  rates?: {
    claimRateFromIssued: number;
    redeemRateFromClaimed: number;
    redeemRateFromIssued: number;
  };
};

type ActivityEntry = {
  id: string | number;
  full_name: string | null;
  phone: string | null;
  branch: string | null;
  is_line_friend: boolean | null;
  created_at: string;
};

type ActivityReward = {
  id: string | number;
  title: string;
  detail: string | null;
  coupon_code: string;
  tone: string | null;
  status: string;
  created_at: string;
  claimed_at: string | null;
  redeemed_at: string | null;
  expires_at: string | null;
};

type ActivityResponse = {
  ok: boolean;
  storage: "db" | "noop";
  entries: ActivityEntry[];
  rewards: ActivityReward[];
};

function formatThaiDateTime(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MetricCard({ icon, label, value, detail, accent }: { icon: ReactNode; label: string; value: string | number; detail: string; accent?: string }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent ?? "bg-emerald-50 text-emerald-700"}`}>{icon}</div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{detail}</div>
    </div>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</div>
        <div className="mt-4 text-xl font-black tracking-tight text-slate-950">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
        {cta} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "redeemed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "claimed"
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : status === "expired" || status === "cancelled"
          ? "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${tone}`}>{status}</span>;
}

export default function PharmacyPlusAdminHubPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showPending = false) => {
    if (showPending) setRefreshing(true);
    try {
      const [summaryRes, activityRes] = await Promise.all([
        fetch(`/api/pharmacy-plus/report/summary?campaignKey=${CAMPAIGN_KEY}`, { cache: "no-store" }),
        fetch(`/api/pharmacy-plus/report/activity?campaignKey=${CAMPAIGN_KEY}&limit=15`, { cache: "no-store" }),
      ]);
      const [summaryData, activityData] = await Promise.all([summaryRes.json(), activityRes.json()]);
      setSummary(summaryData as SummaryResponse);
      setActivity(activityData as ActivityResponse);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const metrics = summary?.metrics;
  const rates = summary?.rates;
  const storageMode = summary?.storage ?? "noop";

  const statusBreakdown = useMemo(() => {
    const buckets: Record<string, number> = { issued: 0, claimed: 0, redeemed: 0, expired: 0, cancelled: 0 };
    for (const r of activity?.rewards ?? []) {
      buckets[r.status] = (buckets[r.status] ?? 0) + 1;
    }
    return buckets;
  }, [activity?.rewards]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faf8_0%,#eef7f2_100%)] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-[linear-gradient(135deg,#125b43_0%,#0f6d52_56%,#e5f6ee_56%,#f8fbf9_100%)] p-8 text-white sm:p-10">
              <div className="inline-flex rounded-full bg-[#efd9ad] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5d4a20]">Pharmacy+ Admin</div>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">ศูนย์จัดการแคมเปญ เขย่าบอลลุ้นโชค</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/82 sm:text-base">
                ดูสถานะผู้เล่น, จัดการรางวัล, และช่วยหน้าร้าน redeem คูปองได้จากจุดเดียว
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => void load(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : undefined} /> {refreshing ? "กำลังรีเฟรช..." : "รีเฟรชข้อมูล"}
                </button>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30">
                  <DatabaseZap size={16} /> Storage: {storageMode}
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30">
                  <Activity size={16} /> As of {formatThaiDateTime(summary?.asOf)}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard icon={<UserRound size={18} />} label="Entries" value={loading ? "..." : metrics?.entries ?? 0} detail="ลงทะเบียนเข้าเล่น" />
                <MetricCard icon={<Sparkles size={18} />} label="Rewards issued" value={loading ? "..." : metrics?.rewardsIssued ?? 0} detail="ระบบสุ่มรางวัลออกไปแล้ว" />
                <MetricCard icon={<Ticket size={18} />} label="Claimed" value={loading ? "..." : metrics?.rewardsClaimed ?? 0} detail="ลูกค้ากดรับสิทธิ์ใน LINE" accent="bg-sky-50 text-sky-700" />
                <MetricCard icon={<CheckCircle2 size={18} />} label="Redeemed" value={loading ? "..." : metrics?.rewardsRedeemed ?? 0} detail="พนักงานใช้สิทธิ์ที่หน้าร้าน" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <MetricCard icon={<Percent size={18} />} label="Claim rate" value={loading ? "..." : `${rates?.claimRateFromIssued ?? 0}%`} detail="จาก issued → claimed" accent="bg-orange-50 text-orange-700" />
                <MetricCard icon={<Percent size={18} />} label="Redeem rate" value={loading ? "..." : `${rates?.redeemRateFromClaimed ?? 0}%`} detail="จาก claimed → redeemed" accent="bg-emerald-50 text-emerald-700" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ShortcutCard
            href="/admin/pharmacy-plus/rewards"
            icon={<Gift size={20} />}
            title="จัดการรางวัล"
            description="เพิ่ม/แก้ไข reward pool, ปรับ weight และสต๊อกคูปองที่ระบบจะสุ่มให้ลูกค้า"
            cta="เปิดหน้า reward pool"
          />
          <ShortcutCard
            href="/admin/pharmacy-plus/redeem"
            icon={<ScanLine size={20} />}
            title="สแกน/ใช้สิทธิ์คูปอง"
            description="พนักงานหน้าร้านใส่หรือสแกน coupon code เพื่อเปลี่ยนสถานะเป็น redeemed"
            cta="เปิดหน้า redeem"
          />
          <ShortcutCard
            href="/admin/pharmacy-plus/rewards#stats"
            icon={<Settings2 size={20} />}
            title="ปรับ distribution"
            description="ดูน้ำหนักรางวัลและสต๊อกที่จำกัด, ใช้เทสต์ก่อนเปิดให้ผู้ใช้จริง"
            cta="ปรับ distribution"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Recent activity</div>
                <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">ผู้เล่นและรางวัลล่าสุด</div>
                <div className="mt-1 text-sm text-slate-600">อัปเดตตามลำดับเวลา ทั้งด้าน entry และ reward</div>
              </div>
              <BarChart3 size={22} className="text-emerald-700" />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-5">
              {(["issued", "claimed", "redeemed", "expired", "cancelled"] as const).map((status) => (
                <div key={status} className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{status}</div>
                  <div className="mt-0.5 text-lg font-black text-slate-950">{statusBreakdown[status] ?? 0}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>
              ) : (activity?.rewards ?? []).length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  {storageMode === "noop"
                    ? "ยังไม่ได้ต่อ Supabase, หน้านี้จะเริ่มมีข้อมูลทันทีที่ env ครบและผู้ใช้เข้าเล่น"
                    : "ยังไม่มี reward ถูกสุ่มออกไป"}
                </div>
              ) : (
                (activity?.rewards ?? []).map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-black text-slate-950">{r.title}</div>
                          <StatusPill status={r.status} />
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">{r.detail}</div>
                        <div className="mt-1 text-xs font-mono tracking-widest text-slate-800">{r.coupon_code}</div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-slate-500">
                        <div>ออก {formatThaiDateTime(r.created_at)}</div>
                        {r.claimed_at ? <div>คลิก {formatThaiDateTime(r.claimed_at)}</div> : null}
                        {r.redeemed_at ? <div>ใช้ {formatThaiDateTime(r.redeemed_at)}</div> : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Latest entries</div>
                <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">คนที่เพิ่งลงทะเบียน</div>
                <div className="mt-1 text-sm text-slate-600">ดูชื่อ สาขา และสถานะเพิ่มเพื่อน LINE ของผู้เล่นล่าสุด</div>
              </div>
              <UserRound size={22} className="text-emerald-700" />
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>
              ) : (activity?.entries ?? []).length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  {storageMode === "noop" ? "ยังไม่มีข้อมูลในโหมด fallback" : "ยังไม่มีผู้เล่นลงทะเบียน"}
                </div>
              ) : (
                (activity?.entries ?? []).map((e) => (
                  <div key={e.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-950">{e.full_name || "(ไม่ระบุชื่อ)"}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {e.branch || "สาขาใกล้ฉัน"}{e.phone ? ` · ${e.phone}` : ""}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs">
                        <div className="text-slate-500">{formatThaiDateTime(e.created_at)}</div>
                        <div className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${e.is_line_friend ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                          {e.is_line_friend ? "เพื่อน LINE แล้ว" : "ยังไม่เพิ่มเพื่อน"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {storageMode === "noop" ? (
          <section className="rounded-[1.8rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
            <div className="font-bold">โหมด fallback</div>
            <div className="mt-1">
              ยังไม่ได้ตั้งค่า Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY), ระบบทำงานได้แต่ข้อมูลจะยังไม่ถูกบันทึกลง DB จริง.
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
