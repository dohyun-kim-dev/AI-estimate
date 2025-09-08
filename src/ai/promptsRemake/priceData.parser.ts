// // promptsRemake/priceData.parser.ts
// export type Platform = 'web'|'app'|'both'|'server'|'common';

// export interface Money {
//   amount: number;
//   currency: 'KRW';
//   display: string;
// }
// export interface FeatureItem {
//   id: string;
//   itemType: string;
//   areaType: string;
//   category: string;
//   title: string;
//   description?: string;
//   memo?: string;
//   adminPageRequired: boolean;
//   adminCategory?: string;
//   feWeeks?: number;
//   beWeeks?: number;
//   amount?: Money;
//   duplicates?: string[];
//   normalized: {
//     platform: Platform;
//     typoFixes: string[];
//   };
// }

// const KRW = (n: number): Money => ({
//   amount: n,
//   currency: 'KRW',
//   display: n.toLocaleString('ko-KR') + '원'
// });

// function toNum(s?: string) {
//   if (!s) return undefined;
//   const n = Number(String(s).replace(/[^\d.-]/g,''));
//   return Number.isFinite(n) ? n : undefined;
// }

// function toWeeks(s?: string) {
//   if (!s) return undefined;
//   const n = Number(String(s).replace(/[^\d.]/g,''));
//   return Number.isFinite(n) ? n : undefined;
// }

// function slug(parts: string[]) {
//   return parts.filter(Boolean)
//     .map(x => x.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-_]/g,''))
//     .join('__');
// }

// function inferPlatform(areaType = '', category = ''): Platform {
//   const a = areaType.toLowerCase();
//   if (a.includes('app')) return 'app';
//   if (a.includes('web')) return 'web';
//   if (a.includes('server') || a.includes('백서비스')) return 'server';
//   if (category.includes('화면')) return 'both';
//   return 'common';
// }

// export function parseMarkdownTable(md: string): FeatureItem[] {
//   const lines = md.trim().split('\n').filter(Boolean);
//   const start = lines.findIndex(l => l.includes('| 항목 |'));
//   if (start < 0) return [];
//   const body = lines.slice(start + 2);

//   const items: FeatureItem[] = [];
//   for (const raw of body) {
//     if (!raw.startsWith('|')) continue;
//     const cols = raw.split('|').map(c => c.trim());
//     if (cols.length < 13) continue;

//     const itemType = cols[1];
//     const areaType = cols[2];
//     const category = cols[3] || '';
//     const title = cols[4] || '';
//     const description = cols[5] || '';
//     const memo = cols[6] || '';
//     const adminPageRequired = (cols[7] || '').toUpperCase() === 'Y';
//     const adminCategory = cols[8] || '';
//     const feWeeks = toWeeks(cols[9]);
//     const beWeeks = toWeeks(cols[10]);
//     const amountNum = toNum(cols[11]);
//     const amount = amountNum ? KRW(amountNum) : undefined;

//     items.push({
//       id: slug([itemType, areaType, category, title]),
//       itemType, areaType, category, title, description, memo,
//       adminPageRequired, adminCategory,
//       feWeeks, beWeeks, amount,
//       normalized: { platform: inferPlatform(areaType, category), typoFixes: [] }
//     });
//   }
//   return items;
// }

// export function markDuplicates(items: FeatureItem[]): FeatureItem[] {
//   const key = (x: FeatureItem) => `${x.areaType}::${x.category}::${x.title}`.toLowerCase();
//   const map = new Map<string, FeatureItem[]>();
//   items.forEach(it => {
//     const k = key(it);
//     map.set(k, [...(map.get(k)||[]), it]);
//   });
//   return items.map(it => {
//     const dups = (map.get(key(it))||[]).map(d => d.id);
//     return dups.length > 1 ? { ...it, duplicates: dups.filter(x => x !== it.id) } : it;
//   });
// }
