'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
const SwitchWrapper = styled.div `
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: ${({ checked }) => checked ? AppColors.success : AppColors.disabled};
  border-radius: 20px;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? 'default' : 'pointer')};
  transition: background-color 0.3s ease;
`;
const SwitchThumb = styled.div `
  position: absolute;
  top: 2px;
  left: ${({ checked }) => (checked ? '20px' : '2px')};
  width: 16px;
  height: 16px;
  background-color: ${AppColors.surface};
  border-radius: 50%;
  transition: left 0.3s ease;
`;
export default function Switch({ checked, onToggle, readOnly }) {
    return (_jsx(SwitchWrapper, { checked: checked, readOnly: readOnly, onClick: () => {
            if (!readOnly && onToggle)
                onToggle();
        }, children: _jsx(SwitchThumb, { checked: checked }) }));
}
