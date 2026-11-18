-- HYBRID CINEMAS movie request inbox
create table if not exists public.movie_requests (
  id uuid primary key default gen_random_uuid(),
  movie_title text not null check (char_length(movie_title) between 1 and 120),
  language text not null default 'Telugu',
  requester_name text,
  message text,
  status text not null default 'Pending' check (status in ('Pending','Reviewed','Added','Unavailable')),
  created_at timestamptz not null default now()
);

alter table public.movie_requests enable row level security;

drop policy if exists "Anyone can submit movie requests" on public.movie_requests;
create policy "Anyone can submit movie requests"
on public.movie_requests for insert
to anon, authenticated
with check (
  char_length(trim(movie_title)) between 1 and 120
  and char_length(coalesce(requester_name,'')) <= 80
  and char_length(coalesce(message,'')) <= 500
);

drop policy if exists "Authenticated admins can view movie requests" on public.movie_requests;
create policy "Authenticated admins can view movie requests"
on public.movie_requests for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can update movie requests" on public.movie_requests;
create policy "Authenticated admins can update movie requests"
on public.movie_requests for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can delete movie requests" on public.movie_requests;
create policy "Authenticated admins can delete movie requests"
on public.movie_requests for delete
to authenticated
using (true);
