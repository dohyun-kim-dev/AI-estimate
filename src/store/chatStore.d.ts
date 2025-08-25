export type ChatMessage = {
    role: 'user' | 'ai';
    content: string;
    isLoading?: boolean;
};
interface ChatState {
    messages: ChatMessage[];
    addMessage: (m: ChatMessage) => void;
    updateLastMessage: (newContent: string) => void;
    clear: () => void;
}
export declare const useChatStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ChatState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ChatState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ChatState) => void) => () => void;
        onFinishHydration: (fn: (state: ChatState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<ChatState, unknown>>;
    };
}>;
export {};
