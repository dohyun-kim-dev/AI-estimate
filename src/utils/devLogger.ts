export const devLog = (...args: any[]) => {
  if (import.meta.env.NODE_ENV !== 'production') {
     
    console.log(...args)
  }
}

export const devWarn = (...args: any[]) => {
  if (import.meta.env.NODE_ENV !== 'production') {
     
    console.warn(...args)
  }
}
