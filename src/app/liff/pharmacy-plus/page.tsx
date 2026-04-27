"use client";

import { Suspense } from "react";
import GachaGame from "@/components/gacha/GachaGame";

export default function PharmacyPlusPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#C8C0A8]">Loading...</div>}>
      <GachaGame />
    </Suspense>
  );
}
