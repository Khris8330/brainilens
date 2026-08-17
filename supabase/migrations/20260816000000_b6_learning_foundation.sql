-- B6 Learning Data Foundation
--
-- This migration adds only new learning-domain tables. It intentionally does
-- not create or alter public.profiles or public.students.
--
-- Ownership model:
--   authenticated user -> public.students.user_id (student access)
--   authenticated user -> public.students.parent_id (parent access)
-- No policy trusts a client-supplied parent_id or user_id.

create table public.learning_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text not null,
  grade text,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  learning_content_id uuid references public.learning_content(id) on delete set null,
  title text not null,
  description text,
  subject text not null,
  grade text,
  due_date date,
  difficulty text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  status text not null default 'assigned'
    check (status in ('assigned', 'in_progress', 'completed', 'overdue')),
  score numeric(5, 2) check (score >= 0 and score <= 100),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, assignment_id)
);

create table public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  learning_content_id uuid not null references public.learning_content(id) on delete cascade,
  progress numeric(5, 2) not null default 0
    check (progress >= 0 and progress <= 100),
  completed boolean not null default false,
  score numeric(5, 2) check (score >= 0 and score <= 100),
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, learning_content_id)
);

create table public.learning_activity (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  activity_date date not null,
  minutes integer not null default 0 check (minutes >= 0),
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  assignments_completed integer not null default 0 check (assignments_completed >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, activity_date)
);

create index student_assignments_student_id_idx
  on public.student_assignments (student_id);

create index student_assignments_assignment_id_idx
  on public.student_assignments (assignment_id);

create index student_progress_student_id_idx
  on public.student_progress (student_id);

create index student_progress_learning_content_id_idx
  on public.student_progress (learning_content_id);

create index learning_activity_student_date_idx
  on public.learning_activity (student_id, activity_date);

alter table public.learning_content enable row level security;
alter table public.assignments enable row level security;
alter table public.student_assignments enable row level security;
alter table public.student_progress enable row level security;
alter table public.learning_activity enable row level security;

-- Content and assignment definitions are readable only by signed-in users.
-- Authoring is intentionally deferred; no client write policies are created.
create policy "Authenticated users can view learning content"
  on public.learning_content for select to authenticated
  using (true);

create policy "Authenticated users can view assignments"
  on public.assignments for select to authenticated
  using (true);

create policy "Students can view their assignments"
  on public.student_assignments for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_assignments.student_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "Parents can view their childrens assignments"
  on public.student_assignments for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_assignments.student_id
        and s.parent_id = (select auth.uid())
    )
  );

-- Assignment rows and scores are written by a future authorized assignment
-- service, not by the student browser. No student INSERT or UPDATE policy is
-- created here, so clients cannot fabricate assignments or scores.

create policy "Students can view their progress"
  on public.student_progress for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_progress.student_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "Parents can view their childrens progress"
  on public.student_progress for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_progress.student_id
        and s.parent_id = (select auth.uid())
    )
  );

-- Progress, completion state, and scores are written by a future trusted
-- learning/assessment flow, not by the student browser. No student INSERT or
-- UPDATE policy is created here.

create policy "Students can view their learning activity"
  on public.learning_activity for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = learning_activity.student_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "Parents can view their childrens learning activity"
  on public.learning_activity for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = learning_activity.student_id
        and s.parent_id = (select auth.uid())
    )
  );

-- Activity metrics are written by a future authorized learning/assessment
-- flow, not by the student browser. No student INSERT or UPDATE policy is
-- created here, so clients cannot fabricate activity totals.

create or replace function public.set_learning_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger learning_content_set_updated_at
before update on public.learning_content
for each row execute function public.set_learning_updated_at();

create trigger assignments_set_updated_at
before update on public.assignments
for each row execute function public.set_learning_updated_at();

create trigger student_assignments_set_updated_at
before update on public.student_assignments
for each row execute function public.set_learning_updated_at();

create trigger student_progress_set_updated_at
before update on public.student_progress
for each row execute function public.set_learning_updated_at();

create trigger learning_activity_set_updated_at
before update on public.learning_activity
for each row execute function public.set_learning_updated_at();
