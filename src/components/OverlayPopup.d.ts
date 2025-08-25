import React from "react";
interface OverlayPopupProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}
export declare const OverlayPopup: React.FC<OverlayPopupProps>;
export {};
