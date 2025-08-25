import React from 'react';
interface TextFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    errorMessage?: string;
    showSuffixIcon?: boolean;
    isPasswordField?: boolean;
    readOnly?: boolean;
    multiline?: boolean;
    minLines?: number;
    maxLines?: number;
    radius?: string;
    fontSize?: string;
    height?: string;
    padding?: string;
    paddingRight?: string;
    label?: string;
    labelColor?: string;
    $labelPosition?: 'vertical' | 'horizontal';
    $inputBackgroundColor?: string;
    $placeholderColor?: string;
    $textColor?: string;
    $borderColor?: string;
    autoComplete?: string;
}
export declare const TextField: React.FC<TextFieldProps>;
export {};
