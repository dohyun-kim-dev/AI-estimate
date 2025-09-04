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
  height?: string;  // 높이 prop 추가
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
  ...props 
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const inputType = isPasswordField 
    ? (isPasswordVisible ? 'text' : 'password')
    : propType || 'text';

  return (
    <Field className={className}>
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
      <InputWrapper>
        <StyledInput 
          id={id} 
          type={inputType}
          $hasSuffix={showSuffixIcon && isPasswordField}
          $height={height}
          {...props} 
        />
        {showSuffixIcon && isPasswordField && (
          <SuffixIconWrapper
            onClick={handleToggleVisibility}
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