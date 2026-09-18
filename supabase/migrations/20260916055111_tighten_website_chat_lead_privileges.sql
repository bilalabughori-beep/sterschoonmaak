-- Keep the Worker-side service_role surface minimal after the project's
-- existing default table privileges are taken into account.
revoke all on table public.website_chat_leads from service_role;
grant select, insert on table public.website_chat_leads to service_role;
