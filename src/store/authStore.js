import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    isAdditionalInfoModalOpen: false,
    login: (userData) => set({
        user: {
            ...userData,
            isLoggedIn: true,
        },
    }),
    logout: () => set({
        user: null,
    }),
    isAuthenticated: () => {
        const state = get();
        return !!(state.user?.isLoggedIn && state.user?.cellphone);
    },
    openAdditionalInfoModal: () => set({
        isAdditionalInfoModalOpen: true,
    }),
    closeAdditionalInfoModal: () => set({
        isAdditionalInfoModalOpen: false,
    }),
}), {
    name: 'auth-storage',
    partialize: (state) => ({ user: state.user }), // 로그인 상태만 저장
}));
