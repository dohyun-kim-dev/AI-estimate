export const APP_CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  APP_NAME: 'AI Project',
  APP_DESCRIPTION: 'Vite based AI Project',
  DEFAULT_LANGUAGE: 'ko',
  DEFAULT_THEME: 'light',
} as const
