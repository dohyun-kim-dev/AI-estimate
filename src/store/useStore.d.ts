interface AppState {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}
export declare const useStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppState>>;
export {};
