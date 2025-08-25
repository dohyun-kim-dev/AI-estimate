import React from "react";
interface AdBottomModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    backgroundColor?: string;
    isBlur?: boolean;
}
export declare const AdBottomModal: React.FC<AdBottomModalProps>;
export {};
