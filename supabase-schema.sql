-- Run once in the Supabase SQL editor. No browser roles have direct access.
create table if not exists public.content(id text primary key,body jsonb not null,version integer not null default 1,updated_at timestamptz not null default now());
create table if not exists public.revisions(id bigint generated always as identity primary key,body jsonb not null,created_at timestamptz not null default now());
create table if not exists public.enquiries(id bigint generated always as identity primary key,name text not null,email text not null,message text not null,created_at timestamptz not null default now());
alter table public.content enable row level security;
alter table public.revisions enable row level security;
alter table public.enquiries enable row level security;
revoke all on public.content,public.revisions,public.enquiries from anon,authenticated;
grant all on public.content,public.revisions,public.enquiries to service_role;
grant usage,select on all sequences in schema public to service_role;
create or replace function public.save_portfolio(payload jsonb,expected_version integer,publish_now boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare next_version integer; begin
 perform pg_advisory_xact_lock(842113);
 if coalesce((select version from public.content where id='draft'),0)<>expected_version then return jsonb_build_object('conflict',true); end if;
 insert into public.content(id,body,version) values('draft',payload,1) on conflict(id) do update set body=excluded.body,version=content.version+1,updated_at=now() returning version into next_version;
 if publish_now then
 insert into public.content(id,body,version) values('published',payload,1) on conflict(id) do update set body=excluded.body,version=content.version+1,updated_at=now();
 insert into public.revisions(body) values(payload);
 delete from public.revisions where id not in(select id from public.revisions order by id desc limit 10);
 end if; return jsonb_build_object('version',next_version); end $$;
revoke all on function public.save_portfolio(jsonb,integer,boolean) from public,anon,authenticated;
grant execute on function public.save_portfolio(jsonb,integer,boolean) to service_role;
create or replace function public.submit_enquiry(sender_name text,sender_email text,sender_message text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 perform pg_advisory_xact_lock(842114);
 if (select count(*) from public.enquiries where created_at>now()-interval '1 minute')>=5 then return false; end if;
 insert into public.enquiries(name,email,message) values(sender_name,sender_email,sender_message);return true;
end $$;
revoke all on function public.submit_enquiry(text,text,text) from public,anon,authenticated;
grant execute on function public.submit_enquiry(text,text,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio','portfolio',false,3145728,array['image/jpeg','image/png','image/webp','image/avif','application/pdf']) on conflict(id) do nothing;
