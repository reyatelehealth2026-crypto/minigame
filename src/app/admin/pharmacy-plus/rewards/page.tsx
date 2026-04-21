"use client";

import { useEffect, useState } from "react";
import { CAMPAIGN_KEY, defaultRewardPool, type RewardPoolItemInput, type RewardTone } from "@/lib/pharmacy-plus";

function emptyRow(): RewardPoolItemInput {
  return { title: "", detail: "", tone: "peach", couponPrefix: "PP", weight: 1, stockTotal: null, isActive: true };
}

export default function PharmacyPlusRewardsAdminPage() {
  const [items, setItems] = useState<RewardPoolItemInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/pharmacy-plus/admin/reward-pool?campaignKey=${CAMPAIGN_KEY}`, { cache: "no-store" });
      const data = await res.json();
      setItems((data?.items as RewardPoolItemInput[] | undefined) ?? defaultRewardPool);
      setLoading(false);
    })();
  }, []);

  const updateItem = (index: number, patch: Partial<RewardPoolItemInput>) => {
    setItems((current) => current.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

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
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">โทน UI นี้ตั้งใจให้ใช้งานง่ายแบบ Stripe Admin, เน้นแก้ไข reward ได้เป็นก้อนเดียวแล้วบันทึกทีเดียว ไม่ต้องไล่แก้ทีละ API.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_60px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">Reward items</h2>
              <p className="text-sm text-slate-500">หนึ่ง row = หนึ่งรางวัลที่ระบบมีสิทธิ์สุ่มให้</p>
            </div>
            <div className="flex gap-2">
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
                  <div className="md:col-span-10 text-xs text-slate-400">
                    {item.stockIssued ? `แจกไปแล้ว ${item.stockIssued} สิทธิ์` : "ยังไม่มีการแจก"}
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={() => setItems((current) => current.filter((_, idx) => idx !== index))}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
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
