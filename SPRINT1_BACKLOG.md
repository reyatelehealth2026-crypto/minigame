# Sprint 1 Dev Backlog, File by File

Reference: `PRD.md`
Scope: Sprint 1 only, focused on the first usable loop:
- QR/source tracking
- landing
- one game mechanic
- reward draw
- add friend gate
- reward claim
- wallet view
- basic analytics events

Design reference: keep implementation clean and product-like, closer to Linear/Stripe discipline than hacky MVP sprawl.

---

## Sprint 1 outcome
By the end of Sprint 1, a user should be able to:
1. scan QR
2. open LIFF page
3. see landing
4. play one game
5. get a reward
6. add friend if needed
7. claim reward
8. see claimed reward in wallet

Non-goals for Sprint 1:
- share bonus
- multi-reward wallet
- staff redeem screen
- campaign copy editor
- analytics dashboard UI

---

# A. Frontend backlog

## 1. `src/app/liff/pharmacy-plus/page.tsx`
### Why
This is the main user journey file. Most Sprint 1 UX behavior lives here.

### Current status
Already has:
- landing
- gate
- register
- shake
- reward
- wallet
- success
- draw/claim/redeem wiring
- analytics event posting helper usage

### Sprint 1 tasks
#### Task FE-1, normalize step flow for Sprint 1
- keep steps:
  - `landing`
  - `gate`
  - `register`
  - `shake`
  - `reward`
  - `wallet`
  - `success`
- ensure add-friend gate is clearly treated as reward unlock, not a dead-end blocker

#### Task FE-2, tighten QR source capture usage
- make sure `source` includes at least:
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `branch`
  - `qr_id` (new)
- include `qr_id` in event payloads and entry payload

#### Task FE-3, make game state explicit
- add `gameStarted` event call before draw trigger
- keep one visible mechanic only for Sprint 1, preferably tap or shake
- disable repeated clicks during draw

#### Task FE-4, make add-friend gate clearer
- if not friend, user should understand they already have a reward but must add friend to unlock it
- refine copy around:
  - reward reserved
  - unlock after add friend

#### Task FE-5, keep wallet strictly Sprint 1
- wallet should show only main reward for now
- no bonus/share UI in Sprint 1
- keep claimed status visible
- keep redeem button if you want internal testing, but mark it as test/admin path only if needed

### Acceptance criteria
- no step dead-ends
- source payload includes `qr_id`
- game cannot double-trigger draw while loading
- non-friend users can still reach reward reveal, but must add friend before final claim

---

## 2. `src/components/LiffProvider.tsx`
### Why
Friendship check and LIFF readiness are critical for Sprint 1 unlock flow.

### Sprint 1 tasks
#### Task FE-6, verify LIFF readiness contract
- ensure provider exposes:
  - ready
  - loggedIn
  - profile
  - friendship
  - refreshFriendship
- make errors safe and non-breaking

#### Task FE-7, harden friendship refresh
- after returning from add-friend flow, `refreshFriendship()` should be the single source of truth
- avoid stale state after user comes back from LINE add friend page

### Acceptance criteria
- user can return from add-friend flow and status updates without reload drama

---

## 3. `src/app/liff/layout.tsx`
### Why
LIFF pages need stable shell behavior and mobile-safe layout.

### Sprint 1 tasks
#### Task FE-8, verify campaign-safe layout
- confirm spacing, safe-area padding, and viewport behavior for LIFF webview
- keep shell minimal, no extra nav that distracts from campaign flow

### Acceptance criteria
- campaign page feels like one uninterrupted mobile flow

---

## 4. `src/app/globals.css`
### Why
Sprint 1 needs only enough styling for polished mobile UX, not design-system expansion.

### Sprint 1 tasks
#### Task FE-9, standardize campaign utility classes
- confirm tone classes and buttons used by pharmacy page are stable
- remove dead CSS if any was left from experiments

### Acceptance criteria
- buttons, cards, inputs, and reward states are visually consistent

---

# B. API backlog

## 5. `src/app/api/pharmacy-plus/config/route.ts`
### Why
The frontend depends on this for campaign metadata.

### Current status
Already returns:
- campaign key
- add friend URL
- reward teasers
- benefit bullets
- branches

### Sprint 1 tasks
#### Task API-1, add `qr_id` awareness in config contract docs only if needed
- route itself does not need `qr_id`
- but ensure branch list and teaser logic are stable

#### Task API-2, keep config simple for Sprint 1
- no campaign copy editor yet
- no branch-specific reward logic yet

### Acceptance criteria
- frontend can render landing with no local hardcoded dependency beyond fallback UI

---

## 6. `src/app/api/pharmacy-plus/events/route.ts`
### Why
Basic analytics is part of Sprint 1 done-definition.

### Sprint 1 tasks
#### Task API-3, define allowed event names for Sprint 1
Required:
- `campaign_view`
- `registration_submit`
- `game_start`
- `shake_complete`
- `reward_reveal`
- `reward_claim_click`
- `wallet_view`
- `success_view`
- `add_friend_click`
- `add_friend_success`

#### Task API-4, ensure payload accepts `qr_id`
- store inside `source` or `payload`
- keep schema shallow

### Acceptance criteria
- every critical user action in Sprint 1 is logged through one stable endpoint

---

## 7. `src/app/api/pharmacy-plus/entry/route.ts`
### Why
This is the main lead capture endpoint.

### Current status
Already stores registration data.

### Sprint 1 tasks
#### Task API-5, align input contract with frontend fields
- ensure entry accepts:
  - `sessionId`
  - `lineUserId`
  - `displayName`
  - `fullName`
  - `phone`
  - `branch`
  - `isLineFriend`
  - `source` including `qr_id`

#### Task API-6, idempotent upsert check
- one session should safely upsert, not create duplicates

### Acceptance criteria
- repeated submit from same session does not duplicate records

---

## 8. `src/app/api/pharmacy-plus/reward/draw/route.ts`
### Why
This is the heart of the game loop.

### Current status
Already supports:
- DB-backed draw
- fallback reward
- reward pool lookup
- reuse existing reward for session

### Sprint 1 tasks
#### Task API-7, add explicit `game_start` call from frontend before draw
- no backend change required unless you want stronger validation

#### Task API-8, confirm one reward per session behavior
- repeated draw calls for same session should return existing reward
- this is already present, verify and keep

#### Task API-9, ensure expiry and coupon code always exist in fallback and DB mode
- reward object returned to UI must always be wallet-ready

### Acceptance criteria
- no duplicate main rewards for same session
- response shape is stable in both `db` and `noop`

---

## 9. `src/app/api/pharmacy-plus/reward/claim/route.ts`
### Why
Claim is the unlock handoff between reward reveal and wallet.

### Sprint 1 tasks
#### Task API-10, enforce claim from issued -> claimed
- if reward already `claimed`, returning it is okay
- keep route idempotent for retry safety

#### Task API-11, friend gate policy
Choose one of these and document it in code comments:
- policy A: frontend alone enforces add-friend gate
- policy B: backend also receives `isLineFriend` and blocks claim when false

Recommendation for Sprint 1:
- use policy A now to move fast
- add policy B in hardening sprint

### Acceptance criteria
- claim can be retried safely
- wallet always receives a claimed reward object

---

## 10. `src/app/api/pharmacy-plus/report/summary/route.ts`
### Why
Needed to validate campaign data exists, even before building dashboard UI.

### Sprint 1 tasks
#### Task API-12, keep summary to top-level counts only
- entries
- events
- rewardsIssued
- rewardsClaimed
- rewardsRedeemed

#### Task API-13, verify counts after manual test run
- not a code task only, also a smoke test task

### Acceptance criteria
- team can hit one endpoint and confirm the funnel is writing data

---

# C. Library / data backlog

## 11. `src/lib/pharmacy-plus.ts`
### Why
This is the shared contract file for frontend + backend.

### Sprint 1 tasks
#### Task LIB-1, add `qr_id` to source type
- extend source model so QR placement can be tracked properly

#### Task LIB-2, add event-name constants
- centralize Sprint 1 event names instead of freehand strings scattered in UI

#### Task LIB-3, keep reward types minimal
- one main reward type only for Sprint 1
- do not add bonus/share models yet unless you want to pre-stub types

### Acceptance criteria
- frontend and backend use one consistent source and event contract

---

## 12. `src/lib/supabase.ts`
### Why
All campaign endpoints depend on this.

### Sprint 1 tasks
#### Task LIB-4, keep admin client fail-soft behavior explicit
- `hasSupabaseAdmin()` should be used before DB writes
- fallback mode should be expected in local dev

#### Task LIB-5, document required env in comments or docs
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Acceptance criteria
- local dev without DB still works
- production with DB persists all Sprint 1 core actions

---

# D. Admin and operations backlog

## 13. `src/app/admin/pharmacy-plus/rewards/page.tsx`
### Why
Already useful, but this is not critical path for finishing Sprint 1 loop.

### Sprint 1 tasks
#### Task ADMIN-1, keep as support tool only
- reward pool admin can stay usable
- no need to expand beyond current fields in Sprint 1

### Acceptance criteria
- team can adjust reward weights and stock without code changes

---

## 14. `src/app/api/pharmacy-plus/admin/reward-pool/route.ts`
### Why
Supports admin reward configuration.

### Sprint 1 tasks
#### Task ADMIN-2, verify current batch save behavior
- replace-all write is acceptable for Sprint 1
- no need for patch-by-item API yet

### Acceptance criteria
- admin can reload and save reward pool without broken state

---

## 15. `supabase/migrations/001_campaign_core.sql`
### Why
This is the DB foundation for Sprint 1.

### Sprint 1 tasks
#### Task DB-1, confirm schema covers core loop
Must support:
- entries
- events
- reward pool
- rewards

#### Task DB-2, optional small extension for `qr_id`
- `qr_id` can stay inside `source` jsonb for Sprint 1
- no schema column required yet

### Acceptance criteria
- one migration can bootstrap the full Sprint 1 data path

---

# E. Documentation backlog

## 16. `README.md`
### Sprint 1 tasks
#### Task DOC-1, update current flow description
- mention add-friend unlock explicitly
- mention summary endpoint as validation tool

---

## 17. `docs/API_CONTRACT.md`
### Sprint 1 tasks
#### Task DOC-2, add canonical Sprint 1 event list
- include request examples with `qr_id`
- document claim behavior and expected idempotency

---

## 18. `docs/SETUP.md`
### Sprint 1 tasks
#### Task DOC-3, add manual smoke-test checklist
Suggested checklist:
1. open LIFF page
2. see landing
3. register
4. draw reward
5. claim reward
6. wallet displays reward
7. hit summary endpoint and see counts increase

---

# F. Suggested implementation order

## Day 1
1. `src/lib/pharmacy-plus.ts`
2. `src/app/api/pharmacy-plus/events/route.ts`
3. `src/app/api/pharmacy-plus/entry/route.ts`
4. `src/app/liff/pharmacy-plus/page.tsx` source + event alignment

## Day 2
5. `src/app/api/pharmacy-plus/reward/draw/route.ts`
6. `src/app/api/pharmacy-plus/reward/claim/route.ts`
7. `src/app/liff/pharmacy-plus/page.tsx` game/claim flow polish

## Day 3
8. `src/app/api/pharmacy-plus/report/summary/route.ts`
9. `src/app/admin/pharmacy-plus/rewards/page.tsx`
10. docs + smoke test

---

# G. Definition of Done for Sprint 1
Sprint 1 is done when:
- user can scan and enter LIFF
- source tracking includes branch and qr_id
- user can complete game once per session
- reward draw is stable per session
- add friend gate works as unlock step
- claim moves reward into wallet state
- summary endpoint reflects test traffic
- typecheck and lint pass
- README and setup docs reflect the actual loop
