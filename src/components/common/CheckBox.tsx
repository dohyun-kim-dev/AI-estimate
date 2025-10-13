'use client';

import React from 'react';
import styled from 'styled-components';

interface CheckBoxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  disabled?: boolean;
  name?: string;
}

const CheckBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const HiddenInput = styled.input`
  display: none;
`;

const CheckBoxIcon = styled.div<{ $checked: boolean; $color: string; $disabled?: boolean }>`
  width: 20px;
  height: 20px;
  border: 3px solid ${({ $checked, $color }) => $checked ? $color : '#AAA'};
  border-radius: 50%;
  background-color: ${({ $checked, $color }) => $checked ? $color : 'white'};
  position: relative;
  transition: all 0.2s ease;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};


  /* 도넛 링 효과 - 내부 흰색 원 */
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    background-color: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: ${({ $checked }) => $checked ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`;

const Label = styled.label<{ $disabled?: boolean }>`
  font-size: 14px;
  color: ${({ $disabled }) => $disabled ? '#999' : '#555'};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  flex: 1;
`;

export default function CheckBox({ 
  id, 
  label, 
  checked, 
  onChange, 
  color = '#636994',
  disabled = false,
  name,
  ...props 
}: CheckBoxProps) {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <CheckBoxWrapper onClick={handleChange}>
      <Label htmlFor={id} $disabled={disabled}>
        {label}
      </Label>
      <HiddenInput
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      <CheckBoxIcon
        $checked={checked}
        $color={color}
        $disabled={disabled}
      />
    </CheckBoxWrapper>
  );
}
