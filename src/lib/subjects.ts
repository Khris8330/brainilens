/** Canonical subject list for parent filters and create forms. Not mock analytics. */

export const SUBJECT_NAMES = [
  'Math',
  'Reading',
  'Science',
  'Writing',
  'Social Studies',
  'English',
] as const

export type SubjectName = (typeof SUBJECT_NAMES)[number]

export const SUBJECT_SELECT_OPTIONS = SUBJECT_NAMES.map((name) => ({
  value: name,
  label: name,
}))

/** Filter options: All + canonical list + any extra subjects seen on real rows. */
export function subjectFilterOptions(extra: string[] = []) {
  const seen = new Set<string>(SUBJECT_NAMES)
  const extras = extra
    .map((s) => s.trim())
    .filter((s) => s && !seen.has(s))
  extras.forEach((s) => seen.add(s))
  return [
    { value: 'all', label: 'All subjects' },
    ...SUBJECT_NAMES.map((name) => ({ value: name, label: name })),
    ...extras.map((name) => ({ value: name, label: name })),
  ]
}
