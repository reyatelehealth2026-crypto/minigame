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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#03261C] text-sm text-[#C8C0A8]">
        กำลังเริ่มต้น LIFF...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#063A2A_0%,#03261C_100%)] p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-rose-300/40 bg-rose-500/10 p-6 text-rose-100 shadow-xl backdrop-blur">
          <div className="text-lg font-bold">LIFF Error</div>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#063A2A_0%,#03261C_100%)] p-6 text-[#F5EFE0]">
        <div className="w-full max-w-md rounded-[2rem] border border-[#D4AF7A]/40 bg-[#0A4632]/80 p-8 text-center shadow-[0_30px_80px_rgba(3,18,12,0.55)] backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[linear-gradient(180deg,#E8C994,#9C7A3F)] text-xl font-black text-[#1A2520]">PP</div>
          <div className="font-pp-display mt-4 text-2xl font-semibold">เข้าสู่ระบบด้วย LINE</div>
          <button
            onClick={login}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#E8C994_0%,#D4AF7A_55%,#9C7A3F_100%)] px-5 py-3 font-semibold text-[#1A2520] shadow-[0_16px_30px_rgba(212,175,122,0.4)] hover:brightness-105"
          >
            Login with LINE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#063A2A_0%,#03261C_100%)] text-[#F5EFE0]">
      <header className="sticky top-0 z-20 border-b border-[#D4AF7A]/20 bg-[#03261C]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-[#F5EFE0]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#E8C994,#9C7A3F)] text-xs font-black text-[#1A2520]">PP</span>
            <span className="font-pp-display text-base font-semibold">Pharmacy Plus</span>
          </Link>
          <div className="text-xs font-medium text-[#C8C0A8]">{profile?.displayName ?? "LINE User"}</div>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
    </div>
  );
}
