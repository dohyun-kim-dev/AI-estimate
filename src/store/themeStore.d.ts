interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
}
export declare const useThemeStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ThemeState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ThemeState, ThemeState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ThemeState) => void) => () => void;
        onFinishHydration: (fn: (state: ThemeState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<ThemeState, ThemeState>>;
    };
}>;
export {};
