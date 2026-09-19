-- Free-text so it can hold whatever unit fits the product ("100ml", "50g",
-- "3 x 30ml", ...) rather than forcing a fixed unit column. Optional —
-- shown on the storefront product page only when set.
alter table public.products add column net_volume text;
