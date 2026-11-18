-- Add a separate release year field to movie requests
alter table public.movie_requests
add column if not exists release_year integer;

alter table public.movie_requests
drop constraint if exists movie_requests_release_year_check;

alter table public.movie_requests
add constraint movie_requests_release_year_check
check (release_year is null or release_year between 1888 and 2100);
