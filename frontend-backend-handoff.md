# BrainiLens Frontend Backend Handoff Report

## Purpose

This report maps the frontend surfaces relevant to backend implementation for milestones 2B–2E. It identifies current data sources, Supabase calls, mock data dependencies, routes, expected shapes, and integration gaps. The frontend is a Vite + React + TypeScript app using React Router and `@supabase/supabase-js`.

## Executive summary

- Student assignment listing and detail pages are already Supabase-backed.
- The parent-facing assignment manager, dashboard analytics, and reports still rely heavily on mock data and local component state.
- The assessment-taking flow is Supabase-backed and calls the `submit-assessment` Edge Function once per assessable question.
- Student progress and child progress pages read persisted Supabase records.
- Parent dashboard loads children from Supabase but combines them with mock analytics and mock assignment/activity data.
- There is no separate reusable parent-child selector component; child selection is currently represented by child cards and a `studentId` query parameter.
- The shared Supabase client is `src/lib/supabase.ts`; environment variables are `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Application and routing context

### App stack

- Build/dev: Vite
- UI: React 19, TypeScript, Tailwind CSS v4
- Routing: `react-router-dom`
- Backend client: `@supabase/supabase-js`
- Package scripts:
  - `npm run build` → `tsc -b && vite build`
  - `npm run lint` → `eslint .`

### Relevant routes

Defined in `src/routes/index.tsx`:

- Parent-protected routes:
  - `/parent` → `ParentDashboardPage`
  - `/child` → `ChildProgressPage`
  - `/assignments` → `AssignmentsPage`
  - `/reports` → `ReportsPage`
- Student-protected routes:
  - `/student` → `StudentDashboardPage`
  - `/student/assignments` → `StudentAssignmentsPage`
  - `/student/assignments/:assignmentId` → `StudentAssignmentDetailPage`
  - `/student/assignments/:assignmentId/assessment` → `StudentAssessmentPage`
  - `/student/progress` → `StudentProgressPage`

`RequireAuth` wraps the parent and student route groups. Student route components receive the authenticated user from `AuthContext`; parent route components do the same.

---

## 2B — Assignments

There are two different assignment surfaces: the parent/teacher-style assignment manager and the student’s persisted assignment list.

### Parent assignment manager

**File:** `src/pages/assignments/AssignmentsPage.tsx`

**Current behavior:**

- Imports `initialAssignments` and `subjects` from `src/data/mockData.ts`.
- Initializes local state with `initialAssignments`.
- Supports client-side search, subject filtering, and status filtering.
- Supports a local “Create assignment” modal.
- The create action only prepends to React state; it does not call Supabase.
- Supports a local “Mark as complete” action that assigns a random score between 75 and 94; it does not persist.
- Assignment details are shown in a modal.

**Backend integration needs:**

- Replace the local `initialAssignments` state with persisted assignment queries scoped to the authenticated parent/teacher and, where applicable, selected child/student.
- Add a persisted create-assignment operation.
- Replace local completion/random score behavior with real assignment status and assessment result data.
- Define whether assignments belong directly to a parent/teacher, a student, or both through a join table.
- Preserve current client-side filters or move filtering server-side once data volume requires it.

### Student assignment list

**File:** `src/pages/student/StudentAssignmentsPage.tsx`

**Current behavior:**

- Calls `getStudentAssignments(user.id)` in an effect.
- Reads from `student_assignments`, joined to `assignments`.
- Displays subject, status, title, description, due date, and persisted score.
- Navigates to `/student/assignments/:assignmentId` using the student-assignment record ID.
- Shows loading, error, and empty states.

**Important ID distinction:**

The route parameter is the `student_assignments.id` record ID, not necessarily the underlying `assignments.id`. This is important for backend queries and RPCs.

### Student assignment detail

**File:** `src/pages/student/StudentAssignmentDetailPage.tsx`

**Current behavior:**

- Calls `getStudentAssignment(user.id, assignmentId)`.
- Queries `student_assignments` by both record ID and resolved authenticated student ID.
- Joins assignment metadata and `learning_content`.
- Parses lesson content with `parseLessonContent`.
- Derives assessable sections with `getAssessableSections`.
- Shows a “Start Assessment” link when at least one assessable section exists.
- Renders lesson content through `LessonContentRenderer`.

**Backend needs:**

- Ensure RLS and joins allow a student to read only their own assignment records.
- Ensure `learning_content.content` has the expected JSON/string shape documented in the assessment section below.
- Ensure assignment status and score update after assessment submission are reflected in this query.

### Assignment types

**File:** `src/types/index.ts`

```ts
export type AssignmentStatus = 'pending' | 'in-progress' | 'completed'
export type AssignmentDifficulty = 'easy' | 'medium' | 'hard'

export interface Assignment {
  id: string
  subject: string
  title: string
  description: string
  dueDate: string
  difficulty: AssignmentDifficulty
  status: AssignmentStatus
  score?: number
}
```

The shared `Assignment` type represents the mock parent-facing model. Persisted student assignment data uses a separate `StudentAssignmentRecord` shape in `src/lib/learning-data.ts`.

### Mock assignment data

**File:** `src/data/mockData.ts`

**Export:** `initialAssignments`

Current mock records:

- `as-1` — Math, Fractions Practice Set 4, pending
- `as-2` — Reading, Reading Comprehension: Ecosystems, in-progress
- `as-3` — Science, Water Cycle Diagram Quiz, completed, score 90
- `as-4` — Math, Long Division Challenge, pending
- `as-5` — Writing, Persuasive Paragraph, completed, score 85

The same file also exports `subjects`, which drives the assignment subject select and chart data.

---

## 2C — Assessment flow

### Assessment-taking page

**File:** `src/pages/student/StudentAssessmentPage.tsx`

**Route:** `/student/assignments/:assignmentId/assessment`

**Data loading:**

- Gets the authenticated user from `AuthContext`.
- Reads `assignmentId` from React Router params.
- Calls `getStudentAssignment(user.id, assignmentId)`.
- Parses `assignment.learningContent.content` with `parseLessonContent`.
- Filters to assessable sections with `getAssessableSections`.

**Question state:**

- `started`: controls start screen vs question screen.
- `currentIndex`: current question.
- `answers`: `Record<string, string>` keyed by section ID.
- `isSubmitting`: duplicate-submit guard/loading state.
- `submissionError`: user-facing submission error.
- `result`: local result state containing raw responses, correct count, and total.

**Supported input types:**

- `multiple_choice`: renders `section.options` as buttons.
- `true_false`: renders `true` and `false` buttons.
- Other supported types render a textarea; row count is larger for `open_ended`.

**Frontend submission behavior:**

1. Rejects duplicate submission while `isSubmitting` is true.
2. Requires every assessable section to have a non-empty answer.
3. Checks for an active Supabase session with `supabase.auth.getSession()`.
4. Iterates through every assessable section.
5. Calls `submitAssessment` once per section.
6. Stores each returned response.
7. Calls `getSubmissionSummary` on each response.
8. Counts `summary.isCorrect` values locally.
9. Uses a returned summary score when available; otherwise computes a percentage locally.

### Assessment submission helper

**File:** `src/lib/assessment.ts`

The helper calls the Edge Function with the existing shared client:

```ts
supabase.functions.invoke('submit-assessment', {
  body: { assignmentId, sectionId, answer },
})
```

The backend must continue accepting these exact body keys:

- `assignmentId`
- `sectionId`
- `answer`

The frontend intentionally submits the selected option display text for multiple-choice questions. Do not change the answer contract without coordinating with `StudentAssessmentPage` and `src/lib/lesson-content.ts`.

`getSubmissionSummary` is responsible for normalizing response variants. The intended response must expose the locally computed evaluation directly, including:

```ts
{
  success: true,
  data: {
    persistenceResult: unknown,
    isCorrect: boolean,
    score: number,
  }
}
```

The existing persistence result must remain available.

### Assessment content/types

**File:** `src/lib/lesson-content.ts`

This file defines and parses the lesson/assessment content format. Assessable sections are derived from lesson sections containing supported assessment metadata. Legacy multiple-choice sections use `correct_answer`; the frontend preserves option display text and the Edge Function performs normalization/comparison.

Backend implementation should treat the lesson content schema as the source of truth for section IDs, question text, options, assessment type, and correct answer fields.

### Related Edge Function

**File:** `supabase/functions/submit-assessment/index.ts`

This is the production submission endpoint. It is responsible for:

- CORS and OPTIONS handling.
- Creating the authenticated Supabase context.
- Validating the request.
- Loading the student assignment/assessment context.
- Computing `result.isCorrect` and `result.score`.
- Calling the persistence RPC.
- Returning both the persistence result and local evaluation.

The frontend depends on the Edge Function being deployed to the same Supabase project represented by `VITE_SUPABASE_URL`.

---

## 2D — Student Dashboard and progress

### Student dashboard

**File:** `src/pages/student/StudentDashboardPage.tsx`

**Current behavior:**

- Does not query assignment/progress records.
- Displays authenticated user data:
  - Student ID
  - Grade
  - Greeting/name
- Shows a “No progress yet” card regardless of persisted progress.
- Links to the student assignments page and Lens companion.
- Explicitly tells the user that learning records will appear as they are added.

**Backend/UI integration opportunity:**

- Query `getStudentProgress`, `getStudentActivity`, and `getStudentAssignments` or add an aggregate backend query.
- Replace static “No progress yet” display with persisted counts and summaries.
- Ensure all queries are scoped to the authenticated student identity.

### Student progress page

**File:** `src/pages/student/StudentProgressPage.tsx`

**Current behavior:**

- Calls `getStudentProgress(user.id)`.
- Displays each persisted progress record with content title, subject, percentage, completion state, and optional score.
- Uses `ProgressBar` for visual progress.
- Has loading, error, and empty states.

### Shared persisted learning data helpers

**File:** `src/lib/learning-data.ts`

Relevant interfaces:

```ts
export interface StudentProgressRecord {
  id: string
  progress: number
  completed: boolean
  score: number | null
  lastActivityAt: string | null
  content: {
    id: string
    title: string
    subject: string
    description: string | null
  } | null
}

export interface LearningActivityRecord {
  id: string
  activityDate: string
  minutes: number
  lessonsCompleted: number
  assignmentsCompleted: number
}
```

Relevant functions:

- `getStudentProgress(studentUserId)` → reads `student_progress` after resolving the student database ID.
- `getStudentActivity(studentUserId)` → reads `learning_activity` after resolving the student database ID.
- `getChildProgress(studentId)` → reads child progress by database student ID.
- `getChildActivity(studentId)` → reads child activity by database student ID.
- `getStudentAssignments(studentUserId)` → reads the student’s assignment join records.

The helper resolves the authenticated user to a `students.id` through `students.user_id` before querying student-scoped tables.

---

## 2E — Parent Reports

### Parent dashboard

**File:** `src/pages/parent/ParentDashboardPage.tsx`

**Persisted data currently used:**

- Calls `getParentChildren(user.id)` to load child records from `students`.
- Maps each child to a local display model:
  - `id`
  - `studentId`
  - `firstName`
  - `lastName`
  - `grade`
  - `parentId`
  - `streakDays` (currently hardcoded to `0` for loaded children)
  - `progress` (currently hardcoded to `0` for loaded children)

**Mock data currently used:**

- `subjectPerformanceChart`
- `weeklyTrend`
- `recentActivity`
- `aiRecommendations`
- `initialAssignments`

Derived dashboard values are therefore mock-based:

- Completed assignment count
- Pending assignment count
- Average performance
- Upcoming assignments
- Weekly hours goal/completed
- Subject performance chart
- Progress-over-time chart
- Recent activity
- AI recommendations

**Parent-child selector behavior:**

- There is no standalone selector component.
- The dashboard renders all loaded child profiles in a “My Children” card.
- Each child has a “View [name]’s dashboard” link to:

```text
/child?studentId=<child.studentId>
```

- `primaryChild` is simply `children[0]`; there is no explicit selected-child state on the parent dashboard.
- The child progress page uses the `studentId` query parameter as its selector.

**Child creation flow:**

- Opens a modal with first name, last name, and grade.
- Calls the `create-student` Edge Function with `{ full_name, grade }`.
- Displays returned `student_id` and `temporary_credential`.
- Newly created child state is held locally until reload; the creation itself is persisted by the Edge Function.

### Parent reports page

**File:** `src/pages/reports/ReportsPage.tsx`

**Current behavior:**

- Uses `getMockStudents()` to find the first mock child whose `parentId` matches the authenticated parent ID.
- Uses `initialAssignments` for completed assignment count.
- Uses mock chart datasets:
  - `monthlyTrend`
  - `weeklyTrend`
  - `subjectPerformanceChart`
  - `assignmentCompletionDonut`
- Uses mock `aiRecommendations`.
- Calculates monthly hours from the mock child progress value.
- “Download report” only calls `window.print()`; it does not create a file or call a reporting backend.

**Backend integration needs:**

- Replace `getMockStudents()` child lookup with `getParentChildren(user.id)`.
- Add explicit child selection, likely reusing a query parameter or shared selector state.
- Query child assignments, progress, activity, and assessment attempts for the selected child.
- Calculate report metrics from persisted records.
- Decide whether AI recommendations are generated live, stored, or omitted when no persisted data exists.
- Preserve print/download behavior or add a server-generated report export separately.

### Child progress page

**File:** `src/pages/child/ChildProgressPage.tsx`

**Current behavior:**

- Reads `studentId` from `useSearchParams()`.
- If missing, shows “Select a child profile from the parent dashboard.”
- In parallel, queries:
  - `students` for `full_name,grade`
  - `getChildAssignments(studentId)`
  - `getChildProgress(studentId)`
  - `getChildActivity(studentId)`
- Displays:
  - Total recorded activity minutes
  - Assignment count
  - Progress record count
  - Per-content progress bars
  - Assignment list/status/score
  - Activity records

**Security requirement:**

The page currently trusts the query parameter as an input to its Supabase queries. Backend/RLS policies must ensure the authenticated parent can only read children actually associated with that parent. If RLS does not fully enforce that relationship, add a server-side parent-child authorization check before exposing data.

---

## Supabase client and environment

**File:** `src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
```

The frontend expects:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The Edge Functions are invoked through this same client. The backend agent should verify that local/development/production frontend values all point to the intended Supabase project.

---

## Shared data models and backend-facing shapes

### User model

**File:** `src/types/index.ts`

```ts
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'parent' | 'student' | 'child' | 'admin'
  studentId?: string
  grade?: string | null
  pin?: string
}
```

Authentication state is provided by `src/contexts/AuthContext.tsx`. Backend queries should use the authenticated Supabase user/session and avoid trusting client-supplied parent/student IDs for authorization.

### Assignment record model

**File:** `src/lib/learning-data.ts`

```ts
export interface StudentAssignmentRecord {
  id: string
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue'
  score: number | null
  submittedAt: string | null
  assignment: {
    id: string
    title: string
    description: string | null
    subject: string
    grade: string | null
    dueDate: string | null
    difficulty: string | null
  } | null
}
```

The detail variant adds `learningContent`, including nullable string content:

```ts
learningContent: {
  id: string
  title: string
  description: string | null
  subject: string
  grade: string | null
  content: string | null
} | null
```

### Database tables currently referenced by frontend code

- `students`
- `student_assignments`
- `assignments`
- `learning_content`
- `student_progress`
- `learning_activity`

The frontend also invokes these Edge Functions:

- `create-student`
- `student-login`
- `submit-assessment`

### Migrations

Relevant migration files are present under `supabase/migrations/`:

- `20260813000000_create_students_foundation.sql`
- `20260816000000_b6_learning_foundation_UPDATED.sql`

The backend agent should inspect these migrations and the live Supabase schema before implementing queries or schema changes. The frontend report intentionally does not infer columns beyond those already selected in the frontend helpers.

---

## Recommended backend implementation order

1. **Verify Supabase project and schema**
   - Confirm production `VITE_SUPABASE_URL` project reference.
   - Inspect live tables, relationships, RLS policies, and Edge Function deployments.

2. **Stabilize student assessment persistence**
   - Verify `submit-assessment` request and response contract.
   - Ensure `isCorrect`, `score`, and `persistenceResult` are returned.
   - Confirm assignment status/score persistence updates are visible through student queries.

3. **Replace parent assignment mock state**
   - Add authenticated parent/teacher assignment reads and writes.
   - Define assignment creation and student-assignment assignment semantics.

4. **Replace student dashboard placeholders**
   - Aggregate persisted assignments, progress, and activity.
   - Keep student scoping server/RLS-enforced.

5. **Replace parent dashboard/report mocks**
   - Add a selected child model.
   - Read child-specific assignments, progress, activity, and assessment results.
   - Calculate charts from persisted records.

6. **Harden parent-child authorization**
   - Ensure `studentId` query parameters cannot expose another parent’s child.
   - Prefer RLS or a server-side authorized RPC for parent-child data access.

## Files that should not be changed casually

- `src/pages/student/StudentAssessmentPage.tsx` — current answer capture and submission flow.
- `src/lib/assessment.ts` — current Edge Function request contract and response normalization.
- `src/lib/lesson-content.ts` — assessment content parsing and assessable-section rules.
- `supabase/functions/submit-assessment/index.ts` — scoring and persistence contract.
- `src/lib/supabase.ts` — shared client/environment contract.

Changes to these files should be coordinated because the assessment flow has already had production regressions related to response shape and unreachable execution flow.

## Handoff conclusion

The student assessment and student learning read paths are the most backend-ready portions of the frontend. The parent dashboard, parent reports, and parent assignment manager are the largest mock-data surfaces and should be migrated to persisted data without changing the student answer capture or assessment scoring contract. The highest-priority security check is enforcing parent-to-child authorization for all `studentId`-based reads.
