"use client"

import React from 'react'
import styled from 'styled-components'
import { useLanguageStore, LanguageCode } from '@/store/languageStore'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const Label = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin-right: 8px;
`

const Option = styled.button<{ $checked: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
`

const Checkbox = styled.span<{ $checked: boolean }>`
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
`

const Text = styled.span`
  font-size: 16px;
`

export default function LanguageSelector({ withLabel = true }: { withLabel?: boolean }) {
  const { language, setLanguage } = useLanguageStore()

  const buildOption = (value: LanguageCode, text: string) => (
    <Option key={value} $checked={language === value} onClick={() => setLanguage(value)}>
      <Checkbox $checked={language === value} />
      <Text>{text}</Text>
    </Option>
  )

  return (
    <Wrapper>
      {withLabel && <Label>다국어 설정 (Language)</Label>}
      {buildOption('ko', '한국어')}
      {buildOption('en', 'English')}
    </Wrapper>
  )
}
