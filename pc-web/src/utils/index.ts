export const formatDate = (date: string | number | Date) => {
  const target = new Date(date)
  const y = target.getFullYear()
  const m = String(target.getMonth() + 1).padStart(2, '0')
  const d = String(target.getDate()).padStart(2, '0')
  const hh = String(target.getHours()).padStart(2, '0')
  const mm = String(target.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

export const randomId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`
}

export * from './excel'
