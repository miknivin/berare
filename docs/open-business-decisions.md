# Open Business Decisions

Living tracker for the affiliate program's business rules the client scope
document (§8) leaves to be confirmed later. The mechanism for every one of
these is already built — each row just needs a final value. Current values
live in `public.app_config` (seeded in `supabase/migrations/0003_affiliate.sql`)
where applicable, so most of these can be changed by an admin without a
code deploy once an admin UI for `app_config` exists.

| # | Decision | Current placeholder | Plugs into | Status |
|---|---|---|---|---|
| 1 | Commission/points formula | Flat 5% of order total (`commission_rate_percent`) | `record_affiliate_attribution()` SQL function | Placeholder |
| 2 | Affiliate eligibility criteria beyond manual review | None — admin reviews every application manually | Admin approval flow (Phase 5) | Open |
| 3 | Attribution window length + last-click vs first-click | 30 days (`attribution_window_days`), last-click-wins | `berare_ref` cookie Max-Age in storefront middleware (Phase 6) | Placeholder |
| 4 | Minimum withdrawal amount | ₹2000 (`min_withdrawal_amount`) | `validate_withdrawal_request()` trigger | Placeholder, confirmed adjustable |
| 5 | Withdrawal processing rules/SLA | State machine only: requested → approved/rejected → paid | Admin withdrawal review (Phase 7) | Open |
| 6 | Points hold period before "confirmed" | 7 days (`points_hold_days`) | Scheduled confirmation job (Phase 7, not yet built) | Placeholder |
| 7 | Notification triggers/copy | Call sites exist, copy is placeholder | Resend templates (Phases 3/5/7) | Open |
| 8 | Self-referral allowed or blocked | Blocked (`self_referral_allowed = false`) | `record_affiliate_attribution()` SQL function | Placeholder, default-safe |
| 9 | Final affiliate-application field list | `full_name`, `email`, `phone`, `message` + open `extra_fields` jsonb | `affiliate_applications` table + storefront form | Open, no migration needed once confirmed |
| 10 | Points-to-INR conversion rate | 1:1 (`points_to_inr_rate`) | Withdrawal amount calculation (Phase 7) | Placeholder |
| 11 | Whether "manage user status/activity" needs an audit log | Active/disabled toggle only, no activity log | `profiles.account_status` (Phase 4) | Open |

**Payout method (confirmed, not open):** affiliates are paid via NEFT/netbanking
bank transfer, done manually by the admin outside the app. The app only
tracks withdrawal state and records the transfer's UTR/reference number in
`withdrawal_requests.payout_reference` — there is no payout API integration.
