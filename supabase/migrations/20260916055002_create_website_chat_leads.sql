-- Phase 2: minimal server-owned lead storage for the website chatbot.
-- The browser never receives table privileges; only the Worker-side secret
-- credential uses the service_role grant below.

-- Preserve the existing automatic-RLS event trigger while removing the
-- public RPC surface of its SECURITY DEFINER helper.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.rls_auto_enable() to postgres;

create table public.website_chat_leads (
  id uuid primary key default gen_random_uuid(),
  client_request_id uuid not null unique,
  created_at timestamptz not null default now(),
  locale text not null,
  service_id text not null,
  city text,
  postal_code text,
  frequency text not null,
  preferred_time text,
  details text,
  customer_name text not null,
  source_path text,
  status text not null default 'new',
  constraint website_chat_leads_locale_check
    check (locale in ('nl-BE', 'en-BE')),
  constraint website_chat_leads_service_id_check
    check (service_id in ('office', 'commercial', 'restaurant', 'hotel', 'school', 'home', 'deep', 'windows', 'postConstruction', 'move', 'airbnb', 'staircase')),
  constraint website_chat_leads_frequency_check
    check (frequency in ('one_time', 'daily', 'several_per_week', 'weekly', 'recurring_custom', 'not_sure')),
  constraint website_chat_leads_location_check
    check (nullif(btrim(city), '') is not null or nullif(btrim(postal_code), '') is not null),
  constraint website_chat_leads_city_length_check
    check (city is null or char_length(city) between 1 and 120),
  constraint website_chat_leads_postal_code_length_check
    check (postal_code is null or char_length(postal_code) between 1 and 30),
  constraint website_chat_leads_preferred_time_length_check
    check (preferred_time is null or char_length(preferred_time) between 1 and 200),
  constraint website_chat_leads_details_length_check
    check (details is null or char_length(details) between 1 and 1000),
  constraint website_chat_leads_customer_name_length_check
    check (char_length(customer_name) between 1 and 100),
  constraint website_chat_leads_source_path_check
    check (source_path is null or (left(source_path, 1) = '/' and char_length(source_path) between 1 and 300)),
  constraint website_chat_leads_status_check
    check (status = 'new')
);

alter table public.website_chat_leads enable row level security;

-- No browser role may enumerate or insert leads. The Worker uses its
-- server-side Supabase secret, which maps to service_role.
revoke all on table public.website_chat_leads from public, anon, authenticated;
grant select, insert on table public.website_chat_leads to service_role;

comment on table public.website_chat_leads is 'Minimal confirmed website chatbot leads; writes are server-side through the Cloudflare Worker.';
comment on column public.website_chat_leads.client_request_id is 'Browser-generated per-request UUID used for idempotent lead creation.';
comment on column public.website_chat_leads.source_path is 'Localized website pathname only; query strings and fragments are excluded.';
