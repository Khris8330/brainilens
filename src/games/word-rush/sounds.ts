/** Lightweight Web Audio feedback + soft background loop for Word Rush. */

let ctx: AudioContext | null = null
let muted = false
let musicMuted = false
let musicTimer: number | null = null
let musicStep = 0

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
  if (value) stopMusic()
  else if (!musicMuted) startMusic()
}

export function isMusicMuted(): boolean {
  if (typeof window === 'undefined') return true
  return musicMuted || localStorage.getItem('brainilens_word_rush_music_mute') === '1'
}

export function setMusicMuted(value: boolean): void {
  musicMuted = value
  if (typeof window !== 'undefined') {
    localStorage.setItem('brainilens_word_rush_music_mute', value ? '1' : '0')
  }
  if (value) stopMusic()
  else if (!isSoundMuted()) startMusic()
}

export function initSoundMuteFromStorage(): { sfx: boolean; music: boolean } {
  muted = typeof window !== 'undefined' && localStorage.getItem('brainilens_word_rush_mute') === '1'
  musicMuted =
    typeof window !== 'undefined' && localStorage.getItem('brainilens_word_rush_music_mute') === '1'
  return { sfx: muted, music: musicMuted }
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

/** Soft looping arpeggio (C major feel) - very low volume. */
const MUSIC_NOTES = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]

function playMusicNote(frequency: number) {
  if (isSoundMuted() || isMusicMuted()) return
  const audio = getCtx()
  if (!audio) return
  const now = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.018, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(now)
  osc.stop(now + 0.5)
}

export function startMusic() {
  if (typeof window === 'undefined') return
  if (isSoundMuted() || isMusicMuted()) return
  if (musicTimer !== null) return
  getCtx()
  musicStep = 0
  musicTimer = window.setInterval(() => {
    if (isSoundMuted() || isMusicMuted()) return
    playMusicNote(MUSIC_NOTES[musicStep % MUSIC_NOTES.length])
    musicStep += 1
  }, 420)
}

export function stopMusic() {
  if (musicTimer !== null && typeof window !== 'undefined') {
    window.clearInterval(musicTimer)
    musicTimer = null
  }
}
