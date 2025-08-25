import React from 'react';
export type ToastType = 'success' | 'error' | 'info';
interface ToastContextValue {
    show: (message: string, type?: ToastType, durationMs?: number) => void;
    success: (message: string, durationMs?: number) => void;
    error: (message: string, durationMs?: number) => void;
    info: (message: string, durationMs?: number) => void;
}
export declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useToast(): ToastContextValue;
export {};
