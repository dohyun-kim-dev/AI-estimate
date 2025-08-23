import styled from 'styled-components';
import { InputStyles } from '@/constants/componentConstants';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import type { DeviceType } from '@/types/device';
import React, { useRef, useEffect } from 'react';

export interface BaseInputElementProps {
  radius?: string;
  padding?: string;
  height?: string;
  fontSize?: string;
  paddingRight?: string;
  $hasSuffix?: boolean;
  $device: DeviceType;
  background?: string;
  autoComplete?: string;

  // 커스터마이징 가능한 스타일 props (모두 $ prefix)
  $inputBackgroundColor?: string;
  $textColor?: string;
  $placeholderColor?: string;
  $borderColor?: string;
}

// Textarea 전용 props
interface TextareaElementProps extends BaseInputElementProps {
  rows?: number;
  maxRows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/** 단일 라인 input 필드 */
export const StyledInput = styled.input<BaseInputElementProps>`
  background: ${({ $inputBackgroundColor, background }) =>
    $inputBackgroundColor || background || AppColors.surface};
  color: ${({ $textColor }) => $textColor || AppColors.onSurface};

  padding: ${({ padding, $device }) => padding || InputStyles.padding[$device]};
  padding-right: ${({ paddingRight, $hasSuffix, $device }) =>
    paddingRight ||
    ($hasSuffix ? InputStyles.paddingRightWithSuffix[$device] : InputStyles.padding[$device])};

  border: 1px solid ${({ $borderColor }) => $borderColor || AppColors.borderLight};
  border-radius: ${({ radius, $device }) => radius || InputStyles.radius[$device]};
  font-size: ${({ fontSize }) => fontSize || AppTextStyles.body1.fontSize};
  width: 100%;
  height: ${({ height, $device }) => height || InputStyles.height[$device]};
  box-sizing: border-box;

  &:focus {
    border-color: ${({ $borderColor }) => $borderColor || AppColors.onSurface};
    outline: none;
  }

  &::placeholder {
    color: ${({ $placeholderColor }) => $placeholderColor || AppColors.iconDisabled};
  }

  ${({ readOnly }) =>
    readOnly &&
    `
    background-color: #f5f5f5;
    color: #666;
    cursor: default;
  `}
`;

/** 멀티라인 textarea 필드 (자동 높이 조절) */
const RawTextarea = styled.textarea<BaseInputElementProps>`
  background: ${({ $inputBackgroundColor, background }) =>
    $inputBackgroundColor || background || AppColors.surface};
  color: ${({ $textColor }) => $textColor || AppColors.onSurface};

  padding: ${({ padding, $device }) => padding || InputStyles.padding[$device]};
  padding-right: ${({ paddingRight, $hasSuffix, $device }) =>
    paddingRight ||
    ($hasSuffix ? InputStyles.paddingRightWithSuffix[$device] : InputStyles.padding[$device])};

  border: 1px solid ${({ $borderColor }) => $borderColor || AppColors.borderLight};
  border-radius: ${({ radius, $device }) => radius || InputStyles.radius[$device]};
  font-size: ${({ fontSize }) => fontSize || AppTextStyles.body1.fontSize};
  width: 100%;
  min-height: ${({ height }) => height || '80px'};
  resize: none;
  overflow: hidden;
  line-height: 1.5;
  box-sizing: border-box;

  white-space: pre-wrap;
  word-break: break-word;

  &:focus {
    border-color: ${({ $borderColor }) => $borderColor || AppColors.onSurface};
    outline: none;
  }

  &::placeholder {
    color: ${({ $placeholderColor }) => $placeholderColor || AppColors.iconDisabled};
  }

  ${({ readOnly }) =>
    readOnly &&
    `
    background-color: #f5f5f5;
    color: #666;
    cursor: default;
  `}
`;

/** 자동 높이 조절 기능 포함된 Textarea 컴포넌트 */
export const StyledTextarea: React.FC<TextareaElementProps> = ({
  value,
  onChange,
  ...rest
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <RawTextarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};
