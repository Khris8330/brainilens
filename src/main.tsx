import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, readStoredTheme } from '@/lib/settings'

// Apply saved appearance before first paint to avoid a light-mode flash
applyTheme(readStoredTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out the HTML boot splash once React has mounted
const splash = document.getElementById('boot-splash')
if (splash) {
  requestAnimationFrame(() => {
    splash.classList.add('is-hidden')
    window.setTimeout(() => splash.remove(), 400)
  })
}

// Lightweight SW for offline shell (production only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
