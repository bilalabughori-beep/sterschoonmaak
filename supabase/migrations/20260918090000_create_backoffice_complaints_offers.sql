-- Ster Schoonmaak backoffice data model.
-- Authorization is enforced by the Worker using Supabase Auth app_metadata.
-- These tables intentionally have no broad browser policies: the browser talks
-- to Supabase Auth only, while the Worker uses the service credential.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text check (role in ('client_admin', 'site_owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locale text not null check (locale in ('nl-BE', 'en-BE')),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  customer_email text not null check (char_length(customer_email) between 3 and 254),
  customer_phone text check (customer_phone is null or char_length(customer_phone) <= 50),
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 3000),
  source_path text check (source_path is null or char_length(source_path) <= 300),
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'closed')),
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 3000),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_sent_at timestamptz,
  email_attempts integer not null default 0 check (email_attempts >= 0),
  email_last_error text,
  updated_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  enabled boolean not null default false,
  internal_name text not null check (char_length(internal_name) between 1 and 160),
  placement text not null default 'homepage_offer' check (placement in ('top_banner', 'homepage_offer', 'popup')),
  priority integer not null default 0 check (priority between -1000 and 1000),
  starts_at timestamptz,
  ends_at timestamptz,
  badge_nl text check (badge_nl is null or char_length(badge_nl) <= 80),
  badge_en text check (badge_en is null or char_length(badge_en) <= 80),
  title_nl text check (title_nl is null or char_length(title_nl) <= 180),
  title_en text check (title_en is null or char_length(title_en) <= 180),
  subtitle_nl text check (subtitle_nl is null or char_length(subtitle_nl) <= 240),
  subtitle_en text check (subtitle_en is null or char_length(subtitle_en) <= 240),
  description_nl text check (description_nl is null or char_length(description_nl) <= 1000),
  description_en text check (description_en is null or char_length(description_en) <= 1000),
  old_price_label text check (old_price_label is null or char_length(old_price_label) <= 60),
  new_price_label text check (new_price_label is null or char_length(new_price_label) <= 60),
  discount_label text check (discount_label is null or char_length(discount_label) <= 60),
  cta_label_nl text check (cta_label_nl is null or char_length(cta_label_nl) <= 80),
  cta_label_en text check (cta_label_en is null or char_length(cta_label_en) <= 80),
  cta_url text check (cta_url is null or char_length(cta_url) <= 500),
  image_path text check (image_path is null or char_length(image_path) <= 500),
  image_alt_nl text check (image_alt_nl is null or char_length(image_alt_nl) <= 180),
  image_alt_en text check (image_alt_en is null or char_length(image_alt_en) <= 180),
  theme text not null default 'brand' check (theme in ('brand', 'light', 'dark', 'accent')),
  layout text not null default 'banner' check (layout in ('compact', 'banner', 'split')),
  dismissible boolean not null default true,
  published_at timestamptz
);

create index if not exists complaints_created_at_idx on public.complaints (created_at desc);
create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists offers_active_idx on public.offers (status, enabled, placement, priority desc);
create index if not exists offers_schedule_idx on public.offers (starts_at, ends_at);

create or replace function public.set_backoffice_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at before update on public.complaints
for each row execute function public.set_backoffice_updated_at();

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at before update on public.offers
for each row execute function public.set_backoffice_updated_at();

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.offers enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.complaints from anon, authenticated;
revoke all on table public.offers from anon, authenticated;

-- The Worker is the only business-data client. Keep these grants explicit so
-- the service credential remains usable even when project defaults change.
grant select, insert, update on table public.profiles to service_role;
grant select, insert, update on table public.complaints to service_role;
grant select, insert, update on table public.offers to service_role;

-- Offer media is publicly readable because published offers are public content.
-- Writes remain Worker-only through the service credential.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('offer-images', 'offer-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists offer_images_public_read on storage.objects;
create policy offer_images_public_read on storage.objects
for select to public using (bucket_id = 'offer-images');

grant select, insert, update, delete on table storage.objects to service_role;
grant select, insert, update on table storage.buckets to service_role;
