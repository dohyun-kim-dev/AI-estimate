// // promptsRemake/estimate.rules.ts
// import type { Money } from './priceData.parser';

// const KRW = (n:number): Money => ({ amount:n, currency:'KRW', display:n.toLocaleString('ko-KR')+'원' });

// export function calcPagesCost(pages:number, mode:'pc'|'mobile'|'both') {
//   const unit = (mode === 'both') ? 150000 : 100000;
//   return pages * unit;
// }

// export function buildBaseScreenItems(pages:number, mode:'pc'|'mobile'|'both') {
//   const unit = mode === 'both' ? 150000 : 100000;
//   const cost = (amt:number) => KRW(amt);

//   return [
//     {
//       item_id: 'base-ux-storyboard',
//       name: '화면설계',
//       description: `${mode.toUpperCase()} 기준, ${pages}페이지 × ${unit.toLocaleString()}원/페이지`,
//       amount: cost(calcPagesCost(pages, mode)),
//       is_deleted: false
//     },
//     {
//       item_id: 'base-ux-design',
//       name: 'UI/UX디자인',
//       description: `${mode.toUpperCase()} 기준, ${pages}페이지 × ${unit.toLocaleString()}원/페이지`,
//       amount: cost(calcPagesCost(pages, mode)),
//       is_deleted: false
//     },
//     {
//       item_id: 'base-ux-publish',
//       name: '퍼블리싱',
//       description: `${mode.toUpperCase()} 기준, ${pages}페이지 × ${unit.toLocaleString()}원/페이지`,
//       amount: cost(calcPagesCost(pages, mode)),
//       is_deleted: false
//     }
//   ];
// }
