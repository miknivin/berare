-- Adds Cash on Delivery alongside Razorpay. COD orders have no payment
-- gateway step, so they go straight to 'confirmed' at creation time —
-- there's no async webhook to wait for the way there is with Razorpay.
alter table public.orders
  add column payment_method text not null default 'razorpay'
    check (payment_method in ('razorpay', 'cod'));

-- razorpay_order_id/razorpay_payment_id stay nullable and simply unused
-- for COD orders — no schema change needed there.
