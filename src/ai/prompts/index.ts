import { systemPrompt } from './system';
import { personaPrompt } from './persona';
import { guidelinePrompt } from './guideline';
import { schemaPrompt } from './schema';

export const combineSystemPrompts = () => {
  return `${systemPrompt}\n\n${personaPrompt}\n\n${guidelinePrompt}\n\n${schemaPrompt}`;
};