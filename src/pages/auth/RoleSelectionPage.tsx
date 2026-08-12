import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { routes } from '@/routes'

export function RoleSelectionPage() {
  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Welcome to BrainiLens</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Who are you?</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Choose your path to continue to the right sign-in experience.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <Link
            to={routes.login}
            state={{ role: 'parent' }}
            className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card focus-visible:outline-none"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-text">Parent / Guardian</h3>
                <p className="mt-1 text-sm leading-6 text-text-muted">
                  Track learning progress, assignments, and growth insights.
                </p>
              </div>
              <ArrowRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>

          <Link
            to={routes.login}
            state={{ role: 'student' }}
            className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-secondary/50 hover:shadow-card focus-visible:outline-none"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary-light text-secondary">
                <GraduationCap className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-text">Student</h3>
                <p className="mt-1 text-sm leading-6 text-text-muted">
                  Open your learning space, assignments, and AI companion.
                </p>
              </div>
              <ArrowRight className="mt-1 size-5 shrink-0 text-secondary transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-text-muted">
          You can switch paths later by signing out and choosing again.
        </p>
      </CardContent>
    </Card>
  )
}
