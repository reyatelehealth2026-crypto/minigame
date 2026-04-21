import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pharmacy Plus LIFF Acquisition",
  description: "Standalone LINE OA + LIFF acquisition MVP for ร้านยาพรัส",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.10),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_30%),linear-gradient(180deg,_#f8fffb_0%,_#ffffff_100%)] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
