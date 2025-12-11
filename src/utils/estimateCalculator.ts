// 예상 기간 산출 로직 (Estimated Period Calculation Logic)

import { devLog } from "./devLogger";
import { usePromptStore } from "../store/promptStore";
import { useCompanyStore } from "../store/companyStore";

export interface EstimateItem {
  name: string;
  price: string;
  description: string;
  fe: string; // 프론트엔드 개발 일수
  be: string; // 백엔드 개발 일수
  page_count: number; // 페이지 수
  is_deleted: boolean;
  item_id?: string;
}

export interface Category {
  category_name: string;
  sub_categories: SubCategory[];
}

export interface SubCategory {
  sub_category_name: string;
  items: EstimateItem[];
}

export interface ProjectEstimate {
  project_name: string;
  total_price: string;
  vat_included_price: string;
  estimated_period: string;
  categories: Category[];
  uuid: string;
}

// description에서 단가(원) 추출 유틸 (재사용 위해 최상단으로 이동)
export const extractUnitFromDescription = (desc?: string): number | null => {
  if (!desc) return null;
  const s = desc.toLowerCase();
  const manwon = s.match(/(?:1장당|장당|1장[^0-9]*)([0-9]+(?:[.,][0-9]+)?)\s*만원/);
  if (manwon) {
    const v = parseFloat(manwon[1].replace(',', '.'));
    if (!isNaN(v)) return Math.round(v * 10000);
  }
  const won = s.match(/(?:1장당|장당|1장[^0-9]*)([0-9,]+)\s*원/);
  if (won) {
    const v = parseInt(won[1].replace(/,/g, ''), 10);
    if (!isNaN(v)) return v;
  }
  const num = s.match(/(?:1장당|장당|1장[^0-9]*)([0-9]{3,})/);
  if (num) {
    const v = parseInt(num[1].replace(/,/g, ''), 10);
    if (!isNaN(v)) return v;
  }
  return null;
};

export const extractUnitFromTexts = (texts: Array<string | undefined | null>): number | null => {
  for (const t of texts) {
    const v = extractUnitFromDescription(t || undefined);
    if (v && v > 0) return v;
  }
  return null;
};

// promptStore의 priceList를 분석해 company 단가표(planning/design/publishing)를 반환
export function buildPriceTableFromStore(): { planning?: number; design?: number; publishing?: number } {
  const state = usePromptStore.getState();
  const companyState = useCompanyStore.getState();
  const companyCodeFromState = (companyState?.companyInfo?.companyCode || companyState?.companyInfo?.companyName || companyState?.companyInfo?.name || '').toString().toLowerCase();

  // URL 쿼리에서 companyCode 파라미터가 있으면 우선 참고 (브라우저 실행 시)
  let companyCode = companyCodeFromState;
  try {
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = (params.get('companyCode') || params.get('companycode') || params.get('company') || '').toString().toLowerCase();
      if (codeFromUrl) {
        companyCode = codeFromUrl;
        devLog('   🔎 companyCode from URL detected:', companyCode);
      }
    }
  } catch (e) {
    devLog('   ⚠️ failed to read companyCode from URL:', e);
  }

  // 회사명이 heredot이면 모든 항목 150,000 고정
  if (companyCode === 'heredot') {
    const table = { planning: 150000, design: 150000, publishing: 150000 };
    devLog('   🏷 companyCode == heredot → price table forced:', table);
    return table;
  }
  const priceList = state.getPriceList ? state.getPriceList() : state.priceList || [];
  const defaults = { planning: 150000, design: 100000, publishing: 100000 };
  const table: { planning?: number; design?: number; publishing?: number } = { ...defaults };

  (priceList || []).forEach((row: any) => {
    // 다양한 필드명 시도
    const cat = (row['카테고리'] || row.category || row['관리자 카테고리'] || '').toString().toLowerCase();
    const title = (row['제목'] || row.title || '').toString().toLowerCase();
    const desc = (row['설명'] || row.description || row.memo || row['메모'] || '').toString();
    const amountField = row['금액'] || row.amount || row['금액(원)'] || row.price || row['가격'];

    let unit: number | null = null;
    // description에서 추출 우선
    unit = extractUnitFromDescription(desc);
    // 금액 필드가 있으면 숫자 파싱
    if (!unit && amountField) {
      const num = typeof amountField === 'number' ? amountField : parseInt(String(amountField).replace(/[,\s]/g, ''), 10);
      if (!isNaN(num) && num > 0) unit = num;
    }

    // 카테고리/제목 키로 매핑
    if (unit) {
      if (cat.includes('기획') || title.includes('기획')) {
        table.planning = unit;
      } else if (cat.includes('디자인') || title.includes('디자인') || title.includes('ui/ux') || title.includes('화면')) {
        table.design = unit;
      } else if (cat.includes('퍼블리싱') || title.includes('퍼블리싱')) {
        table.publishing = unit;
      }
    }
  });

  return table;
}

/**
 * 1단계: '기획/디자인' 기간 산출
 * 총 페이지 수를 기반으로 기획/디자인 기간을 계산
 */
export function calculatePlanningDesignPeriod(totalPages: number): number {
  devLog('🎯 기획/디자인 기간 산출 시작 - 총 페이지 수:', totalPages);

  let result: number;
  let reason: string;
  //페이지 수가 0일경우 result 0으로 처리
  if(totalPages === 0) {
    result = 0;
  } else if (totalPages <= 10) {
    result = 2;
    reason = '기획 1주 + 디자인 1주 = 총 2주';
  } else if (totalPages <= 20) {
    result = 4;
    reason = '기획 2주 + 디자인 2주 = 총 4주';
  } else if (totalPages <= 40) {
    result = 5;
    reason = '기획 3주 + 디자인 2주 = 총 5주';
  } else if (totalPages <= 60) {
    result = 7;
    reason = '기획 4주 + 디자인 3주 = 총 7주';
  } else if (totalPages <= 80) {
    result = 9;
    reason = '기획 5주 + 디자인 4주 = 총 9주';
  } else {
    result = 12;
    reason = '기획 7주 + 디자인 5주 = 총 12주';
  }

  devLog(`   ➡️ ${totalPages}페이지 → ${result}주 (${reason})`);
  return result;
}

/**
 * 2단계: 기능별 개발 기간 합산
 * 모든 기능의 FE/BE 개발일을 각각 합산
 */
export function calculateDevelopmentDays(categories: Category[]): { totalFeDays: number; totalBeDays: number } {
  devLog('💻 기능별 개발 기간 합산 시작');
  let totalFeDays = 0;
  let totalBeDays = 0;

  (categories || []).forEach(category => {
    devLog(`   📁 카테고리: ${category.category_name}`);
    (category.sub_categories || []).forEach(subCategory => {
      devLog(`     📂 하위 카테고리: ${subCategory.sub_category_name}`);
        (subCategory.items || []).forEach(item => {
        if (!item.is_deleted) {
          // fe, be 문자열을 숫자로 변환 (예: "3일" -> 3, "3" -> 3)
          // 예전 데이터에서는 fe, be 필드가 없을 수 있으므로 안전하게 처리
          const feMatch = item.fe?.match?.(/(\d+)/);
          const beMatch = item.be?.match?.(/(\d+)/);
          
          const feDays = feMatch ? parseInt(feMatch[1]) : 0;
          const beDays = beMatch ? parseInt(beMatch[1]) : 0;          if (feDays > 0 || beDays > 0) {
            devLog(`       📄 ${item.name}: FE ${feDays}일, BE ${beDays}일`);
          }
          
          totalFeDays += feDays;
          totalBeDays += beDays;
        }
      });
    });
  });

  devLog(`   ✅ 합산 결과: FE 총 ${totalFeDays}일, BE 총 ${totalBeDays}일`);
  return { totalFeDays, totalBeDays };
}

/**
 * 3단계: '순수 개발 기간' 확정 (FE/BE 중 최대값 선택)
 */
export function calculatePureDevelopmentDays(totalFeDays: number, totalBeDays: number): number {
  devLog('⚡ 순수 개발 기간 확정');
  devLog(`   📊 비교: FE ${totalFeDays}일 vs BE ${totalBeDays}일`);

  const result = Math.max(totalFeDays, totalBeDays);
  const selectedType = totalFeDays >= totalBeDays ? 'FE' : 'BE';

  devLog(`   ➡️ 최대값 선택: ${result}일 (${selectedType} 기준)`);
  return result;
}

/**
 * 4단계: '최종 프로젝트 기간' 종합 계산
 */
export function calculateFinalProjectPeriod(
  planningDesignWeeks: number,
  pureDevelopmentDays: number,
  totalPages: number = 0
): number {
  devLog('🏁 최종 프로젝트 기간 종합 계산');
  devLog(`   📋 입력값: 기획/디자인 ${planningDesignWeeks}주, 순수 개발 ${pureDevelopmentDays}일, 총 페이지 ${totalPages}페이지`);

  // 개발 기간(주) = CEILING(순수 개발일 / 5), 단 개발일이 있으면 최소 1주
  let developmentWeeks = 0;
  if (pureDevelopmentDays > 0) {
    developmentWeeks = Math.max(1, Math.ceil(pureDevelopmentDays / 5));
    devLog(`   📈 개발 기간: ${pureDevelopmentDays}일 → 최소 1주 보장하여 ${developmentWeeks}주`);
  } else {
    devLog(`   📈 개발 기간: ${pureDevelopmentDays}일 → ${developmentWeeks}주 (개발 없음)`);
  }

  // 검수/테스트 기간: 페이지가 0이면 0주, 아니면 2주
  const testWeeks = totalPages === 0 ? 0 : 2;
  devLog(`   🧪 검수/테스트 기간: ${testWeeks}주 (페이지 수: ${totalPages})`);

  // 최종 예상 기간(주) = 기획/디자인 기간 + 개발 기간 + 검수/테스트 기간
  const finalWeeks = planningDesignWeeks + developmentWeeks + testWeeks;
  devLog(`   🎯 최종 계산: ${planningDesignWeeks}주(기획/디자인) + ${developmentWeeks}주(개발) + ${testWeeks}주(검수/테스트) = ${finalWeeks}주`);

  return finalWeeks;
}

/**
 * 총 페이지 수 계산
 * 화면설계, UI/UX디자인을 제외한 나머지 기능들의 page_count를 합산
 */
export function calculateTotalPages(categories: Category[]): number {
  devLog('📄 총 페이지 수 계산 시작 (화면설계, UI/UX디자인 제외)');
  let totalPages = 0;

  (categories || []).forEach(category => {
    devLog(`   📁 카테고리: ${category.category_name}`);
    (category.sub_categories || []).forEach(subCategory => {
      devLog(`     📂 하위 카테고리: ${subCategory.sub_category_name}`);
      (subCategory.items || []).forEach(item => {
        if (!item.is_deleted) {
           const name = item.name.replace(/\s+/g, '');
            const isDesignItem = name === '화면설계' ||
                                name.includes('화면설계')||
                                name.includes('화면 설계')||
                                name.includes('UI/UX디자인')||
                                name.includes('UI/UX 디자인')||
                                name.includes('스토리보드') ||
                                name.includes('화면디자인')||
                                name.includes('웹퍼블리싱')||
                                name.includes('웹 퍼블리싱')||
                                name.includes('퍼블리싱')||
                                name.includes('서비스 기획')||
                                name.includes('기획/설계')||
                                name.includes('기획')||
                                name.includes('디자인')||
                                name.includes('서비스')||
                                name.includes('화면 퍼블리싱')||
                                name.includes('화면퍼블리싱');

          if (!isDesignItem) {
            // 예전 데이터에서는 page_count 필드가 없을 수 있으므로 안전하게 처리
            const pageCount = (typeof item.page_count === 'number') ? item.page_count : 0;
            if (pageCount > 0) {
              devLog(`       📃 ${item.name}: ${pageCount}페이지`);
            }
            totalPages += pageCount;
          } else {
            devLog(`       🎨 ${item.name}: 제외 (디자인 관련 항목)`);
          }
        }
      });
    });
  });

  devLog(`   ✅ 실제 기능 페이지 수 합계: ${totalPages}페이지 (화면설계/UI디자인 제외)`);
  return totalPages;
}

/**
 * 화면설계/UI디자인 항목의 가격 및 설명을 총 페이지 수 기반으로 업데이트
 */
export function updateDesignItemPrices(estimate: ProjectEstimate, totalPages: number, companyPriceTable?: { planning?: number; design?: number; publishing?: number }): ProjectEstimate {
  devLog('🎨 화면설계/UI디자인 가격 및 설명 업데이트 시작');
  devLog(`   📊 총 페이지 수: ${totalPages}페이지`);
  
  // 페이지 수가 0일 때도 화면설계/UI디자인 항목 업데이트 필요
  if (totalPages === 0) {
    devLog('   ⚠️ 총 페이지 수가 0 → 화면설계/UI디자인 항목을 0페이지/0원으로 업데이트');
  } else {
    devLog(`   💰 계산 공식: ${totalPages} × 150,000원 = ${totalPages * 150000}원`);
  }

  const updatedEstimate = JSON.parse(JSON.stringify(estimate)); // 깊은 복사
  
  try {
    // 단가 판정 유틸 및 기본 단가
    const defaults = { planning: 150000, design: 100000, publishing: 100000, default: 150000 };
    const designKeywords = [
      '기획', '기획/설계', '디자인', 'ui/ux', 'uiux', '화면설계', '화면디자인', '스토리보드',
      '퍼블리싱', '웹퍼블리싱', '화면퍼블리싱'
    ];

    const normalize = (s: any) => (s || '').toString().toLowerCase().replace(/\s+/g, '');

    // description에서 단가(원) 추출: "1장당 15만원", "1장당 150,000원", "본수 기준 1장당 15만원" 등
    const extractUnitFromDescription = (desc?: string): number | null => {
      if (!desc) return null;
      const s = desc.toLowerCase();
      // 만원 단위 예: "1장당 15만원"
      const manwon = s.match(/(?:1장당|장당|1장[^0-9]*)([0-9]+(?:[.,][0-9]+)?)\s*만원/);
      if (manwon) {
        const v = parseFloat(manwon[1].replace(',', '.'));
        if (!isNaN(v)) return Math.round(v * 10000);
      }
      // 원 단위 예: "1장당 150,000원"
      const won = s.match(/(?:1장당|장당|1장[^0-9]*)([0-9,]+)\s*원/);
      if (won) {
        const v = parseInt(won[1].replace(/,/g, ''), 10);
        if (!isNaN(v)) return v;
      }
      // 숫자만 있는 경우(예: "1장당 150000")
      const num = s.match(/(?:1장당|장당|1장[^0-9]*)([0-9]{3,})/);
      if (num) {
        const v = parseInt(num[1].replace(/,/g, ''), 10);
        if (!isNaN(v)) return v;
      }
      return null;
    };

    // 여러 텍스트 필드(description, memo, note 등)를 순서대로 검사하여 단가를 추출
    const extractUnitFromTexts = (texts: Array<string | undefined | null>): number | null => {
      for (const t of texts) {
        const v = extractUnitFromDescription(t || undefined);
        if (v && v > 0) return v;
      }
      return null;
    };

    (updatedEstimate.categories || []).forEach(category => {
      const normCat = normalize(category.category_name);

      (category.sub_categories || []).forEach(subCategory => {
        const normSub = normalize(subCategory.sub_category_name);

        (subCategory.items || []).forEach(item => {
          if (!item.is_deleted) {
            const normName = normalize(item.name);
            // 카테고리/서브카테고리/아이템명에서 키 결정
            const isDesignCategory = designKeywords.some(k => normCat.includes(k) || normSub.includes(k));
            const isDesignByName = designKeywords.some(k => normName.includes(k));
            const isDesignItem = isDesignCategory || isDesignByName;

            if (isDesignItem) {
              // 기존 item에 이미 page_count가 설정되어 있고 그 값이 10보다 크면 수정을 건너뜁니다.
              const existingPageCount = (typeof item.page_count === 'number') ? item.page_count : null;
              if (existingPageCount && existingPageCount > 10) {
                devLog(`   ⏭️ ${item.name}: 기존 페이지 수 ${existingPageCount} > 10 이므로 업데이트 건너뜀`);
                return; // forEach 내에서 현재 항목 처리 건너뜀
              }

              try {
                // 단가 결정 우선순위: companyPriceTable -> description에서 추출 -> defaults
                // companyPriceTable은 호출자가 전달한 값(우선) 또는 estimate 내부의 price_table(호환성) 사용
                const priceTableFromArgsOrEstimate: any = companyPriceTable || (estimate as any).price_table || null;

                // 항목 종류 키 결정 (planning, design, publishing)
                const determineKey = (): 'planning' | 'design' | 'publishing' | 'default' => {
                  if (normCat.includes('기획') || normSub.includes('기획') || normName.includes('기획')) return 'planning';
                  if (normCat.includes('디자인') || normSub.includes('디자인') || normName.includes('ui/ux') || normName.includes('디자인')) return 'design';
                  if (normCat.includes('퍼블리싱') || normSub.includes('퍼블리싱') || normName.includes('퍼블리싱')) return 'publishing';
                  return 'default';
                };

                const key = determineKey();

                let unit = defaults[key] || defaults.default;
                // 1) store/price table 우선 사용
                if (priceTableFromArgsOrEstimate && typeof priceTableFromArgsOrEstimate[key] === 'number') {
                  unit = priceTableFromArgsOrEstimate[key];
                }
                // 2) description에 장당 단가 명시되어 있으면 그것 우선
                // description 뿐 아니라 memo나 note 필드에서도 단가를 추출해 우선 사용
                const possibleTexts = [item.description, (item as any).memo, (item as any).note];
                const descUnit = extractUnitFromTexts(possibleTexts);
                if (descUnit && descUnit > 0) {
                  unit = descUnit;
                }

                const newPrice = totalPages * unit; // 페이지당 단가 적용
                const formattedPrice = newPrice.toLocaleString();

                // 기존 description에서 총 페이지 수 정보 제거 (있다면)
                let baseDescription = item.description || '';
                // 다양한 패턴으로 기존 페이지 수 정보 제거
                baseDescription = baseDescription
                  .replace(/\s*총\s*(장수|페이지\s*수)\s*:\s*\d+/g, '')
                  .replace(/\s*총\s*(장수|페이지\s*수)\s*\d+/g, '')
                  .replace(/\s*\(\s*총\s*(장수|페이지\s*수)\s*:\s*\d+\s*\)/g, '')
                  .trim();
                
                // 새로운 총 페이지 수 정보 추가
                const updatedDescription = `${baseDescription} \n총 페이지 수: ${totalPages}`;

                devLog(`   🔄 ${item.name}:`);
                devLog(`     💰 가격: ${item.price} → ${formattedPrice} (${totalPages}페이지)`);
                devLog(`     📝 설명: "${item.description}" → "${updatedDescription}"`);
                
                item.price = formattedPrice;
                item.description = updatedDescription;
                // 페이지 카운트 업데이트 (항목이 page_count 필드를 가지고 있든 없든 안전하게 설정)
                try {
                  item.page_count = totalPages;
                } catch (e) {
                  // 무시
                }
              } catch (itemError) {
                console.warn(`화면설계/UI디자인 항목 "${item.name}" 가격 업데이트 실패, 기존 값 유지:`, itemError);
                // 개별 항목 업데이트 실패 시 기존 값 유지 (아무것도 하지 않음)
              }
            }
          }
        });
      });
    });
  } catch (error) {
    console.warn('화면설계/UI디자인 가격 업데이트 중 오류 발생, 원본 견적 반환:', error);
    return estimate; // 전체 업데이트 실패 시 원본 반환
  }
  
  return updatedEstimate;
}

/**
 * 전체 예상 기간 계산 (메인 함수)
 */
export function calculateEstimatedPeriod(estimate: ProjectEstimate): {
  totalPages: number;
  planningDesignWeeks: number;
  totalFeDays: number;
  totalBeDays: number;
  pureDevelopmentDays: number;
  developmentWeeks: number;
  finalWeeks: number;
  estimatedPeriodText: string;
  updatedEstimate: ProjectEstimate;
} {
  devLog('📊 예상 기간 계산 시작:', estimate.project_name);

  try {
    // 1단계: 총 페이지 수 계산
    let totalPages = 0;
    let updatedEstimate = estimate;
    
    try {
      totalPages = calculateTotalPages(estimate.categories);
      devLog('1️⃣ 총 페이지 수:', totalPages, '페이지');
      
      // 1.5단계: 화면설계/UI디자인 가격 업데이트
      try {
        // store에서 회사별 단가표를 빌드하여 updateDesignItemPrices로 전달 (원본 estimate을 변경하지 않음)
        let priceTable: any = null;
        try {
          priceTable = buildPriceTableFromStore();
          devLog('   🧾 적용된 company price table:', priceTable);
        } catch (e) {
          devLog('   ⚠️ price table 빌드 실패, 기본값 사용:', e);
        }

        updatedEstimate = updateDesignItemPrices(estimate, totalPages, priceTable);
      } catch (priceError) {
        console.warn('가격 업데이트 실패, 원본 견적 사용:', priceError);
        updatedEstimate = estimate; // 가격 업데이트 실패 시 원본 사용
      }
    } catch (error) {
      console.warn('페이지 수 계산 실패, 기본값과 원본 견적 사용:', error);
      totalPages = 10; // 기본값
      updatedEstimate = estimate; // 원본 사용
    }
    
    // 2단계: 기획/디자인 기간 산출
    const planningDesignWeeks = calculatePlanningDesignPeriod(totalPages);
    devLog('2️⃣ 기획/디자인 기간:', planningDesignWeeks, '주');

    // 3단계: 기능별 개발 기간 합산
    let totalFeDays = 0;
    let totalBeDays = 0;
    
    try {
      const result = calculateDevelopmentDays(estimate.categories);
      totalFeDays = result.totalFeDays;
      totalBeDays = result.totalBeDays;
    } catch (error) {
      console.warn('개발 기간 계산 실패, 기본값 사용:', error);
      totalFeDays = 10; // 기본값
      totalBeDays = 10; // 기본값
    }
    
    devLog('3️⃣ 개발 기간 합산:');
    devLog('   - 프론트엔드:', totalFeDays, '일');
    devLog('   - 백엔드:', totalBeDays, '일');
    
    // 4단계: 순수 개발 기간 확정
    const pureDevelopmentDays = calculatePureDevelopmentDays(totalFeDays, totalBeDays);
    devLog('4️⃣ 순수 개발 기간:', pureDevelopmentDays, '일 (FE/BE 중 최대값)');

    // 5단계: 최종 프로젝트 기간 계산
    const developmentWeeks = pureDevelopmentDays > 0 ? Math.max(1, Math.ceil(pureDevelopmentDays / 5)) : 0;
    devLog('5️⃣ 개발 기간(주):', developmentWeeks, '주 (', pureDevelopmentDays, '일, 최소 1주 보장)');

    const finalWeeks = calculateFinalProjectPeriod(planningDesignWeeks, pureDevelopmentDays, totalPages);
    const testWeeks = totalPages === 0 ? 0 : 2;
    devLog('6️⃣ 최종 계산:', planningDesignWeeks, '주(기획/디자인) +', developmentWeeks, '주(개발) +', testWeeks, '주(검수/테스트) =', finalWeeks, '주');

    // 월 단위 계산 (1개월 = 4주)
    const weeksPerMonth = 4;
    const monthValue = Math.ceil(finalWeeks / weeksPerMonth);
    devLog('7️⃣ 월 단위 변환:', finalWeeks, '주 ÷', weeksPerMonth, '= ', (finalWeeks / weeksPerMonth).toFixed(1), '→', monthValue, '개월');

    const estimatedPeriodText = `${finalWeeks}주 (약 ${monthValue}개월)`;
    devLog('✅ 최종 결과:', estimatedPeriodText);

    return {
      totalPages,
      planningDesignWeeks,
      totalFeDays,
      totalBeDays,
      pureDevelopmentDays,
      developmentWeeks,
      finalWeeks,
      estimatedPeriodText,
      updatedEstimate
    };
  } catch (error) {
    console.error('예상 기간 계산 중 전체 오류 발생, 기본값으로 폴백:', error);
    
    // 전체 실패 시 기본값 반환
    return {
      totalPages: 10,
      planningDesignWeeks: 4,
      totalFeDays: 10,
      totalBeDays: 10,
      pureDevelopmentDays: 10,
      developmentWeeks: 2,
      finalWeeks: 8,
      estimatedPeriodText: '8주 (약 2개월)',
      updatedEstimate: estimate // 원본 견적 반환
    };
  }
}

/**
 * 실제 총 금액 계산 (삭제되지 않은 기능들의 가격 합산)
 */
export function calculateTotalAmount(estimate: ProjectEstimate): number {
  if (!estimate || !Array.isArray(estimate.categories)) {
    return 0;
  }

  let totalAmount = 0;

  (estimate.categories || []).forEach(category => {
    (category.sub_categories || []).forEach(subCategory => {
      (subCategory.items || []).forEach(item => {
        if (!item.is_deleted) {
          const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/,/g, '')) 
            : item.price;
          totalAmount += (price || 0);
        }
      });
    });
  });

  return totalAmount;
}
