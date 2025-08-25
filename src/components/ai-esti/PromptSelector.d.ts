import React from 'react';
import { PromptTemplate } from '@/ai/promptTemplates';
interface PromptSelectorProps {
    templates: PromptTemplate[];
    selectedId: string;
    onSelect: (templateId: string) => void;
}
declare const PromptSelector: React.FC<PromptSelectorProps>;
export default PromptSelector;
