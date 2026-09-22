-- Payment/shipping settings: makes the storefront's existing marketing
-- copy ("5% discount on Prepaid orders", "Free shipping on order above
-- ₹499" — apps/storefront/components/layout/announcement-bar.tsx) into
-- real, admin-configurable pricing rules instead of just static text.
-- Defaults mirror those exact numbers so nothing changes the moment this
-- ships; cod_additional_charge defaults to 0 (no surprise charge) until
-- an admin sets one deliberately.
insert into public.app_config (key, value, description) values
  ('prepaid_discount_percent', '5', 'Discount % applied to the order subtotal for prepaid (Razorpay) orders'),
  ('cod_free_shipping_threshold', '499', 'Minimum order subtotal (INR) for a COD order to skip the additional charge. 0 = always charge, regardless of order total.'),
  ('cod_additional_charge', '0', 'Flat INR amount added to a COD order below the free-shipping threshold (or to every COD order if the threshold is 0)');

-- Breakdown fields so the discount/charge that produced total_amount stays
-- visible and auditable on the order itself, not just baked silently into
-- one number.
alter table public.orders add column discount_amount numeric(10, 2) not null default 0;
alter table public.orders add column additional_charge numeric(10, 2) not null default 0;
