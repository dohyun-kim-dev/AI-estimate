import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { lightTheme, darkTheme } from '@/styles/theme'

interface ThemeState {
  isDarkMode: boolean
  theme: typeof lightTheme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      theme: lightTheme,
      toggleTheme: () =>
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          theme: state.isDarkMode ? lightTheme : darkTheme,
        })),
    }),
    {
      name: 'theme-storage',
    }
  )
)
