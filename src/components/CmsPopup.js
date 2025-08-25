'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
const Overlay = styled.div `
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  min-width: 1450px;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  overflow-x: auto;
  overflow-y: auto;
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(${({ $scrollX }) => -$scrollX}px);
`;
const PopupContainer = styled.div `
  position: relative;
  width: ${({ $isWide }) => ($isWide ? '1200px' : '800px')};
  min-width: ${({ $isWide }) => ($isWide ? '1200px' : '800px')};
  height: ${({ $customHeight }) => $customHeight ?? '85vh'};
  background: ${({ $backgroundColor }) => $backgroundColor ?? '#2c2e3c'}; // ✅ 배경색
  border-radius: 8px;
  padding-bottom: ${({ $hasBottomFloating }) => ($hasBottomFloating ? '100px' : '0')};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;
const CloseButton = styled.button `
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  z-index: 10;

  &:hover {
    color: #000;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
  }
`;
const HeaderRow = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  padding-right: 48px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
`;
const RequiredMark = styled.span `
  font-size: 14px;
  font-weight: 500;
  color: ${AppColors.error};
`;
const PopupContent = styled.div `
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  padding-top: 0;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const BottomFloatingWrapper = styled.div `
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 20;
  background: #2c2e3c;
  /* background-color: white; */
  padding: 16px 24px;
  /* border-top: 1px solid ${AppColors.border}; */
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;
const CmsPopup = ({ title, children, isOpen, onClose, isWide, showRequiredMark = false, bottomFloating, height, backgroundColor, }) => {
    const [scrollX, setScrollX] = useState(0);
    useEffect(() => {
        const handleScroll = () => {
            setScrollX(window.scrollX || window.pageXOffset);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    if (!isOpen)
        return null;
    return (_jsx(Overlay, { "$scrollX": scrollX, children: _jsxs(PopupContainer, { "$isWide": isWide, "$hasBottomFloating": !!bottomFloating, "$customHeight": height ?? null, "$backgroundColor": backgroundColor, children: [_jsx(CloseButton, { onClick: onClose, "aria-label": "\uB2EB\uAE30", children: "\u00D7" }), _jsxs(HeaderRow, { children: [_jsx("span", { children: title }), showRequiredMark && _jsx(RequiredMark, { children: "*\uD544\uC218\uAC12" })] }), _jsx(PopupContent, { children: children }), bottomFloating && (_jsx(BottomFloatingWrapper, { children: bottomFloating }))] }) }));
};
export default CmsPopup;
