'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled, { keyframes } from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import { useDevice } from '@/contexts/DeviceContext';
import { ButtonStyles } from '@/constants/componentConstants';
// ✅ 스켈레톤 텍스트 애니메이션 정의
const textGradient = keyframes `
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const SkeletonText = styled.span `
  background: linear-gradient(90deg, #5708fb, #be83ea, #5708fb);
  background-size: 300% 100%;
  animation: ${textGradient} 3s ease-in-out infinite;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-weight: ${AppTextStyles.label2.fontWeight};
  letter-spacing: ${AppTextStyles.label2.letterSpacing};
`;
const SkeletonIcon = styled.span `
  background-size: 300% 100%;
  animation: ${textGradient} 3s ease-in-out infinite;
  background-clip: text;
  -webkit-background-clip: text;
  color: linear-gradient(90deg, #5708fb, #be83ea, #5708fb);
  -webkit-text-fill-color: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
const StyledButton = styled.button `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $width }) => $width || '100%'};
  max-width: ${({ $maxWidth }) => $maxWidth};
  height: ${({ $height }) => $height};
  padding: ${({ $padding }) => $padding};
  border-radius: ${({ $borderRadius }) => $borderRadius};
  font-size: ${({ $fontSize }) => $fontSize};
  font-weight: ${AppTextStyles.label2.fontWeight};
  letter-spacing: ${AppTextStyles.label2.letterSpacing};

  background: ${({ $backgroundColor }) => $backgroundColor};
  color: ${AppColors.onPrimary};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease;

  &:hover {
    color: ${AppColors.hoverText};
    border-color: ${AppColors.hoverText};
  }

  svg {
    font-size: 25px;
    color: inherit;
  }
`;
const IconWrapper = styled.span `
  display: flex;
  align-items: center;
  margin-right: ${({ $position }) => ($position === 'left' ? '8px' : '0')};
  margin-left: ${({ $position }) => ($position === 'right' ? '8px' : '0')};
`;
const CommonButton = ({ text, icon, $iconPosition = 'left', width, maxWidth, height, borderRadius, padding, fontSize, backgroundColor = AppColors.primary, borderColor = AppColors.border, isSkeletonText = false, ...buttonProps }) => {
    const device = useDevice();
    const resolvedMaxWidth = maxWidth || ButtonStyles.containerMaxWidth[device];
    return (_jsxs(StyledButton, { ...buttonProps, "$width": width, "$maxWidth": resolvedMaxWidth, "$height": height || ButtonStyles.height[device], "$borderRadius": borderRadius || ButtonStyles.radius[device], "$padding": padding || ButtonStyles.padding[device], "$fontSize": fontSize || ButtonStyles.fontSize[device], "$backgroundColor": backgroundColor, "$borderColor": borderColor, children: [icon && $iconPosition === 'left' && (_jsx(IconWrapper, { "$position": "left", children: isSkeletonText ? _jsx(SkeletonIcon, { children: icon }) : icon })), isSkeletonText ? _jsx(SkeletonText, { children: text }) : text, icon && $iconPosition === 'right' && (_jsx(IconWrapper, { "$position": "right", children: isSkeletonText ? _jsx(SkeletonIcon, { children: icon }) : icon }))] }));
};
export default CommonButton;
