import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { footerLinks } from '@/data/navigation'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap
                  className="size-5 text-white"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-semibold text-text">
                Growth Tracker AI
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-text-muted">
              Empowering parents and children with AI-driven learning insights
              and growth tracking.
            </p>
          </div>

          <FooterColumn title="Features" links={footerLinks.features} />
          <FooterColumn title="Company" links={footerLinks.company} />
          <FooterColumn title="Resources" links={footerLinks.resources} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Learning Growth Tracker AI. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-text">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
