-- Short, eye-catching bullet points (e.g. "Paraben-free", "24h hydration")
-- shown above the description on the product page — distinct from the
-- free-form description text.
alter table public.products add column key_features text[] not null default '{}'::text[];
