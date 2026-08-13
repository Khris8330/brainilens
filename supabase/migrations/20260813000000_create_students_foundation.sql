create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid unique references public.profiles(id) on delete set null,
  student_id text not null unique,
  full_name text not null,
  grade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.students enable row level security;

create policy "Parents can view their own students"
  on public.students for select to authenticated
  using (parent_id = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'parent'
  ));

create policy "Students can view their own record"
  on public.students for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Parents can create their own students"
  on public.students for insert to authenticated
  with check (parent_id = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'parent'
  ));

create policy "Parents can update their own students"
  on public.students for update to authenticated
  using (parent_id = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'parent'
  ))
  with check (parent_id = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'parent'
  ));

create policy "Parents can delete their own students"
  on public.students for delete to authenticated
  using (parent_id = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'parent'
  ));

create or replace function public.set_students_updated_at()
returns trigger language plpgsql set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row execute function public.set_students_updated_at();
