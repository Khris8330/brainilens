import { FAQAccordion } from '../components/FAQAccordion'

const faqs = [
  {
    question: 'How much time does the weekly check-in take?',
    answer:
      'Most children complete their weekly learning check-in in five to ten minutes. It covers what they studied, how confident they feel, and any assignments completed that week.',
  },
  {
    question: 'Do I need to enter grades or reports myself?',
    answer:
      'No. Assignments are generated based on your child\u2019s weekly check-ins, and the AI evaluates responses automatically. You can add context manually if you\u2019d like, but it isn\u2019t required.',
  },
  {
    question: 'What age range is Growth Tracker AI designed for?',
    answer:
      'Growth Tracker AI works well for children from early elementary through middle school. Younger children can complete check-ins with a parent alongside them.',
  },
  {
    question: 'Can I use this for more than one child?',
    answer:
      'Yes. The Starter plan includes one child profile, and the Family plan supports up to four \u2014 each with its own independent tracking, assignments, and reports.',
  },
  {
    question: 'Is my child\u2019s data kept private?',
    answer:
      'Yes. Learning data is only visible to the parent account and, for School plans, the assigned teacher. We never sell student data or use it for advertising.',
  },
  {
    question: 'Can schools use this with an entire classroom?',
    answer:
      'Yes \u2014 the School plan adds a teacher dashboard and district-level reporting for rolling this out to a full classroom or grade level.',
  },
]

export function FAQSection() {
  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-4 text-lg text-text-muted">
            Everything parents ask before getting started.
          </p>
        </div>

        <div className="mt-12">
          <FAQAccordion items={faqs} />
        </div>
      </div>
    </section>
  )
}
