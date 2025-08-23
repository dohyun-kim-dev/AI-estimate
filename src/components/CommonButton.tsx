'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import { useDevice } from '@/contexts/DeviceContext';
import type { DeviceType } from '@/types/device';
import { ButtonStyles } from '@/constants/componentConstants';

// ✅ 스켈레톤 텍스트 애니메이션 정의
const textGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const SkeletonText = styled.span`
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

interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon?: React.ReactNode;
  $iconPosition?: 'left' | 'right';

  // 스타일 오버라이드
  width?: string;
  maxWidth?: string;
  height?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  backgroundColor?: string;
  borderColor?: string;

  // ✅ 텍스트 스켈레톤 여부
  isSkeletonText?: boolean;
}

const SkeletonIcon = styled.span`
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

const StyledButton = styled.button<{
  $width?: string;
  $maxWidth: string;
  $height: string;
  $borderRadius: string;
  $padding: string;
  $fontSize: string;
  $backgroundColor: string;
  $borderColor: string;
}>`
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

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  margin-right: ${({ $position }) => ($position === 'left' ? '8px' : '0')};
  margin-left: ${({ $position }) => ($position === 'right' ? '8px' : '0')};
`;

const CommonButton: React.FC<CommonButtonProps> = ({
  text,
  icon,
  $iconPosition = 'left',
  width,
  maxWidth,
  height,
  borderRadius,
  padding,
  fontSize,
  backgroundColor = AppColors.primary,
  borderColor = AppColors.border,
  isSkeletonText = false,
  ...buttonProps
}) => {
  const device = useDevice();
  const resolvedMaxWidth = maxWidth || ButtonStyles.containerMaxWidth[device];

  return (
    <StyledButton
      {...buttonProps}
      $width={width}
      $maxWidth={resolvedMaxWidth}
      $height={height || ButtonStyles.height[device]}
      $borderRadius={borderRadius || ButtonStyles.radius[device]}
      $padding={padding || ButtonStyles.padding[device]}
      $fontSize={fontSize || ButtonStyles.fontSize[device]}
      $backgroundColor={backgroundColor}
      $borderColor={borderColor}
    >
      {icon && $iconPosition === 'left' && (
        <IconWrapper $position="left">
          {isSkeletonText ? <SkeletonIcon>{icon}</SkeletonIcon> : icon}
        </IconWrapper>
      )}
      {isSkeletonText ? <SkeletonText>{text}</SkeletonText> : text}
      {icon && $iconPosition === 'right' && (
        <IconWrapper $position="right">
          {isSkeletonText ? <SkeletonIcon>{icon}</SkeletonIcon> : icon}
        </IconWrapper>
      )}
    </StyledButton>
  );
};

export default CommonButton;
