-- Migration to add primary language and translator requirement fields to the children table
alter table public.children add column if not exists primary_language text not null default 'English';
alter table public.children add column if not exists translator_needed boolean not null default false;
