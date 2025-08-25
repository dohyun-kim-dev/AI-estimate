import React from 'react';
interface SelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    $height?: string;
    $radius?: string;
    $triggerFontSize?: string;
    $triggerFontWeight?: string;
    $triggerTextColor?: string;
    $triggerBackgroundColor?: string;
    $triggerHoverBackgroundColor?: string;
    $triggerHoverTextColor?: string;
    $contentFontSize?: string;
    $contentFontWeight?: string;
    $contentTextColor?: string;
    $contentBackgroundColor?: string;
    $itemHoverBackgroundColor?: string;
    $itemHoverTextColor?: string;
    $isShowIcon?: boolean;
    $triggerContent?: React.ReactNode;
}
export declare const SimpleSelect: ({ options, value, onChange, placeholder, $height, $radius, $triggerFontSize, $triggerFontWeight, $triggerTextColor, $triggerBackgroundColor, $triggerHoverBackgroundColor, $triggerHoverTextColor, $contentFontSize, $contentFontWeight, $contentTextColor, $contentBackgroundColor, $itemHoverBackgroundColor, $itemHoverTextColor, $isShowIcon, $triggerContent, }: SelectProps) => import("react/jsx-runtime").JSX.Element;
export {};
