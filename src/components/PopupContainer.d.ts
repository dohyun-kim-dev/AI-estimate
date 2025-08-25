import React from 'react';
interface PopupContainerProps {
    open: boolean;
    onClose: () => void;
    padding?: number;
    heightPercent?: number;
    appBarHeight?: number;
    selectedIndex: number;
    isFullScreen?: boolean;
    children: React.ReactNode | React.ReactNode[];
    onChangeIndex?: (newIndex: number) => void;
}
export declare const PopupContainer: React.FC<PopupContainerProps>;
export {};
