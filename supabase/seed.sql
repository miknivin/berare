-- Local dev only — runs automatically on `supabase start` (first run) and
-- `supabase db reset`. Creates test accounts so the three apps are
-- immediately usable without needing Google OAuth or a real email
-- provider configured yet.
--
-- Email OTP login still works normally for any address via Supabase's
-- local Inbucket catcher (URL printed by `supabase start`) — these
-- seeded accounts are only for a fast password-based admin login and a
-- ready-made customer account to test RLS against.

create extension if not exists "pgcrypto";

create or replace function create_seed_user(
  p_email text,
  p_password text,
  p_full_name text
) returns uuid as $$
declare
  v_user_id uuid := gen_random_uuid();
begin
  -- GoTrue's Go scanner reads confirmation_token/recovery_token/etc. as
  -- non-nullable strings — leaving them NULL (the column default) makes
  -- password-grant login 500 with "converting NULL to string is
  -- unsupported" even though the row otherwise looks fine. Every token
  -- column must be an empty string, not NULL.
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) values (
    v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name),
    now(), now(),
    '', '', '', '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values (
    v_user_id, v_user_id,
    format('{"sub": "%s", "email": "%s"}', v_user_id, p_email)::jsonb,
    'email', v_user_id::text,
    now(), now(), now()
  );

  return v_user_id;
end;
$$ language plpgsql;

do $$
declare
  v_staff_id uuid;
  v_customer_id uuid;
begin
  -- Admin login: admin@berare.test / berare-admin-dev
  v_staff_id := create_seed_user('admin@berare.test', 'berare-admin-dev', 'Berare Admin');
  insert into public.staff (id, role) values (v_staff_id, 'admin');

  -- Test customer: customer@berare.test / berare-customer-dev
  v_customer_id := create_seed_user('customer@berare.test', 'berare-customer-dev', 'Test Customer');
end $$;

drop function create_seed_user(text, text, text);

-- Cosmetics catalog — enough real data to build/test the storefront
-- against before the admin Product Master exists. No product_images rows
-- yet (no Storage bucket wired up locally) — the storefront renders a
-- placeholder for products without images, which is also correct
-- behavior for real products that genuinely have none yet.

insert into public.categories (id, name, slug) values
  ('c1a1e1e1-0000-0000-0000-000000000001', 'Skincare', 'skincare'),
  ('c1a1e1e1-0000-0000-0000-000000000002', 'Makeup', 'makeup'),
  ('c1a1e1e1-0000-0000-0000-000000000003', 'Haircare', 'haircare');

insert into public.products (name, slug, description, price, status, category_id) values
  ('Vitamin C Brightening Serum', 'vitamin-c-brightening-serum', 'A lightweight daily serum with 15% vitamin C to even skin tone and add radiance.', 899, 'active', 'c1a1e1e1-0000-0000-0000-000000000001'),
  ('Hyaluronic Acid Moisturizer', 'hyaluronic-acid-moisturizer', 'Deeply hydrating gel-cream that locks in moisture for up to 24 hours.', 749, 'active', 'c1a1e1e1-0000-0000-0000-000000000001'),
  ('Niacinamide 10% Serum', 'niacinamide-10-serum', 'Minimizes the look of pores and controls excess oil without drying out skin.', 599, 'active', 'c1a1e1e1-0000-0000-0000-000000000001'),
  ('SPF 50 Sunscreen Gel', 'spf-50-sunscreen-gel', 'Broad-spectrum, non-greasy sunscreen gel that leaves no white cast.', 549, 'active', 'c1a1e1e1-0000-0000-0000-000000000001'),
  ('Matte Liquid Lipstick - Rosewood', 'matte-liquid-lipstick-rosewood', 'Long-wearing, transfer-proof matte lipstick in a warm rosewood shade.', 449, 'active', 'c1a1e1e1-0000-0000-0000-000000000002'),
  ('Longwear Foundation - Ivory', 'longwear-foundation-ivory', 'Buildable, 16-hour longwear foundation with a natural satin finish.', 899, 'active', 'c1a1e1e1-0000-0000-0000-000000000002'),
  ('Kohl Eyeliner Pencil', 'kohl-eyeliner-pencil', 'Intense pigment kohl pencil with a smudge-proof, all-day formula.', 299, 'active', 'c1a1e1e1-0000-0000-0000-000000000002'),
  ('Compact Powder - Natural', 'compact-powder-natural', 'Oil-absorbing pressed powder for a soft-focus, shine-free finish.', 399, 'active', 'c1a1e1e1-0000-0000-0000-000000000002'),
  ('Argan Oil Hair Serum', 'argan-oil-hair-serum', 'Frizz-control serum with argan oil for smooth, glossy hair.', 649, 'active', 'c1a1e1e1-0000-0000-0000-000000000003'),
  ('Anti-Dandruff Shampoo', 'anti-dandruff-shampoo', 'Gentle daily shampoo that controls dandruff without stripping the scalp.', 399, 'active', 'c1a1e1e1-0000-0000-0000-000000000003'),
  ('Keratin Hair Mask', 'keratin-hair-mask', 'Weekly deep-conditioning mask that repairs damaged, chemically treated hair.', 799, 'active', 'c1a1e1e1-0000-0000-0000-000000000003');
