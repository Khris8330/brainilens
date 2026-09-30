# brainilens data retention and deletion policy

Version: 2026-09  
Status: Milestone 2 documented policy (manual deletion path first; automation can follow)

## Scope

This policy covers parent accounts and all linked student (child) data in the production Supabase project.

## What we store

- Parent profile: name, email, role, consent timestamp/version, settings preferences
- Student profile: name, grade, student login id, link to parent
- Learning data: plan items, generated content, assignments, student_assignments, progress, activity, assessment attempts
- Optional Lens AI chat content sent by the user during a session (not retained as a permanent chat archive in M2 unless already persisted by a feature)

## Active accounts

Data is retained while the parent account remains active so the product can provide learning history and reports.

## Parent-requested deletion

Parents can request full account and child data deletion from **Settings → Account & data**.

Current path (Milestone 2):

1. Parent opens Settings and uses the deletion request action (mailto to privacy@brainilens.app), or emails the same address directly.
2. Support verifies the requester owns the account (authenticated email match).
3. Within **30 days** of a verified request, operators delete:
   - `auth.users` row for the parent (cascades/triggers as configured)
   - `profiles` row for the parent
   - linked `students` rows for that parent
   - related rows in `learning_plan_items`, `student_assignments`, `student_progress`, `learning_activity`, `student_assessment_attempts`, and orphaned assignment/content records created solely for those students where safe to remove
4. Confirmation is sent to the parent email on file.

Until a self-serve hard-delete is built, this manual path is the official process and must be honored.

## Cascade intent

When a parent account is removed, student learning records for that parent’s children must not remain orphaned under that parent’s identity. Prefer cascade deletes via foreign keys where present; otherwise delete in dependency order.

## Backups

System backups may retain encrypted snapshots for up to **30 days** after deletion. After that window, deleted personal data is not recoverable from routine backups.

## Legal holds

If a lawful preservation request applies, deletion may be delayed only for the affected records and only for the duration required.

## Marketing

No children’s data is used for third-party advertising. Parental contact email may be used for product/account messages according to notification preferences.
