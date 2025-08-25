type ConfirmButtonProps = {
    title: string;
    content: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    width?: number;
    buttonLabel?: string;
    disabled?: boolean;
};
export default function ConfirmButton({ title, content, confirmText, cancelText, onConfirm, onCancel, width, buttonLabel, disabled, }: ConfirmButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
