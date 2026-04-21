"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LiffProvider, useLiff } from "@/components/LiffProvider";

export default function LiffLayout({ children }: { children: ReactNode }) {
  return (
    <LiffProvider>
      <Shell>{children}</Shell>
    </LiffProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { ready, error, loggedIn, login, profile } = useLiff();

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">กำลังเริ่มต้น LIFF...</div>;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-rose-200 bg-white p-6 shadow-xl">
          <div className="text-lg font-bold text-slate-950">LIFF Error</div>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500 text-xl font-black text-white">PP</div>
          <div className="mt-4 text-2xl font-black text-slate-950">เข้าสู่ระบบด้วย LINE</div>
          <button onClick={login} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600">
            Login with LINE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-xs font-black text-white">PP</span>
            <span>Pharmacy Plus</span>
          </Link>
          <div className="text-xs font-medium text-slate-500">{profile?.displayName ?? "LINE User"}</div>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
    </div>
  );
}
