/** App calendar/display zone: fixed UTC+1 (no daylight saving). */
export const APP_TIME_ZONE = 'Africa/Lagos'
/** User-facing label for the app timezone. */
export const APP_TIME_ZONE_LABEL = 'UTC+1'

/** @deprecated Use APP_TIME_ZONE */
export const NIGERIA_TIME_ZONE = APP_TIME_ZONE

export function getAppHour(date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: APP_TIME_ZONE,
      hour: 'numeric',
      hour12: false,
    }).format(date),
  )
}

/** @deprecated Use getAppHour */
export function getNigeriaHour(date = new Date()): number {
  return getAppHour(date)
}

export function getAppGreeting(date = new Date()): string {
  const hour = getAppHour(date)
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/** @deprecated Use getAppGreeting */
export function getNigeriaGreeting(date = new Date()): string {
  return getAppGreeting(date)
}

export function formatAppTime(timestamp: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(typeof timestamp === 'string' ? new Date(timestamp) : timestamp)
}

/** @deprecated Use formatAppTime */
export function formatNigeriaTime(timestamp: string | Date): string {
  return formatAppTime(timestamp)
}

export function formatAppDate(timestamp: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    dateStyle: 'medium',
  }).format(typeof timestamp === 'string' ? new Date(timestamp) : timestamp)
}

/** @deprecated Use formatAppDate */
export function formatNigeriaDate(timestamp: string | Date): string {
  return formatAppDate(timestamp)
}
