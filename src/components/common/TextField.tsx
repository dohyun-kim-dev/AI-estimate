'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  errorMessage?: string;
  isPasswordField?: boolean;
  showSuffixIcon?: boolean;
  height?: string;
  autoComplete?: string;
  normalizePhoneToDigits?: boolean; // 전화번호 입력 시 숫자만 부모에 전달할지 여부
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  multiline?: boolean; // textarea 지원 추가
  minLines?: number; // 최소 라인 수
  maxLines?: number; // 최대 라인 수
  $inputBackgroundColor?: string; // 배경색 커스터마이징
  $borderColor?: string; // 테두리 색 커스터마이징
  selectOptions?: Array<{ value: string | number; label: string }>; // select 옵션
  isSelect?: boolean; // select 필드 여부
}

const Field = styled.div`
  position: relative;
  width: 100%;
`;

const FloatingLabel = styled.label`
  position: absolute;
  top: -10px;
  left: 12px;
  margin-top: 3px;
  padding: 0 4px;
  font-size: 12px;
  color: #666666;
  background: #ffffff;
  z-index: 1;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input<{ 
  $hasSuffix?: boolean; 
  $height?: string; 
  $inputBackgroundColor?: string; 
  $borderColor?: string; 
}>`
  height: ${props => props.$height || '56px'};
  width: 100%;
  border-radius: 4px;
  border: 1px solid #79747E;
  background: ${props => props.$inputBackgroundColor || '#ffffff'};
  color: #111827;
  padding: 0 14px;
  padding-right: ${props => props.$hasSuffix ? '40px' : '14px'};
  font-size: 16px; /* iOS Safari 자동 확대 방지를 위해 16px로 변경 */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  /* iOS Safari 자동 확대 방지 추가 속성 */
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;

  &::placeholder {
    color: #666666;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: #3391FF;
    box-shadow: 0 0 0 2px rgba(51, 145, 255, 0.12);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

    &:read-only {
    background: #ffffff; /* 리드온리일 때 배경색을 흰색으로 고정 */
    cursor: default; /* 마우스 커서를 기본으로 변경 */
    color: #777676;
    &:focus {
      border-color: #79747E; /* 포커스 시 테두리 색을 일반 상태와 동일하게 유지 */
      box-shadow: none; /* 포커스 시 그림자 제거 */
    }
  }
`;

const StyledTextarea = styled.textarea<{ 
  $inputBackgroundColor?: string; 
  $borderColor?: string; 
  $minLines?: number;
  $maxLines?: number;
}>`
  width: 100%;
  min-height: ${props => (props.$minLines || 3) * 1.5}em;
  max-height: ${props => (props.$maxLines || 6) * 1.5}em;
  border-radius: 4px;
  border: 1px solid ${props => props.$borderColor || '#e5e7eb'};
  background: ${props => props.$inputBackgroundColor || '#ffffff'};
  color: #111827;
  padding: 14px;
  font-size: 16px; /* iOS Safari 자동 확대 방지를 위해 16px로 변경 */
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  /* iOS Safari 자동 확대 방지 추가 속성 */
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;

  &::placeholder {
    color: #666666;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: #3391FF;
    box-shadow: 0 0 0 2px rgba(51, 145, 255, 0.12);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const StyledSelect = styled.select<{ 
  $height?: string; 
  $inputBackgroundColor?: string; 
  $borderColor?: string; 
}>`
  height: ${props => props.$height || '56px'};
  width: 100%;
  border-radius: 4px;
  border: 1px solid ${props => props.$borderColor || '#e5e7eb'};
  background: ${props => props.$inputBackgroundColor || '#ffffff'};
  color: #111827;
  padding: 0 14px;
  font-size: 16px; /* iOS Safari 자동 확대 방지를 위해 16px로 변경 */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  /* iOS Safari 자동 확대 방지 추가 속성 */
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    outline: none;
    border-color: #3391FF;
    box-shadow: 0 0 0 2px rgba(51, 145, 255, 0.12);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const SuffixIconWrapper = styled.div<{ $isPasswordVisible?: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ $isPasswordVisible }) =>
    $isPasswordVisible ? '#3391FF' : '#9CA3AF'};
`;

const ErrorText = styled.span`
  color: #EF4444;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 4px;
  display: block;
`;

export default function TextField({ 
  id, 
  label, 
  errorMessage,
  isPasswordField = false,
  showSuffixIcon = false,
  type: propType,
  className,
  height,
  autoComplete,
  onChange,
  value,
  normalizePhoneToDigits = false,
  multiline = false,
  minLines = 3,
  maxLines = 6,
  $inputBackgroundColor,
  $borderColor,
  selectOptions,
  isSelect = false,
  ...props 
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const inputType = isPasswordField 
    ? (isPasswordVisible ? 'text' : 'password')
    : propType || 'text';

  const formatPhone = (val: string) => {
    const only = (val || '').replace(/[^0-9]/g, '');
    if (only.length < 4) return only;
    if (only.length < 8) return `${only.slice(0,3)}-${only.slice(3)}`;
    return `${only.slice(0,3)}-${only.slice(3,7)}-${only.slice(7,11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 전화번호 유형일 때만 가공
    if (inputType === 'tel' || inputType === 'phone') {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      const formatted = formatPhone(raw);

      if (normalizePhoneToDigits) {
        // 부모에는 숫자만 전달
        onChange?.({
          ...e,
          target: { ...e.target, value: raw }
        } as React.ChangeEvent<HTMLInputElement>);
      } else {
        // 부모에는 하이픈 포함 값 전달
        onChange?.({
          ...e,
          target: { ...e.target, value: formatted }
        } as React.ChangeEvent<HTMLInputElement>);
      }
      return;
    }
    // 그 외에는 어떤 문자든 허용
    onChange?.(e);
  };

  // 화면 표시는: tel일 때 포맷 적용
  const displayValue =
    (inputType === 'tel' || inputType === 'phone')
      ? (normalizePhoneToDigits ? formatPhone(String(value ?? '')) : value)
      : value;

  return (
    <Field className={className}>
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
      <InputWrapper>
        {isSelect ? (
          <StyledSelect
            id={id}
            $height={height}
            $inputBackgroundColor={$inputBackgroundColor}
            $borderColor={$borderColor}
            onChange={onChange as any}
            value={value}
            {...(props as any)}
          >
            <option value="">선택하세요</option>
            {selectOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
        ) : multiline ? (
          <StyledTextarea
            id={id}
            $inputBackgroundColor={$inputBackgroundColor}
            $borderColor={$borderColor}
            $minLines={minLines}
            $maxLines={maxLines}
            onChange={onChange as any}
            value={displayValue}
            {...(props as any)}
          />
        ) : (
          <StyledInput
            id={id}
            type={inputType}
            $hasSuffix={showSuffixIcon && isPasswordField}
            $height={height}
            $inputBackgroundColor={$inputBackgroundColor}
            $borderColor={$borderColor}
            autoComplete={autoComplete}
            onChange={handleChange}
            value={displayValue}
            maxLength={(inputType === 'tel' || inputType === 'phone') ? 13 : props.maxLength}
            {...props}
          />
        )}
        {showSuffixIcon && isPasswordField && !multiline && !isSelect && (
          <SuffixIconWrapper
            onClick={() => setIsPasswordVisible(v => !v)}
            $isPasswordVisible={isPasswordVisible}
          >
            {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
          </SuffixIconWrapper>
        )}
      </InputWrapper>
      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
    </Field>
  );
}