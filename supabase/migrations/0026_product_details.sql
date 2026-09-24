-- Expanded product detail page content: benefit/skin-type checklists, key
-- ingredient chips, the three-tab "what it is / does / how it works" copy,
-- a full ingredient list, usage directions, and a simple FAQ list. All
-- optional — the storefront only renders a section when it has content.
alter table public.products
  add column benefits text[] not null default '{}'::text[],
  add column skin_types text[] not null default '{}'::text[],
  add column key_ingredients text[] not null default '{}'::text[],
  add column what_it_is text,
  add column what_it_does text,
  add column how_it_works text,
  add column full_ingredients text,
  add column directions_to_use text,
  add column faqs jsonb not null default '[]'::jsonb;
