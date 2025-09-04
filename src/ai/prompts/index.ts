import { systemPrompt } from './system';
import { personaPrompt } from './persona';
import { guidelinePrompt } from './guideline';
import { schemaPrompt } from './schema';
import { userFeatures, adminFeatures,commonFeatures} from './priceDate';
import { discountPrompt } from './discount';

export const combineSystemPrompts = () => {
  return `${systemPrompt}\n\n${guidelinePrompt}\n\n${schemaPrompt}\n\n${discountPrompt}\n\n${userFeatures}\n\n${adminFeatures}\n\n${commonFeatures}`;
  // return `${systemPrompt}\n\n${personaPrompt}\n\n${guidelinePrompt}\n\n${schemaPrompt}`;

};