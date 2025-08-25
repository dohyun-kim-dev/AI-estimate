interface SelectionFieldProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    leftLabel: string;
    rightLabel: string;
    labelColor?: string;
    $labelPosition?: 'vertical' | 'horizontal';
}
export declare const SelectionField: ({ value, onChange, label, leftLabel, rightLabel, labelColor, $labelPosition, }: SelectionFieldProps) => import("react/jsx-runtime").JSX.Element;
export default SelectionField;
