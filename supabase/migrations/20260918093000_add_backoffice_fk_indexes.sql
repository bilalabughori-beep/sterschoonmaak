-- Cover backoffice foreign keys used by updates and ownership lookups.
create index if not exists complaints_updated_by_idx on public.complaints (updated_by);
create index if not exists offers_created_by_idx on public.offers (created_by);
create index if not exists offers_updated_by_idx on public.offers (updated_by);
