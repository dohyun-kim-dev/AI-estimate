import React from 'react'
import styled from 'styled-components'
import { PromptTemplate } from '@/types/prompt'

const SelectorWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const Select = styled.select`
  height: 36px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 0 12px;
  min-width: 200px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}20;
  }

  option {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    padding: 8px;
  }
`

const Label = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`

interface PromptSelectorProps {
  templates: PromptTemplate[]
  selectedId: string
  onSelect: (templateId: string) => void
  label?: string
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({
  templates,
  selectedId,
  onSelect,
  label,
}) => {
  const selectId = React.useId()

  return (
    <SelectorWrapper>
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <Select
        id={selectId}
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.title}
          </option>
        ))}
      </Select>
    </SelectorWrapper>
  )
}

export default PromptSelector
