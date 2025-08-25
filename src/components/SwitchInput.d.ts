interface SwitchInputProps {
    value: 'Y' | 'N';
    onChange: (val: 'Y' | 'N') => void;
    label?: string;
    labelColor?: string;
    $labelPosition?: 'vertical' | 'horizontal';
}
export declare const SwitchInput: ({ value, onChange, label, labelColor, $labelPosition, }: SwitchInputProps) => import("react/jsx-runtime").JSX.Element;
export {};
