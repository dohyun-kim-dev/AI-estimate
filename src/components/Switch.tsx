'use client';

import styled from 'styled-components';
import { AppColors } from '@/styles/colors';

type SwitchProps = {
  checked: boolean;
  onToggle?: () => void;
  readOnly?: boolean;
};

const SwitchWrapper = styled.div<{ checked: boolean; readOnly?: boolean }>`
  display: inline-block;
  width: 48px;
  height: 26px;
  background-color: ${({ checked }) =>
    checked ? '#636994': AppColors.disabled};
  border-radius: 20px;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? 'default' : 'pointer')};
  transition: background-color 0.3s ease;
`;

const SwitchThumb = styled.div<{ checked: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ checked }) => (checked ? '24px' : '4px')};
  width: 20px;
  height: 20px;
  background-color: ${AppColors.surface};
  border-radius: 50%;
  transition: left 0.3s ease;
`;

export default function Switch({ checked, onToggle, readOnly }: SwitchProps) {
  return (
    <SwitchWrapper
      checked={checked}
      readOnly={readOnly}
      onClick={() => {
        if (!readOnly && onToggle) onToggle();
      }}
    >
      <SwitchThumb checked={checked} />
    </SwitchWrapper>
  );
}
