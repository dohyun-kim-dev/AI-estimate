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
    content: 'SYSTEM_PROMPT_PLACEHOLDER', // 실제 프롬프트는 combinePrompts에서 동적으로 생성
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

export const combinePrompts = async (templateId: string, userInput: string): Promise<string> => {
  const template = getPromptTemplate(templateId);
  if (!template) return userInput;

  let templateContent = template.content;

  // 기본 템플릿의 경우 이제 systemInstruction에서 처리되므로 사용자 입력만 반환
  if (templateId === 'default' && template.content === 'SYSTEM_PROMPT_PLACEHOLDER') {
    // 시스템 프롬프트는 useAI에서 systemInstruction으로 설정되므로 사용자 입력만 반환
    return userInput;
  }

  const combinedPrompt = `${templateContent}\n\n사용자 입력: ${userInput}`;

  // 토큰 수 추정 (실제 토큰 정보는 AI 응답에서 얻음)
  const promptTokens = estimateTokens(combinedPrompt);

  // 로그 출력 (토큰 정보는 실제 사용량으로 나중에 업데이트)
  console.log(`🤖 프롬프트 조합 완료:`);
  console.log(`템플릿 ID: ${templateId}`);
  console.log(`사용자 입력: ${userInput}`);
  console.log(`예상 입력 토큰: ${promptTokens.toLocaleString()}`);

  return combinedPrompt;
};