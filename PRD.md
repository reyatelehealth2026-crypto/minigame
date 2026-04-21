# PRD: Pharmacy Plus Viral Acquisition Game

Style reference: Stripe-style product brief, focused on clear scope, measurable outcomes, and fast execution.

## 1. Product Summary
Pharmacy Plus Viral Acquisition Game is a LIFF web app campaign for in-store and offline acquisition.

Core loop:
1. User scans QR
2. LIFF web app opens
3. User plays a short game
4. System draws a reward
5. User adds LINE OA friend to unlock the reward
6. User shares to get bonus reward or bonus coupon
7. User stores rewards in wallet
8. Staff redeems coupon in-store

## 2. Goal
Primary goal:
- increase LINE OA friends from offline traffic

Secondary goals:
- increase campaign shares
- drive in-store redemption
- measure full funnel from scan to redeem

## 3. Success Metrics
### Primary KPIs
- Add Friend Conversion Rate
- Share Conversion Rate
- Coupon Redeem Rate

### Secondary KPIs
- QR scan count
- Game completion rate
- Reward claim rate
- Bonus unlock rate
- Cost per acquired LINE friend

## 4. Target User
### Customer
- walks into or passes by a pharmacy branch
- scans QR from poster, counter, shelf wobblers, receipt, or product stand
- wants a quick reward with minimal friction

### Staff
- verifies coupon status
- redeems coupon at branch

### Admin
- manages reward pool
- checks campaign performance
- updates campaign copy and branch setup later

## 5. MVP Scope
### In Scope
- QR source tracking
- LIFF landing page
- one game mechanic
- reward draw
- add friend gate
- share bonus gate
- wallet with main reward + bonus reward
- coupon redeem
- reward pool admin
- analytics summary

### Out of Scope
- full no-code campaign builder
- multi-tenant SaaS billing
- advanced anti-fraud scoring
- POS integration
- referral tree / invite graph

## 6. User Journey
### Step 1: QR Scan
Input:
- branch QR
- poster QR
- shelf QR

Expected query params:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `branch`
- `qr_id`

Output:
- session starts
- source metadata stored for analytics

### Step 2: Landing
User sees:
- campaign title
- reward teaser
- start CTA

System actions:
- fetch config
- log `campaign_view`

### Step 3: Play Game
User action:
- tap / shake / open box

System actions:
- log `game_start`
- log `game_complete`
- call reward draw endpoint

### Step 4: Reward Reveal
User sees drawn reward.

System actions:
- create or reuse reward for session
- log `reward_reveal`

### Step 5: Add Friend Unlock
If user is not a LINE OA friend:
- show add friend gate
- require add friend before claim

System actions:
- log `add_friend_click`
- log `add_friend_success`

### Step 6: Share Bonus
After reward claim, prompt user to share.

If share succeeds:
- give bonus coupon or bonus reward
- log `share_click`
- log `share_success`
- log `bonus_reward_granted`

### Step 7: Wallet
User sees:
- main reward
- bonus reward if earned
- coupon code
- expiry
- status

System actions:
- log `wallet_view`

### Step 8: Redeem
Staff checks code and redeems.

System actions:
- set reward status to `redeemed`
- log `coupon_redeem`

## 7. Functional Requirements
### FR-1 QR Tracking
- system must accept QR parameters and persist them to session analytics
- system must report performance by branch and `qr_id`

### FR-2 Game Entry
- user must be able to start game without long form friction
- user must only get one main draw per campaign session

### FR-3 Reward Draw
- draw must support weighted reward pool
- draw must support optional stock cap per reward item
- draw must return a stable reward for the session on repeated calls

### FR-4 Add Friend Unlock
- user must add LINE OA before final claim if not already a friend
- friendship status should be re-checked after returning from add friend flow

### FR-5 Share Bonus
- share should use `liff.shareTargetPicker()`
- one bonus grant per session maximum
- share bonus may be either an extra coupon or upgraded reward

### FR-6 Wallet
- wallet must show all active rewards for the session
- wallet must show claim/redeem state and expiry clearly

### FR-7 Redeem
- reward must move through statuses:
  - `issued`
  - `claimed`
  - `redeemed`
- redeemed reward must not be redeemable again

### FR-8 Admin Reward Pool
- admin must be able to create, edit, disable, and reorder reward pool items logically through weight values
- admin must be able to set stock cap and active state

### FR-9 Reporting
- system must expose summary counts for:
  - entries
  - events
  - rewards issued
  - rewards claimed
  - rewards redeemed
- future reporting should break down by source, branch, and QR placement

## 8. Event Schema
Required events:
- `campaign_view`
- `game_start`
- `game_complete`
- `reward_reveal`
- `add_friend_click`
- `add_friend_success`
- `reward_claim_click`
- `share_click`
- `share_success`
- `bonus_reward_granted`
- `wallet_view`
- `coupon_redeem`

## 9. Data Model
### `campaign_entries`
Stores session registration / lead info.

Suggested fields:
- `campaign_key`
- `session_id`
- `line_user_id`
- `display_name`
- `full_name`
- `phone`
- `branch`
- `is_line_friend`
- `source`
- `created_at`

### `campaign_events`
Stores analytics stream.

Suggested fields:
- `campaign_key`
- `session_id`
- `event_name`
- `step`
- `source`
- `payload`
- `created_at`

### `campaign_reward_pool`
Stores configurable reward definitions.

Suggested fields:
- `reward_title`
- `reward_detail`
- `reward_tone`
- `coupon_code_prefix`
- `weight`
- `stock_total`
- `stock_issued`
- `is_active`

### `campaign_rewards`
Stores main reward per session.

Suggested fields:
- `session_id`
- `reward_pool_id`
- `reward_code`
- `coupon_code`
- `status`
- `issued_at`
- `claimed_at`
- `redeemed_at`
- `expires_at`

### `campaign_bonus_rewards`
Stores share bonus rewards.

Suggested fields:
- `session_id`
- `bonus_type`
- `reward_title`
- `coupon_code`
- `status`
- `created_at`

## 10. API Surface
### Public Campaign APIs
- `GET /api/pharmacy-plus/config`
- `POST /api/pharmacy-plus/entry`
- `POST /api/pharmacy-plus/events`
- `POST /api/pharmacy-plus/reward/draw`
- `POST /api/pharmacy-plus/reward/claim`
- `POST /api/pharmacy-plus/share/claim-bonus`
- `POST /api/pharmacy-plus/reward/redeem`
- `GET /api/pharmacy-plus/wallet`
- `GET /api/pharmacy-plus/report/summary`

### Admin APIs
- `GET /api/pharmacy-plus/admin/reward-pool`
- `POST /api/pharmacy-plus/admin/reward-pool`

## 11. Business Rules
- one main reward per session
- add friend required before final claim
- one share bonus per session
- every coupon has expiry
- redeemed coupon cannot be reused
- fallback mode may return `storage: "noop"` in dev, but production should use DB-backed storage

## 12. Risks
### Risk 1: Share flow is not reliable enough
Mitigation:
- treat share success only when LIFF share API confirms
- keep bonus logic idempotent

### Risk 2: Reward stock overshoots during traffic spikes
Mitigation:
- add transaction-safe stock update in later hardening sprint

### Risk 3: Add friend flow causes drop-off
Mitigation:
- let user play before gate
- use reward unlock framing instead of hard block at the top

## 13. Sprint Plan
## Sprint 1: Core acquisition loop
Goal:
- make the first full loop work from scan to wallet claim

Scope:
- QR/source tracking
- landing page
- one game mechanic
- reward draw
- add friend gate
- reward claim
- wallet view
- basic analytics events

Deliverables:
- playable LIFF flow
- DB-backed reward lifecycle: draw -> claim
- config endpoint
- entry + events persistence

Exit criteria:
- user can scan, play, add friend, claim reward, and see wallet
- summary endpoint shows entries and issued/claimed numbers

## Sprint 2: Viral loop and bonus layer
Goal:
- add share-driven growth on top of the core loop

Scope:
- share CTA
- LIFF share integration
- bonus reward / bonus coupon logic
- wallet support for multiple rewards
- share analytics

Deliverables:
- `share/claim-bonus` endpoint
- bonus reward data model
- wallet UI showing main reward + bonus reward

Exit criteria:
- user can share successfully and receive one bonus reward
- duplicate share bonus is blocked per session

## Sprint 3: Redemption and admin control
Goal:
- make the system operational for store use

Scope:
- redeem endpoint
- staff/admin redeem screen
- reward pool admin
- branch/source summary
- hardening on status handling

Deliverables:
- redeem flow
- admin reward pool page
- campaign summary dashboard

Exit criteria:
- staff can redeem coupon once and only once
- admin can adjust reward pool without code changes
- admin can see campaign totals by status

## 14. Backlog After Sprint 3
- campaign copy editor
- richer dashboard by branch / qr_id / source
- anti-abuse rules
- transaction-safe stock handling
- multi-campaign support
- self-serve SaaS onboarding
