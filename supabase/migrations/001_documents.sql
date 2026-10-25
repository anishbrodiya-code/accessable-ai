create table if not exists public.documents (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 entry jsonb not null, updated_at timestamptz not null default now()
);
create index if not exists documents_user_updated on public.documents(user_id,updated_at desc);
alter table public.documents enable row level security;
create policy "Users read own documents" on public.documents for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own documents" on public.documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own documents" on public.documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own documents" on public.documents for delete to authenticated using ((select auth.uid()) = user_id);
