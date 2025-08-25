export type LanguageCode = 'ko' | 'en';
interface LanguageState {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
}
export declare const useLanguageStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<LanguageState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<LanguageState, LanguageState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: LanguageState) => void) => () => void;
        onFinishHydration: (fn: (state: LanguageState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<LanguageState, LanguageState>>;
    };
}>;
export {};
