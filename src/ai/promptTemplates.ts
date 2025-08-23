import { combineSystemPrompts } from './prompts';
import { discountPrompt } from './prompts/discount';
import { logPromptInfo, estimateTokens } from '@/utils/promptLogger';

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  description?: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'default',
    title: '기본 시스템 프롬프트',
    content: combineSystemPrompts(),
    description: '기본 AI 시스템 프롬프트입니다.'
  },
  {
    id: 'discount',
    title: '할인 및 프로모션 처리',
    content: discountPrompt,
    description: '할인 및 프로모션 관련 처리를 위한 프롬프트입니다.'
  },
  // 여기에 추가 프롬프트 템플릿을 작성하세요
];

export const getPromptTemplate = (id: string): PromptTemplate | undefined => {
  return promptTemplates.find(template => template.id === id);
};

export const combinePrompts = (templateId: string, userInput: string): string => {
  const template = getPromptTemplate(templateId);
  if (!template) return userInput;
  
  const combinedPrompt = `${template.content}\n\n사용자 입력: ${userInput}`;
  
  // 토큰 수 추정
  const promptTokens = estimateTokens(combinedPrompt);
  // 응답 토큰은 입력의 약 1.5배로 가정
  const completionTokens = Math.ceil(promptTokens * 1.5);
  
  // 로그 출력
  logPromptInfo({
    templateId,
    userInput,
    combinedPrompt,
    tokenInfo: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    }
  });
  
  return combinedPrompt;
};