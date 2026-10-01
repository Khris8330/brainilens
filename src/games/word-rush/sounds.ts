/** Lightweight Web Audio feedback for Word Rush. No external audio files. */

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return true
  return muted || localStorage.getItem('brainilens_word_rush_mute') === '1'
}

export function setSoundMuted(value: boolean): void {
  muted = value
  if (typeof window !== 'undefined') {
    localStorage.setItem('brainilens_word_rush_mute', value ? '1' : '0')
  }
}

export function initSoundMuteFromStorage(): boolean {
  muted = typeof window !== 'undefined' && localStorage.getItem('brainilens_word_rush_mute') === '1'
  return muted
}

function tone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gainValue = 0.08,
  startDelay = 0,
) {
  if (isSoundMuted()) return
  const audio = getCtx()
  if (!audio) return
  const now = audio.currentTime + startDelay
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(now)
  osc.stop(now + durationMs / 1000 + 0.02)
}

export function playCorrect() {
  tone(523.25, 90, 'sine', 0.09)
  tone(659.25, 120, 'sine', 0.08, 0.08)
}

export function playWrong() {
  tone(196, 160, 'triangle', 0.06)
}

export function playStreak() {
  tone(523.25, 70, 'sine', 0.07)
  tone(659.25, 70, 'sine', 0.07, 0.07)
  tone(783.99, 120, 'sine', 0.08, 0.14)
}

export function playRoundEnd() {
  tone(392, 100, 'sine', 0.07)
  tone(523.25, 100, 'sine', 0.07, 0.1)
  tone(659.25, 160, 'sine', 0.08, 0.2)
}
