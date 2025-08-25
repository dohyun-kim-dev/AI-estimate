"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { useLanguageStore } from '@/store/languageStore';
const Wrapper = styled.div `
  display: flex;
  align-items: center;
  gap: 16px;
`;
const Label = styled.span `
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin-right: 8px;
`;
const Option = styled.button `
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
`;
const Checkbox = styled.span `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid ${({ theme, $checked }) => ($checked ? "#3391FF" : theme.subtleText)};
  transition: all 0.2s ease;

  &::after {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ theme, $checked }) => ($checked ? "#3391FF" : theme.subtleText)};
  }
`;
const Text = styled.span `
  font-size: 16px;
`;
export default function LanguageSelector({ withLabel = true }) {
    const { language, setLanguage } = useLanguageStore();
    const buildOption = (value, text) => (_jsxs(Option, { "$checked": language === value, onClick: () => setLanguage(value), children: [_jsx(Checkbox, { "$checked": language === value }), _jsx(Text, { children: text })] }, value));
    return (_jsxs(Wrapper, { children: [withLabel && _jsx(Label, { children: "\uB2E4\uAD6D\uC5B4 \uC124\uC815 (Language)" }), buildOption('ko', '한국어'), buildOption('en', 'English')] }));
}
