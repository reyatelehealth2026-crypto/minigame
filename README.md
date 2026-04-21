# Pharmacy Plus LIFF Acquisition

Standalone project for ร้านยาพรัส acquisition MVP.

This project is intentionally separate from LineBook/LINEX.

## Goal
Use LINE OA + LIFF to increase LINE OA friends through a mobile-first campaign flow:
- landing
- short registration
- shake-to-win interaction
- reward reveal
- add friend unlock gate
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
- `src/app/api/pharmacy-plus/*` — campaign + reward + reporting endpoints
- `src/app/admin/pharmacy-plus/rewards/page.tsx` — admin reward pool editor
- `docs/` — project docs and setup notes

## Environment
Create `.env.local` with:

```bash
NEXT_PUBLIC_LIFF_ID=your_liff_id
NEXT_PUBLIC_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/your_oa
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Scripts
```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Admin UI
- Reward pool editor: `/admin/pharmacy-plus/rewards`
- Staff redeem page: `/admin/pharmacy-plus/redeem`
- Campaign summary snapshot is shown on the reward admin page

## Validation / reporting
- Summary endpoint: `/api/pharmacy-plus/report/summary?campaignKey=pharmacy-plus-shake-to-win`
- Returns top-level funnel counts plus simple claim/redeem rates
- Works in graceful fallback mode with `storage: "noop"` when DB is not ready

## Smoke test
1. Open `/liff/pharmacy-plus`
2. Submit registration
3. Play the game and receive a reward
4. If not a friend yet, go through add-friend unlock
5. Claim reward into wallet
6. Copy or show coupon code from wallet
7. Open `/admin/pharmacy-plus/redeem` and redeem by coupon code
8. Open `/api/pharmacy-plus/report/summary?campaignKey=pharmacy-plus-shake-to-win` and confirm counts increased

## Notes
This project now supports Supabase-backed campaign flow with graceful fallback when env/schema are missing. Current next steps after Sprint 1:
1. add analytics dashboard page
2. add campaign copy/config editor
3. add branch/source breakdown reporting
4. harden reward stock concurrency if traffic becomes high
