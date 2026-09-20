create table if not exists public.complaint_replies (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_user_id uuid not null,
  author_role text not null check (author_role in ('client_admin', 'site_owner')),
  body text not null check (char_length(body) between 1 and 5000),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_attempts integer not null default 0 check (email_attempts >= 0),
  email_sent_at timestamptz,
  email_last_error text,
  resend_message_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists complaint_replies_complaint_id_idx on public.complaint_replies (complaint_id);
create index if not exists complaint_replies_created_at_idx on public.complaint_replies (created_at);

alter table public.complaint_replies enable row level security;
revoke all on table public.complaint_replies from anon, authenticated;
grant select, insert, update on table public.complaint_replies to service_role;
