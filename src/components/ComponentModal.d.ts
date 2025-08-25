import { ReactNode } from "react";
interface ComponentModalProps {
    header: ReactNode;
    body: ReactNode;
    footer: ReactNode;
    onClose: () => void;
    color?: string;
    headerColor?: string;
    bodyColor?: string;
    footerColor?: string;
}
declare const ComponentModal: ({ header, body, footer, onClose, color, headerColor, bodyColor, footerColor, }: ComponentModalProps) => import("react/jsx-runtime").JSX.Element;
export default ComponentModal;
