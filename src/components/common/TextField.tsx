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

const StyledInput = styled.input<{ $hasSuffix?: boolean; $height?: string }>`
  height: ${props => props.$height || '56px'};
  width: 100%;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  padding: 0 14px;
  padding-right: ${props => props.$hasSuffix ? '40px' : '14px'};
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

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
        <StyledInput
          id={id}
          type={inputType}
          $hasSuffix={showSuffixIcon && isPasswordField}
          $height={height}
          autoComplete={autoComplete}
          onChange={handleChange}
          value={displayValue}
          maxLength={(inputType === 'tel' || inputType === 'phone') ? 13 : props.maxLength}
          {...props}
        />
        {showSuffixIcon && isPasswordField && (
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