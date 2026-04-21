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

## Recommended next tasks
- connect real add-friend callback handling
- add analytics dashboard and source reporting
- replace seeded reward pool with admin-configured rewards
- add coupon redeem endpoint
