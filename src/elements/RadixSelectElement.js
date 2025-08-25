'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import styled from 'styled-components';
export const SimpleSelect = ({ options, value, onChange, placeholder = 'Select...', $height, $radius, $triggerFontSize, $triggerFontWeight, $triggerTextColor, $triggerBackgroundColor, $triggerHoverBackgroundColor, $triggerHoverTextColor, $contentFontSize, $contentFontWeight, $contentTextColor, $contentBackgroundColor, $itemHoverBackgroundColor, $itemHoverTextColor, $isShowIcon = true, $triggerContent, }) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const handleSelect = (option) => {
        onChange(option);
        setOpen(false);
    };
    return (_jsxs(Wrapper, { "$fixedWidth": !!$triggerContent, children: [_jsxs(Trigger, { ref: triggerRef, onClick: () => setOpen((prev) => !prev), "$height": $height, "$radius": $radius, "$triggerFontSize": $triggerFontSize, "$triggerFontWeight": $triggerFontWeight, "$triggerTextColor": $triggerTextColor, "$triggerBackgroundColor": $triggerBackgroundColor, "$triggerHoverBackgroundColor": $triggerHoverBackgroundColor, "$triggerHoverTextColor": $triggerHoverTextColor, children: [$triggerContent || value || placeholder, !$triggerContent && $isShowIcon && _jsx(Icon, { children: "\u25BE" })] }), open && (_jsx(DropdownContent, { "$contentBackgroundColor": $contentBackgroundColor, "$contentFontSize": $contentFontSize, "$contentFontWeight": $contentFontWeight, "$contentTextColor": $contentTextColor, children: options.map((option) => (_jsx(Item, { onClick: () => handleSelect(option), "$itemHoverBackgroundColor": $itemHoverBackgroundColor, "$itemHoverTextColor": $itemHoverTextColor, children: option }, option))) }))] }));
};
// -------------------------
// Styled
// -------------------------
const Wrapper = styled.div `
  position: relative;
  width: ${({ $fixedWidth }) => ($fixedWidth ? '100px' : '100%')};
`;
const Trigger = styled.button `
  display: flex;
  align-items: center;          // ✅ 수직 중앙 정렬
  justify-content: center;      // ✅ 가운데 배치 (triggerContent 기준)
  width: 100%;
  height: ${({ $height }) => $height || '36px'};
  padding: 0 16px;
  border-radius: ${({ $radius }) => $radius || '6px'};
  background-color: ${({ $triggerBackgroundColor }) => $triggerBackgroundColor || 'white'};
  border: 1px solid ${({ $triggerBackgroundColor }) => $triggerBackgroundColor || '#ccc'};
  color: ${({ $triggerTextColor }) => $triggerTextColor || '#000'};
  font-size: ${({ $triggerFontSize }) => $triggerFontSize || '14px'};
  font-weight: ${({ $triggerFontWeight }) => $triggerFontWeight || '400'};
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    background-color: ${({ $triggerHoverBackgroundColor }) => $triggerHoverBackgroundColor || 'transparent'};
    color: ${({ $triggerHoverTextColor }) => $triggerHoverTextColor || 'inherit'};
  }
`;
const Icon = styled.span `
  margin-left: 8px;
  font-size: 12px;
  pointer-events: none;
`;
const DropdownContent = styled.div `
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: ${({ $contentBackgroundColor }) => $contentBackgroundColor || 'white'};
  color: ${({ $contentTextColor }) => $contentTextColor || '#000'};
  font-size: ${({ $contentFontSize }) => $contentFontSize || '14px'};
  font-weight: ${({ $contentFontWeight }) => $contentFontWeight || '400'};
  max-height: 200px;
  overflow-y: auto;
`;
const Item = styled.div `
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    background-color: ${({ $itemHoverBackgroundColor }) => $itemHoverBackgroundColor || '#f0f0f0'};
    color: ${({ $itemHoverTextColor }) => $itemHoverTextColor || '#000'};
  }
`;
