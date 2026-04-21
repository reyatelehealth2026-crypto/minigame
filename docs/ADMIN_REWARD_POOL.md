# Admin Reward Pool

Admin UI path:
- `/admin/pharmacy-plus/rewards`

API:
- `GET /api/pharmacy-plus/admin/reward-pool`
- `POST /api/pharmacy-plus/admin/reward-pool`

## How it works
- Admin edits the full reward pool in one page
- Save action replaces the campaign pool in one batch write
- Draw endpoint reads from active rewards in this pool using weight + stock checks
- If Supabase is missing, APIs fall back to built-in default items

## Fields
- `title`
- `detail`
- `tone`
- `couponPrefix`
- `weight` — higher means more likely to be drawn
- `stockTotal` — optional cap, null means unlimited
- `isActive`
