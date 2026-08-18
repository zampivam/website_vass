create index if not exists children_parent_user_id_idx
on public.children(parent_user_id);

create index if not exists service_requests_parent_user_id_idx
on public.service_requests(parent_user_id);

create index if not exists service_requests_child_id_idx
on public.service_requests(child_id);

create index if not exists documents_parent_user_id_idx
on public.documents(parent_user_id);

create index if not exists documents_child_id_idx
on public.documents(child_id);

create index if not exists documents_request_id_idx
on public.documents(request_id);

create or replace function app_private.is_staff()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.staff_members
    where user_id = (select auth.uid())
      and active = true
  );
$$;

drop policy if exists "staff can read staff roster" on public.staff_members;
create policy "staff can read staff roster"
on public.staff_members
for select
to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_staff()));

drop policy if exists "parents can manage own profile" on public.parent_profiles;
create policy "parents can manage own profile"
on public.parent_profiles
for all
to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_staff()))
with check (user_id = (select auth.uid()) or (select app_private.is_staff()));

drop policy if exists "parents can manage own children" on public.children;
create policy "parents can manage own children"
on public.children
for all
to authenticated
using (parent_user_id = (select auth.uid()) or (select app_private.is_staff()))
with check (parent_user_id = (select auth.uid()) or (select app_private.is_staff()));

drop policy if exists "parents can manage own requests" on public.service_requests;
create policy "parents can manage own requests"
on public.service_requests
for all
to authenticated
using (parent_user_id = (select auth.uid()) or (select app_private.is_staff()))
with check (parent_user_id = (select auth.uid()) or (select app_private.is_staff()));

drop policy if exists "parents can manage own document rows" on public.documents;
create policy "parents can manage own document rows"
on public.documents
for all
to authenticated
using (parent_user_id = (select auth.uid()) or (select app_private.is_staff()))
with check (parent_user_id = (select auth.uid()) or (select app_private.is_staff()));
