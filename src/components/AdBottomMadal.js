import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled, { keyframes } from "styled-components";
import { AppColors } from '@/styles/colors';
const slideUp = keyframes `
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0%);
    opacity: 1;
  }
`;
const ModalWrapper = styled.div `
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50vh;
  animation: ${slideUp} 0.4s ease-out;
  z-index: 9999;
  display: flex;
  justify-content: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  ${({ $isBlur }) => $isBlur && `backdrop-filter: blur(12px);`}
`;
const ModalContainer = styled.div `
  width: 100%;
  height: 100%;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 20px;
  border: 1px solid ${AppColors.border};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
`;
const CloseButton = styled.button `
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;
export const AdBottomModal = ({ isOpen, onClose, children, backgroundColor = 'rgba(255, 255, 255, 0.05)', isBlur = true, }) => {
    if (!isOpen)
        return null;
    return (_jsx(ModalWrapper, { "$backgroundColor": backgroundColor, "$isBlur": isBlur, children: _jsxs(ModalContainer, { children: [_jsx(CloseButton, { onClick: onClose, children: "\u2715" }), children] }) }));
};
