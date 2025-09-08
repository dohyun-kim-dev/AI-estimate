// // promptsRemake/estimate.builder.ts
// import { parseMarkdownTable, markDuplicates, type FeatureItem } from './priceData.parser';
// import { commonFeatures, userFeatures, adminFeatures } from '../priceData';

// export function buildNormalizedFeatures(): FeatureItem[] {
//   const rows = [
//     ...parseMarkdownTable(commonFeatures),
//     ...parseMarkdownTable(userFeatures),
//     ...parseMarkdownTable(adminFeatures),
//   ];
//   return markDuplicates(rows);
// }
