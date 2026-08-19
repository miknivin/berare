-- Admin-manageable hero banner images for the storefront's homepage
-- swiper. Same shape as product_images (S3 key + position), plus an
-- optional click-through link and an active toggle so admin can queue up
-- banners without immediately publishing them.

create table public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  image_path text not null, -- S3 object key, same convention as product_images.storage_path
  link_url text,
  alt_text text not null default '',
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index hero_banners_position_idx on public.hero_banners(position);

alter table public.hero_banners enable row level security;

create policy "hero_banners: public read active" on public.hero_banners
  for select using (is_active = true);

-- Matches migration 0005's pattern: public-read table, admin writes only
-- via the service-role client (bypasses RLS and grants entirely).
grant select on public.hero_banners to anon, authenticated;
