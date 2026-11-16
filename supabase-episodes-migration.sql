-- Run this once in Supabase Dashboard > SQL Editor > New query.
-- Adds a JSONB list of authorized season/episode viewing links to each movie.
alter table public.movies
add column if not exists episodes jsonb not null default '[]'::jsonb;

-- Existing rows automatically receive an empty episode list.
