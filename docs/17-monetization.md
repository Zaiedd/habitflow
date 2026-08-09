# HabitFlow — Monetization

## 1. Model: Freemium SaaS (subscriptions)
**Free** (retention + top-of-funnel) → **Pro** (core revenue) → **Family** (multi-user
ARPU) → **Future** (B2B coaching, marketplace).

## 2. Pricing (illustrative; validated via price testing)
| Tier | Price | Included |
|---|---|---|
| Free | $0 | 20 habits, basic gamification, journaling, 5 wellness metrics, template coach, limited analytics (7d), cloud sync 1 device, community basics |
| Pro Monthly | $9.99/mo | Unlimited habits, full AI coach (multi-agent), daily/weekly/monthly plans, burnout detection, advanced analytics + forecasts + exports, custom themes, all integrations, 3-day trial |
| Pro Annual | $79.99/yr (≈$6.67/mo) | Same as Pro, ~33% off, auto-renewal |
| Family Annual | $14.99/mo (6 seats) | Pro for owner + 5 members, shared goals/accountability, family leaderboards |

- Trials: 3-day free trial (no card pre-approval optional), 7-day trial in
  promo windows; annual-first emphasis.
- Regional pricing (PPP): India/SEA/LATAM adjusted — improves conversion 2–4×.
- Student discount (10–30% off) via verification.
- Payment: **Stripe** (checkout, 3DS, customer portal, receipts), Apple/Google
  IAP later for native apps. **Refunds:** 30-day no-questions (retention trust).
- Family invites: owner pays; members get Pro entitlements; accountability groups
  inside family plan.

## 3. Funnel & Levers
```
Signup → Onboard → Aha (first streak) → Paywall trigger → Trial → Paid → Renew
```
- **Free→Paid triggers (in-product):** habit cap (20+ habits), advanced analytics
  unlock ("Why did it drop?"), AI plan depth, custom themes, integrations depth,
  burnout alerts.
- **Incremental nudges:** 14/30/60-day engaged-user offers, annual upsell at
  renewal, "unlock this insight" micro-gate (asks intent, not hard paywall).
- **Targets:** trial start ≥ 12% of MAU; trial→paid ≥ 30%; paid churn ≤ 4%/mo;
  annual mix ≥ 40%; LTV/CAC ≥ 3.

## 4. Metrics & Reporting
- **Revenue:** MRR, ARPPU, churn, NRR, refunds, DSO on IAP (later).
- **Engagement-based LTV cohorting** (D7/D30 × plan) to prioritize product.
- **AI cost vs revenue:** per-Pro-user AI spend monitored vs LTV (cap ≤ 25%).
- Experiment stack: pricing page A/B, paywall copy A/B, regional pricing rollout.

## 5. Growth & Virality
- Referral program: give 1 month Pro per successful referral (capped).
- Shareable achievement cards (branded, no private data).
- Community/group onboarding = natural multi-seat path to Family plan.
- Seasonal challenges (New Year, Ramadan, summer) for reactivation + acquisition.

## 6. Future Monetization (roadmap)
- **B2B Coaching:** coach dashboards, client accountability seats, team wellness
  (annual per-seat), GDPR-ready contracts.
- **Marketplace:** paid template packs, community challenges, coaching add-ons
  (revenue share 30%).
- **Premium health insights** (report bundles) — careful with medical positioning.
- **Corporate wellness partnerships** (employer-paid).

## 7. Guardrails
- Never sell or share user data for ads (trust = core asset).
- Free tier must remain genuinely useful (retention > extraction).
- Family plan abuse detection (geo/devices) to protect LTV.
- Transparent pricing, easy cancel; cancellation → pause option → save-offer only
  when value demonstrated.
