create schema if not exists app_private;

create table if not exists public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'clinician' check (role in ('admin', 'clinician', 'intake')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_name text not null,
  preferred_phone text,
  relationship_to_child text,
  communication_preference text not null default 'phone' check (communication_preference in ('phone', 'email')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_initial text,
  date_of_birth date,
  diagnosis_status text not null default 'diagnosed' check (diagnosis_status in ('diagnosed', 'seeking_assessment', 'unsure')),
  school_or_program text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  request_type text not null check (request_type in ('assessment', 'meeting', 'records_review', 'caregiver_training', 'insurance_support')),
  preferred_contact text not null default 'phone' check (preferred_contact in ('phone', 'email')),
  preferred_times text,
  message text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'scheduled', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  request_id uuid references public.service_requests(id) on delete set null,
  document_type text not null check (document_type in ('diagnostic_report', 'medical_form', 'iep_or_school', 'insurance_card', 'other')),
  file_name text not null,
  file_path text not null unique,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

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

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists parent_profiles_set_updated_at on public.parent_profiles;
create trigger parent_profiles_set_updated_at
before update on public.parent_profiles
for each row execute function app_private.set_updated_at();

drop trigger if exists children_set_updated_at on public.children;
create trigger children_set_updated_at
before update on public.children
for each row execute function app_private.set_updated_at();

drop trigger if exists service_requests_set_updated_at on public.service_requests;
create trigger service_requests_set_updated_at
before update on public.service_requests
for each row execute function app_private.set_updated_at();

alter table public.staff_members enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.children enable row level security;
alter table public.service_requests enable row level security;
alter table public.documents enable row level security;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'care-documents',
  'care-documents',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "parents can upload own care documents" on storage.objects;
create policy "parents can upload own care documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'care-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "parents can read own care documents" on storage.objects;
create policy "parents can read own care documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'care-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or app_private.is_staff()
  )
);

drop policy if exists "parents can delete own care documents" on storage.objects;
create policy "parents can delete own care documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'care-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

grant usage on schema app_private to authenticated;
grant execute on function app_private.is_staff() to authenticated;
grant select on public.staff_members to authenticated;
grant select, insert, update on public.parent_profiles to authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select, insert, update on public.service_requests to authenticated;
grant select, insert, delete on public.documents to authenticated;
