"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import styled from 'styled-components';
const SelectorWrapper = styled.div `
  display: flex;
  gap: 8px;
  align-items: center;
`;
const Select = styled.select `
  height: 36px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 0 8px;
  min-width: 200px;
`;
const PromptSelector = ({ templates, selectedId, onSelect, }) => {
    return (_jsx(SelectorWrapper, { children: _jsx(Select, { value: selectedId, onChange: (e) => onSelect(e.target.value), children: templates.map((template) => (_jsx("option", { value: template.id, children: template.title }, template.id))) }) }));
};
export default PromptSelector;
