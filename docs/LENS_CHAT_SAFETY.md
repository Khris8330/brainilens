# Lens AI chat — safety notes

## Current (Milestone 2)

- `lens-chat` requires a signed-in user (`verify_jwt: true` + `auth.getUser()`).
- Each message is written to `public.lens_chat_logs` with:
  - `user_id`
  - `student_row_id` (when the caller is a student)
  - `role` (student | parent | unknown)
  - `message`
  - `reply` (filled after a successful model response)
  - `created_at`
- Client roles cannot read or write the log table (RLS deny-all for anon/authenticated).

## Fast-follow (not indefinitely deferred)

A real **content-safety layer** for an AI system that talks to children should include:

1. Pre-filter / classifier on student messages (self-harm, sexual content, grooming patterns, PII).
2. Post-filter on model replies before they reach the child.
3. Escalation path for parents (report a conversation → human review of `lens_chat_logs`).
4. Retention limits on logs aligned with the data retention policy.

Until that ships, logging exists so a reported concern can be investigated.
