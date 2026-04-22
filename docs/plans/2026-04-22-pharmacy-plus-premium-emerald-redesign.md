# Pharmacy Plus — Premium Emerald Redesign

**Date:** 2026-04-22
**Scope:** LIFF lucky-draw experience (`/liff/pharmacy-plus`). Admin surfaces excluded.
**Driver:** Current UI feels playful but not premium; flow has a redundant "go to pick" tap; reveal lacks anticipation. Goal is a more luxurious pharmacy theme + tighter game feel without changing campaign mechanics.

## Goals
- Same green pharmacy identity, but feel like an apothecary boutique rather than a vending machine.
- Cut one tap from the play loop — shake transitions directly into pick.
- Add a clear anticipation peak at the reveal so the moment of winning feels earned.

## Out of scope
- Replay loop, sharing, leaderboards (not requested).
- Admin / staff redeem screens.
- Backend, reward draw logic, friendship/gate logic.

---

## 1. Visual direction — Apothecary Emerald

Theme tokens (single source of truth: `src/lib/pharmacy-plus-theme.ts`):

| Token | Value | Usage |
|---|---|---|
| `bg.deep` | `#063A2A` | page background base |
| `bg.forest` | `#0F5A3D` | gradient mid stop |
| `bg.velvet` | `#0A4632` | card surfaces |
| `gold.champagne` | `#D4AF7A` | primary accent (replaces orange/yellow) |
| `gold.warm` | `#E8C994` | highlight, shimmer |
| `gold.deep` | `#9C7A3F` | borders, type on light |
| `ink.cream` | `#F5EFE0` | body text on dark |
| `ink.muted` | `#C8C0A8` | secondary text |
| `glass` | `rgba(245,239,224,0.08)` | glass panels |

Surface treatment:
- Full-bleed gradient `from bg.deep via bg.forest to #03261C` + 5% SVG noise overlay.
- Cards: glass panel + thin gold border `gold.champagne/40`.
- Subtle radial vignette in gold from upper-center.

Typography (via `next/font/google`):
- Display: **Cormorant Garamond** 600 — headlines, eyebrows.
- Body: **Noto Sans Thai** 400/600 — Thai content.
- Drop the current `font-black` everywhere on display text.

Capsules (replace flat balls):
- SVG capsule with translucent shell, inner liquid gradient by `tone`, white reflection arc, ambient glow shadow.
- Component: `src/components/pharmacy/Capsule.tsx`. Props: `tone`, `size`, `selected`, `state: "idle" | "shaking" | "rising" | "cracking"`.

Confetti palette: champagne + warm gold + cream only. Drop multi-color confetti.

---

## 2. Flow — merged play stage

State machine simplifies from:
```
landing → shake → pick → reward → gate → wallet → success
```
to:
```
landing → play → reward → gate → wallet → success
```

`play` has internal sub-state: `idle | shaking | settled | drawing`.

Single-screen micro-flow:
1. Enter `play`: capsules sit in cluster layout. Hold-to-shake button anchors bottom.
2. User holds button → `shaking`. Capsules cluster wiggle, screen-shake ramps up, gold edge glow ramps up, audio rumble pitch ramps up.
3. Release → 0.4s slow-mo → capsules transition (framer `layoutId`) to `PICK_LAYOUT`. Hold button fades + slides down. Caption swaps to "แตะลูกที่ใช่". Capsules begin breathing (scale 1.0↔1.04 / 4s, async).
4. Tap a capsule → `drawing`. Selected capsule rises center + slow rotate (1.2s) while API draws. Other capsules dust away. Heartbeat audio loops.
5. API resolves → cross-fade to `reward`.

No second screen. Capsule positions are continuous via `motion.div layoutId="capsule-{i}"`.

---

## 3. Reveal climax

`src/components/pharmacy/RewardReveal.tsx`:
- Capsule at center, vibrate amplitude crescendo over 0.8s.
- Shell splits into two SVG halves, separates outward with rotation, particle burst (gold).
- Coupon card scales in from inside; amount counter animates from 0 → final via `useMotionValue` + `animate()` with ease-out (~0.6s).
- Sound: rumble crescendo → glass crack → triumphant chord (single hit, no fanfare).
- BIG WIN badge fade-in only when reward is "premium". Since `CampaignReward` has no `tier` field, derive from amount parsed from `reward.title` (≥100 = big). Document for future: add explicit `tier` to schema if marketing needs control.

---

## 4. Game-feel pacing summary

| Beat | Trigger | Sensory |
|---|---|---|
| Build-up | hold shake button | screen-shake↑, edge glow↑, rumble pitch↑, long haptic |
| Release | finger up | slow-mo 0.4s, sharp haptic pulse, soft gong |
| Settle | post slow-mo | capsules transition to grid, button fade, breathing begins |
| Lock-in | tap capsule | tap haptic, others dust away, heartbeat 60→90 BPM |
| Crescendo | API resolved | capsule shake 0.8s, rumble crescendo |
| Crack | end of crescendo | glass crack SFX, gold particle burst |
| Reveal | post-crack | counter ticks up, triumphant chord, gold confetti |

---

## 5. File plan

| File | Action |
|---|---|
| `src/lib/pharmacy-plus-theme.ts` | new — palette/tokens |
| `src/app/layout.tsx` | add Cormorant + Noto Sans Thai via `next/font/google` |
| `src/app/globals.css` | new emerald keyframes, capsule gloss utils; remove unused neon/orange |
| `src/components/pharmacy/Capsule.tsx` | new — SVG capsule |
| `src/components/pharmacy/RewardReveal.tsx` | new — crack scene |
| `src/app/liff/pharmacy-plus/page.tsx` | merge shake+pick into `<PlayStage>`, swap Ball→Capsule, palette swap, drop "เลือกลูกโชคดี" button |
| `src/lib/pharmacy-plus-audio.ts` | rumble takes `intensity 0..1`, add `playHeartbeat(bpm)`, add `playGlassCrack()`, retune for warm tone |

Admin pages, API routes, and `LiffProvider` are not touched.

## 6. Open assumptions
- Reward "premium" detection: derive from numeric amount in title (≥100). If marketing needs explicit control, add `tier` to reward schema in a follow-up.
- Cormorant Garamond renders Thai poorly; Thai display falls back to Noto Sans Thai bold weight.
- Hold duration is capped at 2.5s to avoid users holding forever; release auto-fires at cap.
