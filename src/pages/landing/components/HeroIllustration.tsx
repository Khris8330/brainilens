import { motion } from 'framer-motion'

export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 440"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="Illustration of a parent and child sitting together at a desk, looking at a tablet that shows a rising weekly progress chart"
    >
      {/* soft backdrop */}
      <circle cx="240" cy="210" r="200" fill="#dbeafe" opacity="0.6" />
      <circle cx="360" cy="90" r="46" fill="#fef3c7" opacity="0.8" />

      {/* desk */}
      <rect x="60" y="330" width="360" height="16" rx="8" fill="#e2e8f0" />
      <rect x="86" y="346" width="18" height="60" rx="4" fill="#cbd5e1" />
      <rect x="376" y="346" width="18" height="60" rx="4" fill="#cbd5e1" />

      {/* plant */}
      <g>
        <rect x="392" y="292" width="34" height="38" rx="6" fill="#0d9488" />
        <path
          d="M409 292c0-18-16-30-16-30s-4 20 6 30 10 0 10 0zM409 292c0-16 18-26 18-26s6 18-4 26-14 0-14 0z"
          fill="#14b8a6"
        />
      </g>

      {/* adult figure */}
      <g>
        <ellipse cx="140" cy="330" rx="52" ry="14" fill="#0f172a" opacity="0.06" />
        <rect x="98" y="230" width="84" height="100" rx="30" fill="#2563eb" />
        <circle cx="140" cy="196" r="38" fill="#1d4ed8" />
        <path
          d="M104 190c0-22 16-40 36-40s36 18 36 40c0-8-4-14-10-14-8 10-22 12-26 12-6 0-22-2-26-12-6 0-10 6-10 14z"
          fill="#0f172a"
        />
      </g>

      {/* child figure */}
      <g>
        <ellipse cx="255" cy="336" rx="42" ry="12" fill="#0f172a" opacity="0.06" />
        <rect x="222" y="256" width="66" height="82" rx="26" fill="#f59e0b" />
        <circle cx="255" cy="228" r="30" fill="#d97706" />
        <path
          d="M228 224c0-16 12-30 27-30s27 14 27 30c-6-6-16-8-27-8s-21 2-27 8z"
          fill="#0f172a"
        />
      </g>

      {/* shared desk surface items */}
      <rect x="150" y="300" width="150" height="10" rx="5" fill="#f1f5f9" />

      {/* tablet showing weekly growth */}
      <motion.g
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <rect
          x="176"
          y="248"
          width="112"
          height="78"
          rx="12"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <path
          d="M190 306l18-22 16 12 20-28 18 10"
          stroke="#14b8a6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="262" cy="278" r="4" fill="#2563eb" />
      </motion.g>

      {/* sparkles = AI */}
      <motion.g
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M336 168l4 12 12 4-12 4-4 12-4-12-12-4 12-4z"
          fill="#f59e0b"
        />
      </motion.g>
      <motion.g
        animate={{ opacity: [1, 0.4, 1], scale: [1.05, 0.9, 1.05] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        <path d="M84 150l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#2563eb" />
      </motion.g>
    </svg>
  )
}
