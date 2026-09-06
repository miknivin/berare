-- Hero banners move from a single full-bleed image to a 2-column layout:
-- title/description/CTA text on one side, a product mockup image on the
-- other. image_path is repurposed as the mockup image (same S3 key
-- convention, no data migration needed for that column).

alter table public.hero_banners
  add column title text not null default '',
  add column description text,
  add column cta_label text;
