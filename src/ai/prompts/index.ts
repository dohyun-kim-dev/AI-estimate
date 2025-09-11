import { systemPrompt } from './system';
import { personaPrompt } from './persona';
import { guidelinePrompt } from './guideline';
import { schemaPrompt } from './schema';
import { userFeatures, adminFeatures,commonFeatures} from './priceDate';
import { discountPrompt } from './discount';
import { IMAGE_EXTRACTION_INSTRUCTION } from './IMAGE_EXTRACTION_INSTRUCTION';
import { IMAGE_AND_PDF_EXTRACTION_INSTRUCTION } from './IMAGE_AND_PDF_EXTRACTION_INSTRUCTION';
import { PDF_EXTRACTION_INSTRUCTION } from './PDF_EXTRACTION_INSTRUCTION';

export const combineSystemPrompts = () => {
  // return `${systemPrompt}\n\n${guidelinePrompt}\n\n${schemaPrompt}\n\n${discountPrompt}\n\n${userFeatures}\n\n${adminFeatures}\n\n${commonFeatures}`;
  return `${systemPrompt}\n\n${guidelinePrompt}\n\n${schemaPrompt}\n\n${IMAGE_EXTRACTION_INSTRUCTION}\n\n${IMAGE_AND_PDF_EXTRACTION_INSTRUCTION}\n\n${PDF_EXTRACTION_INSTRUCTION}\n\n${discountPrompt}\n\n${userFeatures}\n\n${adminFeatures}\n\n${commonFeatures}`;

};