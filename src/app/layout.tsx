import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const displaySerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-pp-display",
  display: "swap",
});

const bodyThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pp-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pharmacy Plus LIFF Acquisition",
  description: "Standalone LINE OA + LIFF acquisition MVP for ร้านยาพรัส",
};

const SUPPRESS_EXT_NOISE = `
(function(){
  var noisy = /message channel closed before a response was received/i;
  var origError = console.error;
  console.error = function(){
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      if (typeof a === 'string' && noisy.test(a)) return;
      if (a && a.message && noisy.test(a.message)) return;
    }
    return origError.apply(console, arguments);
  };
  window.addEventListener('error', function(e){
    if (e && e.message && noisy.test(e.message)) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    var msg = e && e.reason && (e.reason.message || String(e.reason));
    if (msg && noisy.test(msg)) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`h-full ${displaySerif.variable} ${bodyThai.variable}`}>
      <body className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.10),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_30%),linear-gradient(180deg,_#f8fffb_0%,_#ffffff_100%)] font-[var(--font-pp-body)] text-slate-900 antialiased">
        <Script id="suppress-ext-noise" strategy="beforeInteractive">{SUPPRESS_EXT_NOISE}</Script>
        {children}
      </body>
    </html>
  );
}
