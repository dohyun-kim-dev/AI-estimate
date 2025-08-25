'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDevice } from '@/contexts/DeviceContext';
import DropdownFieldElement from '@/elements/DropdownFieldElement';
import { AppColors } from '@/styles/colors';
import { SimpleSelect } from '@/elements/RadixSelectElement';
const DropdownInput = ({ value, onChange, options, width, errorMessage, 
// trigger style
$triggerBackgroundColor, $triggerTextColor, $triggerFontSize, $triggerFontWeight, $height, $radius, $isShowIcon = true, $triggerHoverBackgroundColor, $triggerHoverTextColor, 
// content style
$contentBackgroundColor, $contentTextColor, $contentFontSize, $contentFontWeight, $itemHoverBackgroundColor, $itemHoverTextColor, 
// 추가된 props
$triggerContent, }) => {
    const device = useDevice();
    return (_jsxs(DropdownFieldElement, { "$device": device, "$backgroundColor": $triggerBackgroundColor, "$textColor": $triggerTextColor, style: { width }, children: [_jsx(SimpleSelect, { options: options.map((opt) => opt.label), value: options.find((opt) => opt.value === value)?.label || '', onChange: (label) => {
                    const selectedOption = options.find((opt) => opt.label === label);
                    if (selectedOption) {
                        onChange(selectedOption.value);
                    }
                }, "$height": $height, "$radius": $radius, "$triggerFontSize": $triggerFontSize, "$triggerFontWeight": $triggerFontWeight, "$triggerTextColor": $triggerTextColor, "$triggerBackgroundColor": $triggerBackgroundColor, "$triggerHoverBackgroundColor": $triggerHoverBackgroundColor, "$triggerHoverTextColor": $triggerHoverTextColor, "$isShowIcon": $isShowIcon, "$contentBackgroundColor": $contentBackgroundColor, "$contentTextColor": $contentTextColor, "$contentFontSize": $contentFontSize, "$contentFontWeight": $contentFontWeight, "$itemHoverBackgroundColor": $itemHoverBackgroundColor, "$itemHoverTextColor": $itemHoverTextColor, "$triggerContent": $triggerContent }), errorMessage && (_jsx("span", { style: {
                    color: AppColors.error,
                    marginTop: '4px',
                    fontSize: '12px',
                }, children: errorMessage }))] }));
};
export default DropdownInput;
