/**
 * DropdownInput은 커스텀 드롭다운입니다.
 * value, onChange, options, errorMessage 등 상태 및 동작을 포함하며,
 * 디자인 시스템을 따라 일관된 드롭다운 UI를 제공합니다.
 */
import React from 'react';
interface DropdownInputProps {
    value: string;
    onChange: (value: string) => void;
    options: {
        label: string;
        value: string;
    }[];
    width?: string;
    errorMessage?: string;
    $triggerBackgroundColor?: string;
    $triggerTextColor?: string;
    $triggerFontSize?: string;
    $triggerFontWeight?: string;
    $height?: string;
    $radius?: string;
    $isShowIcon?: boolean;
    $triggerHoverBackgroundColor?: string;
    $triggerHoverTextColor?: string;
    $contentBackgroundColor?: string;
    $contentTextColor?: string;
    $contentFontSize?: string;
    $contentFontWeight?: string;
    $itemHoverBackgroundColor?: string;
    $itemHoverTextColor?: string;
    $triggerContent?: React.ReactNode;
}
declare const DropdownInput: ({ value, onChange, options, width, errorMessage, $triggerBackgroundColor, $triggerTextColor, $triggerFontSize, $triggerFontWeight, $height, $radius, $isShowIcon, $triggerHoverBackgroundColor, $triggerHoverTextColor, $contentBackgroundColor, $contentTextColor, $contentFontSize, $contentFontWeight, $itemHoverBackgroundColor, $itemHoverTextColor, $triggerContent, }: DropdownInputProps) => import("react/jsx-runtime").JSX.Element;
export default DropdownInput;
