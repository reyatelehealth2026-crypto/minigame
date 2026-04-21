# API Contract

## GET `/api/pharmacy-plus/config`
Returns campaign UI metadata.

## GET `/api/pharmacy-plus/admin/reward-pool`
Returns the editable reward pool for the campaign.

## POST `/api/pharmacy-plus/admin/reward-pool`
Replaces the full reward pool for the campaign in one batch write.

## POST `/api/pharmacy-plus/events`
Stores analytics events.

Request example:
```json
{
  "campaignKey": "pharmacy-plus-shake-to-win",
  "sessionId": "uuid",
  "eventName": "registration_submit",
  "step": "register",
  "lineUserId": "Uxxx",
  "source": {"source":"qr","campaign":"launch"},
  "payload": {"branch":"สาขาใกล้ฉัน"}
}
```

## POST `/api/pharmacy-plus/entry`
Stores registration entry for the campaign.

## POST `/api/pharmacy-plus/reward/draw`
Creates or reuses a reward for a session.

## POST `/api/pharmacy-plus/reward/claim`
Marks the session reward as claimed.

## POST `/api/pharmacy-plus/reward/redeem`
Marks the session reward as redeemed.

## GET `/api/pharmacy-plus/report/summary`
Returns top-level campaign counts.

Response example:
```json
{
  "ok": true,
  "storage": "db",
  "campaignKey": "pharmacy-plus-shake-to-win",
  "metrics": {
    "entries": 12,
    "events": 108,
    "rewardsIssued": 10,
    "rewardsClaimed": 8,
    "rewardsRedeemed": 4
  }
}
```

## Response strategy
- `storage: "db"` when persisted in Supabase
- `storage: "noop"` when DB is unavailable and fallback is used
