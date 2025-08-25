import React from 'react';
interface ModalProps {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
    centerTitle?: boolean;
}
export default function Modal({ open, title, onClose, children, width, centerTitle }: ModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
