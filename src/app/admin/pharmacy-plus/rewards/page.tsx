"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Activity, BarChart3, CheckCircle2, DatabaseZap, Gift, Percent, RefreshCw, Save, Sparkles, Ticket, ToggleLeft, Trash2 } from "lucide-react";
import { CAMPAIGN_KEY, defaultRewardPool, type RewardPoolItemInput, type RewardTone } from "@/lib/pharmacy-plus";

type SummaryResponse = {
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

function emptyRow(): RewardPoolItemInput {
  return { title: "", detail: "", tone: "peach", couponPrefix: "PP", weight: 1, stockTotal: null, isActive: true };
}

function formatThaiDateTime(date?: string) {
  if (!date) return "ยังไม่มี snapshot";
  return new Date(date).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTonePreviewClasses(tone: RewardTone) {
  switch (tone) {
    case "green":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "blue":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-orange-200 bg-orange-50 text-orange-700";
  }
}

function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{detail}</div>
    </div>
  );
}

function TicketPreview({ item }: { item: RewardPoolItemInput }) {
  const stockLeft = typeof item.stockTotal === "number" ? Math.max(0, item.stockTotal - (item.stockIssued ?? 0)) : null;

  return (
    <div className={`rounded-[1.75rem] border p-4 shadow-sm ${getTonePreviewClasses(item.tone)}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">Reward Preview</div>
      <div className="mt-2 text-lg font-black leading-tight">{item.title || "ชื่อรางวัล"}</div>
      <div className="mt-1 text-sm opacity-90">{item.detail || "รายละเอียดรางวัลจะขึ้นตรงนี้"}</div>
      <div className="mt-4 rounded-2xl bg-white/75 px-4 py-3 text-center text-xs font-black tracking-[0.16em] text-slate-900">
        {(item.couponPrefix || "PP") + "-XXXXXX"}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span>weight {Math.max(1, Number(item.weight ?? 1))}</span>
        <span>{stockLeft == null ? "ไม่จำกัด" : `เหลือ ${stockLeft}`}</span>
      </div>
    </div>
  );
}

export default function PharmacyPlusRewardsAdminPage() {
  const [items, setItems] = useState<RewardPoolItemInput[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSummary = useCallback(async (showPending = true) => {
    if (showPending) setSummaryLoading(true);
    try {
      const res = await fetch(`/api/pharmacy-plus/report/summary?campaignKey=${CAMPAIGN_KEY}`, { cache: "no-store" });
      const data = (await res.json()) as SummaryResponse;
      setSummary(data);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [poolRes, summaryRes] = await Promise.all([
          fetch(`/api/pharmacy-plus/admin/reward-pool?campaignKey=${CAMPAIGN_KEY}`, { cache: "no-store" }),
          fetch(`/api/pharmacy-plus/report/summary?campaignKey=${CAMPAIGN_KEY}`, { cache: "no-store" }),
        ]);
        const [poolData, summaryData] = await Promise.all([poolRes.json(), summaryRes.json()]);
        if (!active) return;
        setItems((poolData?.items as RewardPoolItemInput[] | undefined) ?? defaultRewardPool);
        setSummary(summaryData as SummaryResponse);
      } finally {
        if (!active) return;
        setLoading(false);
        setSummaryLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const updateItem = (index: number, patch: Partial<RewardPoolItemInput>) => {
    setItems((current) => current.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const activeItems = useMemo(() => items.filter((item) => item.isActive ?? true), [items]);
  const activeWeight = useMemo(() => activeItems.reduce((sum, item) => sum + Math.max(1, Number(item.weight ?? 1)), 0), [activeItems]);
  const finiteStockItems = useMemo(() => items.filter((item) => typeof item.stockTotal === "number"), [items]);
  const invalidItems = useMemo(() => items.filter((item) => !item.title.trim() || !item.detail.trim() || !item.couponPrefix.trim()), [items]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pharmacy-plus/admin/reward-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignKey: CAMPAIGN_KEY, items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setItems((data?.items as RewardPoolItemInput[] | undefined) ?? items);
      setMessage(data?.storage === "db" ? "บันทึก reward pool แล้ว" : "บันทึกแบบ fallback, ยังไม่ได้ลง DB จริง");
      await loadSummary();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faf8_0%,#eef7f2_100%)] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-[linear-gradient(135deg,#125b43_0%,#0f6d52_56%,#e5f6ee_56%,#f8fbf9_100%)] p-8 text-white sm:p-10">
              <div className="inline-flex rounded-full bg-[#efd9ad] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5d4a20]">Admin reward pool</div>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">ตั้งค่ารางวัลแคมเปญ Pharmacy Plus</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/82 sm:text-base">
                หน้า admin นี้ต้องเป็นคู่ตรงข้ามของ campaign board, คือชัด, ควบคุมง่าย, และเห็นทั้งสต๊อกรางวัลกับ funnel snapshot ในจอเดียว.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricCard icon={<Gift size={18} />} label="Active rewards" value={loading ? "..." : activeItems.length} detail="จำนวน reward ที่พร้อมสุ่มใช้งาน" />
                <MetricCard icon={<Activity size={18} />} label="Weight total" value={loading ? "..." : activeWeight} detail="เอาไว้เช็ก distribution แบบไว ๆ" />
                <MetricCard icon={<Ticket size={18} />} label="Finite stock" value={loading ? "..." : finiteStockItems.length} detail="รางวัลที่มี stock จำกัด" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard icon={<BarChart3 size={18} />} label="Entries" value={summaryLoading ? "..." : summary?.metrics.entries ?? 0} detail="จำนวนคนที่เริ่มเข้าระบบ" />
                <MetricCard icon={<Sparkles size={18} />} label="Issued" value={summaryLoading ? "..." : summary?.metrics.rewardsIssued ?? 0} detail="รางวัลที่ระบบปล่อยออกไป" />
                <MetricCard icon={<CheckCircle2 size={18} />} label="Redeemed" value={summaryLoading ? "..." : summary?.metrics.rewardsRedeemed ?? 0} detail="คูปองที่ถูกใช้สิทธิ์แล้ว" />
                <MetricCard icon={<Percent size={18} />} label="Claim rate" value={summaryLoading ? "..." : `${summary?.rates?.claimRateFromIssued ?? 0}%`} detail="จาก issued → claimed" />
                <MetricCard icon={<Percent size={18} />} label="Redeem rate" value={summaryLoading ? "..." : `${summary?.rates?.redeemRateFromClaimed ?? 0}%`} detail="จาก claimed → redeemed" />
                <MetricCard icon={<DatabaseZap size={18} />} label="Storage" value={summaryLoading ? "..." : summary?.storage ?? "noop"} detail={formatThaiDateTime(summary?.asOf)} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Control panel</div>
                  <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">จัดการ reward pool</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">แต่ละรายการควรดูเป็น coupon จริง ไม่ใช่แค่แถวในฐานข้อมูล</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void loadSummary()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <RefreshCw size={16} /> รีเฟรชสถิติ
                  </button>
                  <button
                    onClick={() => setItems(defaultRewardPool)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <ToggleLeft size={16} /> โหลดค่าเริ่มต้น
                  </button>
                  <button
                    onClick={() => setItems((current) => [...current, emptyRow()])}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <Gift size={16} /> เพิ่มรางวัล
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || loading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Save size={16} /> {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
                  </button>
                </div>
              </div>

              {message ? <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</div> : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">รางวัลทั้งหมด <span className="font-bold text-slate-950">{items.length}</span></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">รางวัลที่ active <span className="font-bold text-slate-950">{activeItems.length}</span></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">น้ำหนักรวม <span className="font-bold text-slate-950">{activeWeight}</span></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">stock จำกัด <span className="font-bold text-slate-950">{finiteStockItems.length}</span></div>
              </div>

              {invalidItems.length ? (
                <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  มี {invalidItems.length} แถวที่ข้อมูลยังไม่ครบ, ต้องมี title, detail และ coupon prefix ก่อนถึงจะบันทึกได้
                </div>
              ) : null}

              {summary?.storage === "noop" ? (
                <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                  ตอนนี้ระบบยังเป็น fallback mode, หน้า admin ใช้จัด flow ได้แต่ข้อมูลยังไม่ลง DB จริงจนกว่า Supabase env/schema จะพร้อม
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Preview board</div>
              <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">ตัวอย่างรางวัลที่กำลังจะสุ่ม</div>
              <div className="mt-2 text-sm leading-6 text-slate-600">มุมนี้ไว้เช็กว่าภาษากับน้ำหนักรางวัลยังดูเป็น product จริง ไม่ใช่แค่ config table</div>

              <div className="mt-5 space-y-4">
                {(activeItems.length ? activeItems : items).slice(0, 3).map((item, index) => (
                  <TicketPreview key={`${item.title}-${index}`} item={item} />
                ))}
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Reward rows</div>
              <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">ปรับแต่ละรางวัลแบบเห็นภาพ</div>
              <div className="mt-2 text-sm leading-6 text-slate-600">หนึ่ง row = หนึ่ง reward item ที่ระบบมีสิทธิ์สุ่มออกไป</div>
            </div>

            {loading ? (
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">กำลังโหลด reward pool...</div>
            ) : (
              <div className="mt-5 space-y-4">
                {items.map((item, index) => {
                  const stockLeft = typeof item.stockTotal === "number" ? Math.max(0, item.stockTotal - (item.stockIssued ?? 0)) : null;
                  return (
                    <div key={index} className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfa_100%)] p-4 shadow-sm">
                      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Title</div>
                              <input
                                value={item.title}
                                onChange={(e) => updateItem(index, { title: e.target.value })}
                                placeholder="ชื่อรางวัล"
                                className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                              />
                            </label>
                            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Detail</div>
                              <input
                                value={item.detail}
                                onChange={(e) => updateItem(index, { detail: e.target.value })}
                                placeholder="รายละเอียด"
                                className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                              />
                            </label>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-4">
                            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Tone</div>
                              <select
                                value={item.tone}
                                onChange={(e) => updateItem(index, { tone: e.target.value as RewardTone })}
                                className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
                              >
                                <option value="peach">peach</option>
                                <option value="green">green</option>
                                <option value="blue">blue</option>
                              </select>
                            </label>
                            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Prefix</div>
                              <input
                                value={item.couponPrefix}
                                onChange={(e) => updateItem(index, { couponPrefix: e.target.value.toUpperCase() })}
                                placeholder="PP30"
                                className="mt-2 w-full bg-transparent text-base font-semibold uppercase text-slate-950 outline-none placeholder:text-slate-400"
                              />
                            </label>
                            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Weight</div>
                              <input
                                type="number"
                                min={1}
                                value={item.weight ?? 1}
                                onChange={(e) => updateItem(index, { weight: Number(e.target.value || 1) })}
                                className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
                              />
                            </label>
                            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Stock</div>
                              <input
                                type="number"
                                min={0}
                                value={item.stockTotal ?? ""}
                                onChange={(e) => updateItem(index, { stockTotal: e.target.value === "" ? null : Number(e.target.value) })}
                                placeholder="ไม่จำกัด"
                                className="mt-2 w-full bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                              />
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <label className="inline-flex items-center gap-2 font-medium text-slate-800">
                              <input
                                type="checkbox"
                                checked={item.isActive ?? true}
                                onChange={(e) => updateItem(index, { isActive: e.target.checked })}
                              />
                              เปิดใช้งาน reward นี้
                            </label>
                            <div className="text-xs text-slate-500">
                              {item.stockIssued ? `แจกไปแล้ว ${item.stockIssued} สิทธิ์` : "ยังไม่มีการแจก"}
                              {stockLeft == null ? " · ไม่จำกัดจำนวน" : ` · เหลือประมาณ ${stockLeft}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between gap-4">
                          <TicketPreview item={item} />
                          <button
                            onClick={() => setItems((current) => current.filter((_, idx) => idx !== index))}
                            disabled={items.length === 1}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            <Trash2 size={16} /> ลบรางวัลนี้
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}
