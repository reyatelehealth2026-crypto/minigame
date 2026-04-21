# Pharmacy Plus LIFF Acquisition

Standalone project for ร้านยาพรัส acquisition MVP.

This project is intentionally separate from LineBook/LINEX.

## Goal
Use LINE OA + LIFF to increase LINE OA friends through a mobile-first campaign flow:
- landing
- add friend gate
- short registration
- shake-to-win interaction
- reward reveal
- coupon wallet
- success / return CTA

## Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- LIFF SDK
- Framer Motion
- Lottie React
- canvas-confetti

## Current scaffold
- `src/app/liff/pharmacy-plus/page.tsx` — LIFF campaign MVP screen flow
- `src/components/LiffProvider.tsx` — LIFF context provider
- `src/lib/pharmacy-plus.ts` — campaign constants, types, helpers
- `src/app/api/pharmacy-plus/*` — mock config/events/entry endpoints
- `docs/` — project docs and setup notes

## Environment
Create `.env.local` with:

```bash
NEXT_PUBLIC_LIFF_ID=your_liff_id
NEXT_PUBLIC_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/your_oa
```

## Scripts
```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Notes
This scaffold currently uses mock campaign responses for rapid product iteration. Next steps:
1. wire Supabase
2. add reward draw/claim persistence
3. add analytics dashboard
4. add admin config for campaign copy and reward pool
