import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, UserPlus } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Select,
} from '@/components/ui'
import { StudentCredentialsPanel } from '@/components/parent/StudentCredentialsPanel'
import { useAuth } from '@/contexts/AuthContext'
import { getChildReportSummary, type ChildReportSummary } from '@/lib/learning-data'
import { createStudent, regenerateStudentPassword, type CreatedStudentCredentials } from '@/lib/students'
import {
  SCHOOL_MAX_STUDENTS,
  getTeacherClassroom,
  getTeacherStudents,
  upsertTeacherClassroom,
  type TeacherClassroom,
} from '@/lib/teacher'
import { routes } from '@/routes'

const emptyReport: ChildReportSummary = {
  assignmentCounts: { completed: 0, inProgress: 0, pending: 0 },
  averageScore: 0,
  subjectPerformance: [],
  weeklyActivity: [],
  monthlyTrend: [],
  recentActivity: [],
}

type StudentRow = { id: string; studentId: string; name: string; grade: string }

export function TeacherDashboardPage() {
  const { user } = useAuth()
  const [classroom, setClassroom] = useState<TeacherClassroom | null>(null)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [report, setReport] = useState(emptyReport)
  const [error, setError] = useState('')
  const [setupName, setSetupName] = useState('')
  const [setupGrade, setSetupGrade] = useState('Grade 5')
  const [setupPupils, setSetupPupils] = useState('20')
  const [savingSetup, setSavingSetup] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [fullName, setFullName] = useState('')
  const [creating, setCreating] = useState(false)
  const [credentials, setCredentials] = useState<CreatedStudentCredentials | null>(null)
  const [resetting, setResetting] = useState(false)

  async function loadAll() {
    if (!user?.id) return
    const { data: room, error: roomError } = await getTeacherClassroom(user.id)
    if (roomError) {
      setError(roomError)
      return
    }
    setClassroom(room)
    if (room && !setupName) setSetupName(room.teacherDisplayName)

    const { data, error: stError } = await getTeacherStudents(user.id)
    if (stError) {
      setError('Students could not be loaded.')
      return
    }
    const next = (data ?? []).map((s) => ({
      id: s.id as string,
      studentId: s.student_id as string,
      name: s.full_name as string,
      grade: (s.grade as string) || room?.grade || 'Class',
    }))
    setStudents(next)
    if (!selectedId && next[0]) setSelectedId(next[0].id)
  }

  useEffect(() => {
    void loadAll()
  }, [user?.id])

  useEffect(() => {
    if (!selectedId) {
      setReport(emptyReport)
      return
    }
    void getChildReportSummary(selectedId).then(({ data }) => setReport(data ?? emptyReport))
  }, [selectedId])

  async function handleSetup(e: FormEvent) {
    e.preventDefault()
    setSavingSetup(true)
    setError('')
    const { data, error: upError } = await upsertTeacherClassroom({
      teacherDisplayName: setupName || user?.name || 'Teacher',
      grade: setupGrade,
      expectedPupils: Number(setupPupils) || 0,
    })
    setSavingSetup(false)
    if (upError || !data) {
      setError(upError ?? 'Could not save classroom')
      return
    }
    setClassroom(data)
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    if (students.length >= SCHOOL_MAX_STUDENTS) {
      setError(`School plan allows up to ${SCHOOL_MAX_STUDENTS} students.`)
      return
    }
    setCreating(true)
    setError('')
    const { data, error: createError } = await createStudent(fullName, classroom?.grade || '')
    setCreating(false)
    if (createError || !data) {
      setError(createError ?? 'Could not register student')
      return
    }
    setCredentials(data)
    setFullName('')
    setShowCreate(false)
    await loadAll()
  }

  async function handleResetPassword() {
    if (!selectedId) return
    setResetting(true)
    setError('')
    const { data, error: resetError } = await regenerateStudentPassword(selectedId)
    setResetting(false)
    if (resetError || !data) {
      setError(resetError ?? 'Could not reset password')
      return
    }
    setCredentials(data)
  }

  const selected = students.find((s) => s.id === selectedId)

  if (!classroom) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold text-text">Set up your classroom</h1>
        <p className="text-sm text-text-muted">
          Tell us your name, the class grade, and how many pupils you expect (max {SCHOOL_MAX_STUDENTS}).
        </p>
        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
        <Card>
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={(e) => void handleSetup(e)}>
              <Input
                label="Teacher name"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder={user?.name || 'Your name'}
                required
              />
              <Input
                label="Class grade"
                value={setupGrade}
                onChange={(e) => setSetupGrade(e.target.value)}
                placeholder="Grade 5"
                required
              />
              <Input
                label="Number of pupils"
                type="number"
                min={1}
                max={SCHOOL_MAX_STUDENTS}
                value={setupPupils}
                onChange={(e) => setSetupPupils(e.target.value)}
                required
              />
              <Button type="submit" isLoading={savingSetup} className="w-full">
                Save classroom
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            {classroom.teacherDisplayName}'s class
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {classroom.grade} · {students.length}/{SCHOOL_MAX_STUDENTS} students registered
            {classroom.expectedPupils ? ` (expected ${classroom.expectedPupils})` : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowCreate((v) => !v)}
          leftIcon={<UserPlus className="size-4" />}
          disabled={students.length >= SCHOOL_MAX_STUDENTS}
        >
          Register student
        </Button>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {credentials && (
        <StudentCredentialsPanel credentials={credentials} onDismiss={() => setCredentials(null)} />
      )}

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Register a student</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={(e) => void handleCreate(e)}>
              <Input
                label="Student full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                required
                className="flex-1"
              />
              <Button type="submit" isLoading={creating}>
                Create login
              </Button>
            </form>
            <p className="mt-2 text-xs text-text-muted">
              Unique Student ID and password are generated automatically. Grade defaults to {classroom.grade}.
            </p>
          </CardContent>
        </Card>
      )}

      {students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Register students to generate login credentials and assign class learning."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Select
                label="Student"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                options={students.map((s) => ({
                  value: s.id,
                  label: `${s.name} (${s.studentId})`,
                }))}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedId || resetting}
              onClick={() => void handleResetPassword()}
              leftIcon={<KeyRound className="size-4" />}
            >
              Reset password
            </Button>
          </div>

          {selected && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-text-muted">Average score</p>
                  <p className="text-2xl font-semibold text-text">{report.averageScore}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-text-muted">Completed</p>
                  <p className="text-2xl font-semibold text-text">
                    {report.assignmentCounts.completed}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-text-muted">In progress</p>
                  <p className="text-2xl font-semibold text-text">
                    {report.assignmentCounts.inProgress}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              to={routes.weeklyLearning}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text transition hover:bg-background"
            >
              Weekly Learning
            </Link>
            <Link
              to={routes.reports}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text transition hover:bg-background"
            >
              Reports
            </Link>
            <Link
              to={routes.assignments}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text transition hover:bg-background"
            >
              Assignments
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
