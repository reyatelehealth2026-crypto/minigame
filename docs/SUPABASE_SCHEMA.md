# Supabase Schema

Run the SQL in:
- `supabase/migrations/001_campaign_core.sql`

## Tables
### `campaign_entries`
Stores minimal registration data per campaign session.

### `campaign_events`
Append-only event stream for funnel analytics.

### `campaign_reward_pool`
Stores admin-managed reward definitions, including weight, stock cap, and active state.

### `campaign_rewards`
Stores the issued reward or coupon for each campaign session.

## Notes
- current MVP uses one reward per session
- reward status transitions: `issued -> claimed -> redeemed`
- API degrades gracefully when Supabase env is not configured or migration is not yet applied

## Required env
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
