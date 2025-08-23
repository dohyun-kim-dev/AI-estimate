import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LanguageCode = 'ko' | 'en'

interface LanguageState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'language-storage' }
  )
)
