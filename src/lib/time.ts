export const NIGERIA_TIME_ZONE = 'Africa/Lagos'

export function getNigeriaHour(date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-NG', {
    timeZone: NIGERIA_TIME_ZONE,
    hour: 'numeric',
    hour12: false,
  }).format(date))
}

export function getNigeriaGreeting(date = new Date()): string {
  const hour = getNigeriaHour(date)
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function formatNigeriaTime(timestamp: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    timeZone: NIGERIA_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(typeof timestamp === 'string' ? new Date(timestamp) : timestamp)
}

export function formatNigeriaDate(timestamp: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    timeZone: NIGERIA_TIME_ZONE,
    dateStyle: 'medium',
  }).format(typeof timestamp === 'string' ? new Date(timestamp) : timestamp)
}
