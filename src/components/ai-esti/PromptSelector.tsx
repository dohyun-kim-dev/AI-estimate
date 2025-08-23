"use client";

import React from 'react';
import styled from 'styled-components';
import { PromptTemplate } from '@/ai/promptTemplates';

const SelectorWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Select = styled.select`
  height: 36px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 0 8px;
  min-width: 200px;
`;

interface PromptSelectorProps {
  templates: PromptTemplate[];
  selectedId: string;
  onSelect: (templateId: string) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({
  templates,
  selectedId,
  onSelect,
}) => {
  return (
    <SelectorWrapper>
      <Select
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
  );
};

export default PromptSelector;
