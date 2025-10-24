export const devLog = (...args: any[]) => {
  // Vite는 MODE를 사용하거나 VITE_ 접두사가 붙은 환경변수를 사용해야 함
  // if (import.meta.env.MODE !== 'production' && import.meta.env.VITE_ENV_NAME !== 'prod') {
    console.log(...args)
  // }
}

export const devWarn = (...args: any[]) => {
  if (import.meta.env.MODE !== 'production' && import.meta.env.VITE_ENV_NAME !== 'prod') {
    console.warn(...args)
  }
}

export const devError = (...args: any[]) => {
  if (import.meta.env.MODE !== 'production' && import.meta.env.VITE_ENV_NAME !== 'prod') {
    console.error(...args)
  }
}