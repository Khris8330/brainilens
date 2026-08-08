import type {
  Subject,
  Assignment,
  WeeklyLearningEntry,
  Achievement,
  ActivityItem,
} from '@/types'
import type { BarChartData } from '@/components/charts'
import type { LineChartData } from '@/components/charts'
import type { DonutSegment } from '@/components/charts'

export interface MockStudent {
  id: string
  studentId: string
  pin: string
  firstName: string
  lastName: string
  grade: number
  parentId: string
  streakDays: number
  progress: number
}

export const mockStudents: MockStudent[] = [
  { id: 'student-001', studentId: 'STU-1001', pin: '1234', firstName: 'Alex', lastName: 'Johnson', grade: 6, parentId: 'parent-001', streakDays: 7, progress: 72 },
  { id: 'student-002', studentId: 'STU-1002', pin: '5678', firstName: 'Maya', lastName: 'Johnson', grade: 4, parentId: 'parent-001', streakDays: 4, progress: 61 },
]

export function addMockStudent(student: MockStudent) {
  mockStudents.push(student)
}

export const mockChild = {
  name: 'Emma Johnson',
  grade: '4th Grade',
  streakDays: 12,
  weeklyHoursGoal: 8,
  weeklyHoursCompleted: 6.5,
}

export const subjects: Subject[] = [
  { name: 'Math', mastery: 78, color: '#2563eb' },
  { name: 'Reading', mastery: 88, color: '#14b8a6' },
  { name: 'Science', mastery: 65, color: '#f59e0b' },
  { name: 'Writing', mastery: 72, color: '#8b5cf6' },
]

export const subjectPerformanceChart: BarChartData[] = subjects.map((s) => ({
  label: s.name,
  value: s.mastery,
  color: s.color,
}))

export const weeklyTrend: LineChartData[] = [
  { label: 'Wk 1', value: 62 },
  { label: 'Wk 2', value: 68 },
  { label: 'Wk 3', value: 64 },
  { label: 'Wk 4', value: 74 },
  { label: 'Wk 5', value: 79 },
  { label: 'Wk 6', value: 84 },
]

export const monthlyTrend: LineChartData[] = [
  { label: 'Mar', value: 58 },
  { label: 'Apr', value: 66 },
  { label: 'May', value: 71 },
  { label: 'Jun', value: 79 },
  { label: 'Jul', value: 84 },
]

export const assignmentCompletionDonut: DonutSegment[] = [
  { label: 'Completed', value: 68, color: '#14b8a6' },
  { label: 'In progress', value: 20, color: '#f59e0b' },
  { label: 'Pending', value: 12, color: '#e2e8f0' },
]

export const recentActivity: ActivityItem[] = [
  { id: '1', description: 'Emma completed "Fractions Practice Set 3" , scored 92%', timestamp: '2 hours ago' },
  { id: '2', description: 'Weekly learning check-in submitted for Science', timestamp: 'Yesterday' },
  { id: '3', description: 'AI Study Companion session on long division (18 min)', timestamp: '2 days ago' },
  { id: '4', description: 'New assignment generated: "Reading Comprehension: Ecosystems"', timestamp: '3 days ago' },
]

export const aiRecommendations: string[] = [
  'Spend 15 extra minutes this week on long division , accuracy dipped slightly on the last two attempts.',
  'Reading comprehension is strong; consider introducing a chapter book above current grade level.',
  'Science vocabulary retention would benefit from short daily flashcard review.',
]

export const achievements: Achievement[] = [
  { title: '7-Day Streak', description: 'Studied 7 days in a row', earned: true, date: 'Jul 28' },
  { title: 'Math Whiz', description: 'Scored 90%+ on 3 math assignments', earned: true, date: 'Jul 15' },
  { title: 'Bookworm', description: 'Completed 5 reading assignments', earned: true, date: 'Jun 30' },
  { title: 'Science Explorer', description: 'Master 10 science topics', earned: false },
]

export const initialWeeklyLearning: WeeklyLearningEntry[] = [
  {
    id: 'wl-1',
    week: 'Week of Aug 3',
    subject: 'Math',
    topic: 'Multiplying Fractions',
    description: 'Practiced multiplying fractions with visual models and word problems.',
    hours: 2.5,
    understanding: 4,
    notes: 'Needs a bit more practice with mixed numbers.',
  },
  {
    id: 'wl-2',
    week: 'Week of Aug 3',
    subject: 'Reading',
    topic: 'Character Analysis',
    description: 'Read two short stories and discussed character motivation.',
    hours: 1.5,
    understanding: 5,
    notes: 'Really engaged with this one.',
  },
  {
    id: 'wl-3',
    week: 'Week of Jul 27',
    subject: 'Science',
    topic: 'Water Cycle',
    description: 'Learned the stages of the water cycle and built a diagram.',
    hours: 1,
    understanding: 3,
    notes: 'Could use a follow-up video on evaporation vs. condensation.',
  },
]

export const initialAssignments: Assignment[] = [
  {
    id: 'as-1',
    subject: 'Math',
    title: 'Fractions Practice Set 4',
    description: 'Ten problems covering multiplying and simplifying fractions.',
    dueDate: '2026-08-12',
    difficulty: 'medium',
    status: 'pending',
  },
  {
    id: 'as-2',
    subject: 'Reading',
    title: 'Reading Comprehension: Ecosystems',
    description: 'Read the passage and answer five comprehension questions.',
    dueDate: '2026-08-10',
    difficulty: 'easy',
    status: 'in-progress',
  },
  {
    id: 'as-3',
    subject: 'Science',
    title: 'Water Cycle Diagram Quiz',
    description: 'Label the stages of the water cycle from memory.',
    dueDate: '2026-08-05',
    difficulty: 'easy',
    status: 'completed',
    score: 90,
  },
  {
    id: 'as-4',
    subject: 'Math',
    title: 'Long Division Challenge',
    description: 'Five multi-step long division problems with remainders.',
    dueDate: '2026-08-15',
    difficulty: 'hard',
    status: 'pending',
  },
  {
    id: 'as-5',
    subject: 'Writing',
    title: 'Persuasive Paragraph',
    description: 'Write a short paragraph persuading a friend to try a new hobby.',
    dueDate: '2026-08-02',
    difficulty: 'medium',
    status: 'completed',
    score: 85,
  },
]
