# Setup

## 1. Install
```bash
npm install
```

## 2. Configure env
Create `.env.local`:

```bash
NEXT_PUBLIC_LIFF_ID=your_liff_id
NEXT_PUBLIC_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/your_oa
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 3. Run dev server
```bash
npm run dev
```

## 4. Open key routes
- `/`
- `/liff/pharmacy-plus`

## Database
Run `supabase/migrations/001_campaign_core.sql` in Supabase SQL Editor before expecting DB persistence.

## Manual smoke test
1. Open `/liff/pharmacy-plus`
2. Confirm landing loads reward teasers from config
3. Fill registration form and submit
4. Trigger game draw and confirm reward reveal appears
5. If not a LINE OA friend, go through add-friend unlock and come back
6. Claim reward and confirm wallet shows coupon code + expiry
7. Redeem reward and confirm success screen
8. Open `/api/pharmacy-plus/report/summary?campaignKey=pharmacy-plus-shake-to-win`
9. Confirm `entries`, `events`, `rewardsIssued`, `rewardsClaimed`, `rewardsRedeemed` move as expected
10. Open `/admin/pharmacy-plus/rewards` and confirm reward pool + summary snapshot render correctly

## Fallback behavior
- If Supabase env or schema is missing, campaign APIs should keep working with `storage: "noop"`
- Admin reward editor still works in fallback mode, but changes are not persisted to DB

## Recommended next tasks
- connect real add-friend callback handling
- add analytics dashboard and source reporting
- add branch/source breakdown in summary
- add stronger stock concurrency protection for high traffic
