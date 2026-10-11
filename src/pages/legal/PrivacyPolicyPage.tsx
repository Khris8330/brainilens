import { Link } from 'react-router-dom'
import { routes } from '@/routes'

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm text-text-muted">
        <Link to={routes.landing} className="text-primary hover:underline">
          Home
        </Link>{' '}
        / Privacy Policy
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-text">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated: 30 September 2026 · Version 2026-09</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-text">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Who we are</h2>
          <p>
            brainilens ("we", "us") provides a learning platform for parents and children.
            Parents create accounts and manage child learning profiles. Children use student
            accounts under parental supervision.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Children&apos;s data (COPPA-relevant)</h2>
          <p>
            We design the product for parent-directed use. We require a parent or legal guardian to
            create the account and to give explicit consent before child learning data is collected.
            We do not knowingly allow children under 13 to create independent parent accounts.
          </p>
          <p>Child-related data may include:</p>
          <ul className="list-disc space-y-1 pl-5 text-text-muted">
            <li>Name, grade level, and student login identifiers</li>
            <li>Learning topics, lessons, assignments, and progress records</li>
            <li>Assessment answers, scores, and activity timestamps</li>
            <li>Optional messages sent to the Lens AI learning companion</li>
          </ul>
          <p>
            We use this data only to provide educational features, show parents progress, and
            improve the learning experience. We do not sell children&apos;s personal information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Parent account data</h2>
          <p>
            Parent accounts store name, email, authentication credentials (handled by our auth
            provider), notification preferences, and recorded parental consent timestamps.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">How we use data</h2>
          <ul className="list-disc space-y-1 pl-5 text-text-muted">
            <li>Authenticate users and secure accounts</li>
            <li>Generate and deliver learning content and assessments</li>
            <li>Show parents reports and weekly insights</li>
            <li>Operate the Lens AI companion for study help</li>
            <li>Respond to support and deletion requests</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Sharing</h2>
          <p>
            We use infrastructure providers (hosting, database, authentication, AI inference) as
            processors to run the service. We do not sell personal data. We may disclose information
            if required by law or to protect the safety of a child or other users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Retention and deletion</h2>
          <p>
            We keep account and learning data while the parent account is active. Parents may request
            account and child data deletion from Settings. When a parent account is deleted, we
            delete or de-identify associated student profiles, assignments, progress, assessment
            attempts, and related learning records according to our retention policy. Backup copies
            may persist for a limited period before permanent removal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Your choices</h2>
          <p>
            Parents can update profile information, notification preferences, and request deletion
            from the in-app Settings page. For privacy questions or deletion requests, email{' '}
            <a className="text-primary hover:underline" href="mailto:privacy@brainilens.app">
              privacy@brainilens.app
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Changes</h2>
          <p>
            We may update this policy as the product evolves. Material changes that affect children
            will be reflected in the consent version shown at signup and linked from the product.
          </p>
        </section>
      </div>
    </div>
  )
}
