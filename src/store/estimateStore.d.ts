import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
interface EstimateState {
    aiResponseText: string;
    projectEstimate: ProjectEstimate | null;
    projectPeriod: number;
    setAiResponseText: (text: string) => void;
    setProjectEstimate: (estimate: ProjectEstimate) => void;
    setProjectPeriod: (weeks: number) => void;
    reset: () => void;
}
export declare const useEstimateStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<EstimateState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<EstimateState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: EstimateState) => void) => () => void;
        onFinishHydration: (fn: (state: EstimateState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<EstimateState, unknown>>;
    };
}>;
export {};
