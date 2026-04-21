"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const invalidItems = useMemo(
    () => items.filter((item) => !item.title.trim() || !item.detail.trim() || !item.couponPrefix.trim()),
    [items],
  );

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
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Admin reward pool</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">ตั้งค่ารางวัลแคมเปญ Pharmacy Plus</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">โทนนี้ตั้งใจให้ดูเหมือน admin ที่ใช้งานจริง, ไม่ใช่แค่ฟอร์มดิบ. เห็นทั้ง reward pool และสถานะแคมเปญในหน้าเดียว.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {[
            { label: "Entries", value: summary?.metrics.entries ?? 0 },
            { label: "Events", value: summary?.metrics.events ?? 0 },
            { label: "Issued", value: summary?.metrics.rewardsIssued ?? 0 },
            { label: "Claimed", value: summary?.metrics.rewardsClaimed ?? 0 },
            { label: "Redeemed", value: summary?.metrics.rewardsRedeemed ?? 0 },
          ].map((card) => (
            <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{card.label}</div>
              <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{summaryLoading ? "..." : card.value}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Claim rate</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">{summaryLoading ? "..." : `${summary?.rates?.claimRateFromIssued ?? 0}%`}</div>
            <p className="mt-2 text-sm text-slate-500">จาก issued → claimed</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Redeem rate</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">{summaryLoading ? "..." : `${summary?.rates?.redeemRateFromClaimed ?? 0}%`}</div>
            <p className="mt-2 text-sm text-slate-500">จาก claimed → redeemed</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Storage mode</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">{summaryLoading ? "..." : summary?.storage ?? "noop"}</div>
            <p className="mt-2 text-sm text-slate-500">
              {summary?.asOf ? `อัปเดต ${new Date(summary.asOf).toLocaleString("th-TH")}` : "ยังไม่มี snapshot"}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">Reward items</h2>
              <p className="text-sm text-slate-500">หนึ่ง row = หนึ่งรางวัลที่ระบบมีสิทธิ์สุ่มให้</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void loadSummary()}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                รีเฟรชสถิติ
              </button>
              <button
                onClick={() => setItems(defaultRewardPool)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                โหลดค่าเริ่มต้น
              </button>
              <button
                onClick={() => setItems((current) => [...current, emptyRow()])}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                เพิ่มรางวัล
              </button>
              <button
                onClick={save}
                disabled={saving || loading}
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
              </button>
            </div>
          </div>

          {message ? <div className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</div> : null}

          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              รางวัลทั้งหมด <span className="font-bold text-slate-950">{items.length}</span>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              รางวัลที่ active <span className="font-bold text-slate-950">{activeItems.length}</span>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              น้ำหนักรวม <span className="font-bold text-slate-950">{activeWeight}</span>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              รางวัล stock จำกัด <span className="font-bold text-slate-950">{finiteStockItems.length}</span>
            </div>
          </div>

          {invalidItems.length ? (
            <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              มี {invalidItems.length} แถวที่ข้อมูลยังไม่ครบ, ระบบจะไม่บันทึกแถวนั้นจนกว่าจะมี title, detail, และ coupon prefix ครบ
            </div>
          ) : null}

          {summary?.storage === "noop" ? (
            <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              ตอนนี้ระบบอยู่ในโหมด fallback, หน้า admin ยังใช้งานได้แต่ summary และ reward pool ยังไม่ลง DB จริงจนกว่า Supabase env/schema จะพร้อม
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">กำลังโหลด reward pool...</div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid gap-3 rounded-[1.5rem] border border-slate-200 p-4 md:grid-cols-12">
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    placeholder="ชื่อรางวัล"
                    className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-3"
                  />
                  <input
                    value={item.detail}
                    onChange={(e) => updateItem(index, { detail: e.target.value })}
                    placeholder="รายละเอียด"
                    className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-4"
                  />
                  <select
                    value={item.tone}
                    onChange={(e) => updateItem(index, { tone: e.target.value as RewardTone })}
                    className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                  >
                    <option value="peach">peach</option>
                    <option value="green">green</option>
                    <option value="blue">blue</option>
                  </select>
                  <input
                    value={item.couponPrefix}
                    onChange={(e) => updateItem(index, { couponPrefix: e.target.value.toUpperCase() })}
                    placeholder="Prefix"
                    className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-1"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.weight ?? 1}
                    onChange={(e) => updateItem(index, { weight: Number(e.target.value || 1) })}
                    placeholder="Weight"
                    className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-1"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.stockTotal ?? ""}
                    onChange={(e) => updateItem(index, { stockTotal: e.target.value === "" ? null : Number(e.target.value) })}
                    placeholder="Stock"
                    className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-1"
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-600 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={item.isActive ?? true}
                      onChange={(e) => updateItem(index, { isActive: e.target.checked })}
                    />
                    เปิดใช้งาน
                  </label>
                  <div className="text-xs text-slate-400 md:col-span-10">
                    {item.stockIssued ? `แจกไปแล้ว ${item.stockIssued} สิทธิ์` : "ยังไม่มีการแจก"}
                    {typeof item.stockTotal === "number" ? ` · เหลือประมาณ ${Math.max(0, item.stockTotal - (item.stockIssued ?? 0))}` : " · ไม่จำกัดจำนวน"}
                  </div>
                  <div className="flex justify-end md:col-span-2">
                    <button
                      onClick={() => setItems((current) => current.filter((_, idx) => idx !== index))}
                      disabled={items.length === 1}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
