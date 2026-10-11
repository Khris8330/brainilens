-- School plan: teacher role, classroom, students owned by teachers (max 30),
-- assignment source tags for parent vs teacher.

create table if not exists public.teacher_classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null unique references public.profiles(id) on delete cascade,
  teacher_display_name text not null,
  grade text not null,
  expected_pupils integer not null default 0 check (expected_pupils >= 0 and expected_pupils <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teacher_classrooms enable row level security;

create policy "Teachers manage own classroom"
  on public.teacher_classrooms for all to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));

alter table public.students
  alter column parent_id drop not null;

alter table public.students
  add column if not exists teacher_id uuid references public.profiles(id) on delete cascade;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_owner_check'
  ) then
    alter table public.students
      add constraint students_owner_check
      check (parent_id is not null or teacher_id is not null);
  end if;
end $$;

create index if not exists students_teacher_id_idx on public.students (teacher_id);

drop policy if exists "Teachers can view their own students" on public.students;
create policy "Teachers can view their own students"
  on public.students for select to authenticated
  using (
    teacher_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'teacher'
    )
  );

drop policy if exists "Teachers can create their own students" on public.students;
create policy "Teachers can create their own students"
  on public.students for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and parent_id is null
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'teacher'
    )
  );

drop policy if exists "Teachers can update their own students" on public.students;
create policy "Teachers can update their own students"
  on public.students for update to authenticated
  using (
    teacher_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'teacher'
    )
  )
  with check (
    teacher_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'teacher'
    )
  );

drop policy if exists "Teachers can delete their own students" on public.students;
create policy "Teachers can delete their own students"
  on public.students for delete to authenticated
  using (
    teacher_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'teacher'
    )
  );

alter table public.assignments
  add column if not exists source_type text
    check (source_type is null or source_type in ('parent', 'teacher')),
  add column if not exists source_name text,
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

create or replace function public.owns_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students s
    where s.id = p_student_id
      and (
        s.parent_id = auth.uid()
        or s.teacher_id = auth.uid()
      )
  );
$$;

grant execute on function public.owns_student(uuid) to authenticated;
