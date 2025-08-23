export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const isServer = typeof window === 'undefined'
export const isClient = !isServer
