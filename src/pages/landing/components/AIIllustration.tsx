import { motion } from 'framer-motion'

export function AIIllustration() {
  return (
    <svg
      viewBox="0 0 440 400"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="Illustration of an AI study companion reviewing a child's answers and pointing out an area to improve"
    >
      <circle cx="220" cy="200" r="180" fill="#ccfbf1" opacity="0.55" />

      {/* companion body */}
      <motion.g
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="140" y="150" width="140" height="120" rx="34" fill="#2563eb" />
        <rect x="168" y="100" width="84" height="66" rx="20" fill="#1d4ed8" />
        <circle cx="196" cy="132" r="9" fill="#ffffff" />
        <circle cx="224" cy="132" r="9" fill="#ffffff" />
        <rect x="204" y="80" width="12" height="24" rx="6" fill="#14b8a6" />
        <circle cx="210" cy="76" r="8" fill="#f59e0b" />
        <rect x="120" y="180" width="24" height="60" rx="12" fill="#1d4ed8" />
        <rect x="276" y="180" width="24" height="60" rx="12" fill="#1d4ed8" />
      </motion.g>

      {/* speech bubble: recommendation */}
      <motion.g
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <rect
          x="256"
          y="90"
          width="150"
          height="86"
          rx="16"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <path d="M270 176l-14 20 24-10z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="272" y="110" width="110" height="8" rx="4" fill="#dbeafe" />
        <rect x="272" y="128" width="90" height="8" rx="4" fill="#dbeafe" />
        <rect x="272" y="146" width="70" height="8" rx="4" fill="#ccfbf1" />
      </motion.g>

      {/* progress card */}
      <g>
        <rect
          x="60"
          y="270"
          width="140"
          height="70"
          rx="14"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <text x="76" y="296" fontSize="11" fill="#64748b" fontFamily="Inter, sans-serif">
          Fractions
        </text>
        <rect x="76" y="306" width="108" height="8" rx="4" fill="#f1f5f9" />
        <rect x="76" y="306" width="78" height="8" rx="4" fill="#14b8a6" />
        <text x="76" y="330" fontSize="10" fill="#0d9488" fontFamily="Inter, sans-serif">
          72% mastered
        </text>
      </g>

      {/* sparkle */}
      <motion.path
        d="M338 220l3.5 10 10 3.5-10 3.5-3.5 10-3.5-10-10-3.5 10-3.5z"
        fill="#f59e0b"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  )
}
