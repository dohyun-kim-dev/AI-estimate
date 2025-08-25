import React from 'react';
interface PageLoaderContextValue {
    open: () => void;
    close: () => void;
}
export declare const pageLoaderController: {
    open: () => void;
    close: () => void;
};
export declare function PageLoaderProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function usePageLoader(): PageLoaderContextValue;
export {};
