import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useLanguageStore = create()(persist((set) => ({
    language: 'ko',
    setLanguage: (lang) => set({ language: lang }),
}), { name: 'language-storage' }));
