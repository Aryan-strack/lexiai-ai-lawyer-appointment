import { format, formatDistance, formatRelative, isToday, isYesterday, isThisWeek } from 'date-fns'

// Format date to readable string
export function formatDate(date: Date | string | null, formatStr: string = 'PPP'): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

// Format time
export function formatTime(date: Date | string | null, formatStr: string = 'h:mm a'): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

// Format date and time together
export function formatDateTime(date: Date | string | null): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return `${formatDate(dateObj)} at ${formatTime(dateObj)}`
}

// Get relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

// Smart date formatter (Today, Yesterday, or date)
export function formatSmartDate(date: Date | string | null): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`
  }
  if (isYesterday(dateObj)) {
    return `Yesterday at ${formatTime(dateObj)}`
  }
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE') + ` at ${formatTime(dateObj)}`
  }
  return formatDateTime(dateObj)
}

// Format appointment duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins} minutes`
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${hours}h ${mins}m`
}

// Get time slots between start and end
export function getTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  
  while (start < end) {
    slots.push(format(start, 'h:mm a'))
    start.setMinutes(start.getMinutes() + intervalMinutes)
  }
  
  return slots
}

// Format date range
export function formatDateRange(startDate: Date | string | null, endDate: Date | string | null): string {
  if (!startDate || !endDate) return 'N/A - N/A'
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  if (format(start, 'MMMM yyyy') === format(end, 'MMMM yyyy')) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
  }
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
}