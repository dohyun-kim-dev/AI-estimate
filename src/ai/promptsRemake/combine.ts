// // promptsRemake/combine.ts
// import { runtimeVars } from './runtimeVars';
// import { systemPrompt } from './system';
// import { guidelinePrompt } from './guideline';
// import { schemaPrompt } from './schema';
// import { discountPrompt } from './discount';

// import { commonFeatures } from './priceData.common';
// import { userFeatures } from './priceData.user';
// import { adminFeatures } from './priceData.admin';

// // ⚠️ 모델에게 주는 "단일 텍스트 프롬프트" 조립
// export const combineSystemPrompts = () => {
//   return [
//     runtimeVars,
//     systemPrompt,
//     guidelinePrompt,
//     schemaPrompt,
//     discountPrompt,
//     commonFeatures,
//     userFeatures,
//     adminFeatures,
//   ].join('\n\n');
// };
