import { format } from 'date-fns'

export function safeFormat(dateInput: unknown, pattern: string, options?: unknown): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : (dateInput as Date)
    if (!(d instanceof Date) || isNaN(d.getTime())) return ''
    return format(d, pattern, options as any)
  } catch {
    return ''
  }
}
