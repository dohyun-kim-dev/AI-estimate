"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
const Field = styled.div `
  position: relative;
`;
const FloatingLabel = styled.label `
  position: absolute;
  top: -10px;
  left: 12px;
  margin-top: 3px;
  padding: 0 4px;
  font-size: 12px;
  color: #666666;
  background: #ffffff;
`;
const StyledInput = styled.input `
  height: 56px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: #ffffff; /* 라이트/다크 모드와 무관하게 화이트 고정 */
  color: #111827;
  padding: 0 14px;
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
`;
export default function TextField({ id, label, ...props }) {
    return (_jsxs(Field, { children: [_jsx(FloatingLabel, { htmlFor: id, children: label }), _jsx(StyledInput, { id: id, ...props })] }));
}
