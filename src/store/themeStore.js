import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useThemeStore = create()(persist((set) => ({
    isDarkMode: true, // 기본값을 true로 변경
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}), {
    name: 'theme-storage',
}));
