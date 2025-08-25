import { GoogleLoginResponse } from '@/lib/api/user/userApi.types';
export interface UserData extends GoogleLoginResponse {
    isLoggedIn: boolean;
    updateAt?: string;
    cellphone?: string;
}
interface AuthState {
    user: UserData | null;
    isAdditionalInfoModalOpen: boolean;
    login: (userData: GoogleLoginResponse) => void;
    logout: () => void;
    openAdditionalInfoModal: () => void;
    closeAdditionalInfoModal: () => void;
    isAuthenticated: () => boolean;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, {
            user: UserData | null;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, {
            user: UserData | null;
        }>>;
    };
}>;
export {};
