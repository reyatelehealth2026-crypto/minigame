# API Contract

## GET `/api/pharmacy-plus/config`
Returns campaign UI metadata.

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

## Response strategy
- `storage: "db"` when persisted in Supabase
- `storage: "noop"` when DB is unavailable and fallback is used
