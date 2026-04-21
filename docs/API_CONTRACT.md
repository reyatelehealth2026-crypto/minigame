# API Contract

## GET `/api/pharmacy-plus/config`
Returns campaign UI metadata.

## GET `/api/pharmacy-plus/admin/reward-pool`
Returns the editable reward pool for the campaign.

## POST `/api/pharmacy-plus/admin/reward-pool`
Replaces the full reward pool for the campaign in one batch write.

## POST `/api/pharmacy-plus/events`
Stores analytics events.

Canonical Sprint 1 event names:
- `campaign_view`
- `add_friend_click`
- `add_friend_success`
- `registration_start`
- `registration_submit`
- `game_start`
- `game_complete`
- `reward_reveal`
- `reward_claim_click`
- `wallet_view`
- `success_view`
- `coupon_redeem_click`

Request example:
```json
{
  "campaignKey": "pharmacy-plus-shake-to-win",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "eventName": "registration_submit",
  "step": "register",
  "lineUserId": "Uxxx",
  "source": {
    "source": "qr",
    "medium": "offline-poster",
    "campaign": "launch-april",
    "branch": "สาขาใกล้ฉัน",
    "qrId": "counter-01"
  },
  "payload": {"branch":"สาขาใกล้ฉัน"}
}
```

## POST `/api/pharmacy-plus/entry`
Stores registration entry for the campaign.

Request fields:
- `campaignKey`
- `sessionId`
- `lineUserId`
- `displayName`
- `fullName`
- `phone`
- `branch`
- `isLineFriend`
- `source` with optional `qrId`

## POST `/api/pharmacy-plus/reward/draw`
Creates or reuses a reward for a session.

Behavior:
- one main reward per `campaignKey + sessionId`
- repeated draw returns the same reward
- if DB is unavailable, fallback returns `storage: "noop"`

## POST `/api/pharmacy-plus/reward/claim`
Marks the session reward as claimed.

Behavior:
- idempotent for retries
- if reward is already `claimed` or `redeemed`, returns current reward state
- in fallback mode, can accept a client reward payload and return `storage: "noop"`

## POST `/api/pharmacy-plus/reward/redeem`
Marks the session reward as redeemed.

Behavior:
- idempotent for retries
- if reward is already `redeemed`, returns current reward state
- in fallback mode, can accept a client reward payload and return `storage: "noop"`

## GET `/api/pharmacy-plus/report/summary`
Returns top-level campaign counts and simple conversion rates.

Response example:
```json
{
  "ok": true,
  "storage": "db",
  "campaignKey": "pharmacy-plus-shake-to-win",
  "asOf": "2026-04-21T11:20:00.000Z",
  "metrics": {
    "entries": 12,
    "events": 108,
    "rewardsIssued": 10,
    "rewardsClaimed": 8,
    "rewardsRedeemed": 4
  },
  "rates": {
    "claimRateFromIssued": 80,
    "redeemRateFromClaimed": 50,
    "redeemRateFromIssued": 40
  }
}
```

## Response strategy
- `storage: "db"` when persisted in Supabase
- `storage: "noop"` when DB is unavailable and fallback is used
