# Pharmacy Plus UX/UI Reference Direction

Reference locked from the user's provided storyboard image.

## Intent
Not just "make it pretty".
The key thing in the reference is that the whole campaign reads as a single visual story:

1. premium landing
2. short registration
3. playful interaction
4. reward reveal
5. add-friend unlock
6. wallet/coupon
7. calm success state

## Design references
Use the eyes of:
- **Stripe / Linear onboarding clarity** for hierarchy and cleanliness
- **Thai health retail campaign boards** for trust and local familiarity
- **mobile product storyboard layouts** rather than generic SaaS dashboards

## What to keep from the reference
- Premium green + ivory palette, clean medical feel
- Rounded phone-frame presentation
- Step-by-step board that explains the full journey at a glance
- Big, obvious reward reveal card
- Add-friend step shown as an unlock, not as the first blocker
- Success state that reassures the user what to do next

## What to improve versus the raw reference
- Keep copy tighter and more Thai-first
- Make the interaction more obvious as **tap/select capsule** even if backend still logs a shake-style game event
- Avoid over-decorating with generic gradients or clipart
- Keep the coupon/wallet step practical for real store usage

## UI rules for implementation
- Landing should feel like a campaign cover, not a blank form
- Registration should have at most 3 high-value fields visible at once
- Game step should present 3 capsule choices visually
- Reward step should use a coupon/ticket metaphor with value emphasized
- Wallet step should prioritize coupon code readability
- Success step should repeat the exact next action: show code to staff

## Product rule alignment
This stays aligned with the current Pharmacy Plus product decisions:
- play first
- reveal reward first
- add friend at claim
- customer holds coupon code
- staff redeems separately

## Screens mapped to current app
- `/` = campaign board / reference overview
- `/liff/pharmacy-plus` = actual mobile-first user flow
- `/admin/pharmacy-plus/redeem` = staff-side redeem page
