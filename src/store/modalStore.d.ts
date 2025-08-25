interface ModalState {
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}
export declare const useModalStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ModalState>>;
export {};
