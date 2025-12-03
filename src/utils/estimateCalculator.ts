// 예상 기간 산출 로직 (Estimated Period Calculation Logic)

import { devLog } from "./devLogger";

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
 * description 또는 이름 텍스트에서 "N페이지" 패턴을 찾아 정수로 반환
 * 예: "(22페이지)", "22페이지", "총 22페이지" 등
 */
function parsePageCountFromText(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const patterns = [/(?:총\s*)?(\d{1,4})\s*페이지/, /\((\d{1,4})\s*페이지\)/, /(\d{1,4})\s*장/];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > 0) return n;
    }
  }
  return 0;
}

/**
 * 총 페이지 수 계산
 * 화면설계, UI/UX디자인을 제외한 나머지 기능들의 page_count를 합산
 */
export function calculateTotalPages(categories: Category[]): number {
  devLog('📄 총 페이지 수 계산 시작 (화면설계, UI/UX디자인 제외)');
  let totalPages = 0;

  const loggedExclusions = new Set<string>();
  const seenItems = new Set<string>();

  (categories || []).forEach(category => {
    const categoryName = category.category_name || '';
    devLog(`   📁 카테고리: ${categoryName}`);
    // 기본 카테고리는 합산에서 제외
    if (/기본/.test(categoryName)) {
      devLog(`     ⛔ 카테고리 '${categoryName}'는 기본 항목으로 간주되어 페이지 합산에서 제외됩니다.`);
      return;
    }

    (category.sub_categories || []).forEach(subCategory => {
      devLog(`     📂 하위 카테고리: ${subCategory.sub_category_name}`);
      (subCategory.items || []).forEach(item => {
        if (item.is_deleted) return;

        // 중복 항목(item_id)이 있으면 한 번만 계산
        if (item.item_id) {
          if (seenItems.has(item.item_id)) return;
          seenItems.add(item.item_id);
        }

        const nameNormalized = (item.name || '').replace(/\s+/g, '');
        const isDesignItem = nameNormalized === '화면설계' ||
                             nameNormalized.includes('화면설계') ||
                             nameNormalized.includes('화면설계') ||
                             nameNormalized.includes('UI/UX디자인') ||
                             nameNormalized.includes('UI/UX디자인') ||
                             nameNormalized.includes('스토리보드') ||
                             nameNormalized.includes('화면디자인') ||
                             nameNormalized.includes('웹퍼블리싱') ||
                             nameNormalized.includes('웹퍼블리싱') ||
                             nameNormalized.includes('퍼블리싱') ||
                             nameNormalized.includes('화면퍼블리싱') ||
                             nameNormalized.includes('서비스기획') ||
                             nameNormalized.includes('기획/설계') ||
                             nameNormalized.includes('기획') ||
                             nameNormalized.includes('디자인');


        const parsedPageFromDesc = parsePageCountFromText(item.description || item.name || '');

        if (isDesignItem) {
          const key = item.item_id || `${item.name}::${parsedPageFromDesc || item.page_count}`;
          if (!loggedExclusions.has(key)) {
            devLog(`       🎨 ${item.name}: 제외 (디자인 관련 항목)`);
            loggedExclusions.add(key);
          }
          return;
        }

        const pageCount = parsedPageFromDesc > 0 ? parsedPageFromDesc : ((typeof item.page_count === 'number') ? item.page_count : 0);
        if (pageCount > 0) {
          devLog(`       📃 ${item.name}: ${pageCount}페이지 (parsedFromDesc=${parsedPageFromDesc}, rawPageCount=${item.page_count})`);
        }
        totalPages += pageCount;
      });
    });
  });

  devLog(`   ✅ 실제 기능 페이지 수 합계: ${totalPages}페이지 (화면설계/UI디자인 제외)`);
  return totalPages;
}

/**
 * 화면설계/UI디자인 항목의 가격 및 설명을 총 페이지 수 기반으로 업데이트
 */
export function updateDesignItemPrices(estimate: ProjectEstimate, totalPages: number): ProjectEstimate {
  devLog('🎨 화면설계/UI디자인 가격 및 설명 업데이트 시작');
  devLog(`   📊 총 페이지 수: ${totalPages}페이지`);

  const updatedEstimate = JSON.parse(JSON.stringify(estimate)); // 깊은 복사

  try {
    (updatedEstimate.categories || []).forEach(category => {
      (category.sub_categories || []).forEach(subCategory => {
        (subCategory.items || []).forEach(item => {
          if (item.is_deleted) return;

          const nameNormalized = (item.name || '').replace(/\s+/g, '');
          const isDesignItem = nameNormalized === '화면설계' ||
                                nameNormalized.includes('화면설계') ||
                                nameNormalized.includes('UI/UX디자인') ||
                                nameNormalized.includes('스토리보드') ||
                                nameNormalized.includes('화면디자인') ||
                                nameNormalized.includes('웹퍼블리싱') ||
                                nameNormalized.includes('퍼블리싱') ||
                                nameNormalized.includes('화면퍼블리싱')||
                                nameNormalized.includes('서비스기획') ||
                             nameNormalized.includes('기획/설계') ||
                             nameNormalized.includes('기획') ||
                             nameNormalized.includes('디자인');

          if (!isDesignItem) return;

          try {
            const newPrice = totalPages * 150000; // 페이지당 15만원
            const formattedPrice = newPrice.toLocaleString();

            let baseDescription = item.description || '';
            baseDescription = baseDescription
              .replace(/\s*총\s*(장수|페이지\s*수)\s*:\s*\d+/g, '')
              .replace(/\s*총\s*(장수|페이지\s*수)\s*\d+/g, '')
              .replace(/\s*\(\s*총\s*(장수|페이지\s*수)\s*:\s*\d+\s*\)/g, '')
              .trim();

            const updatedDescription = `${baseDescription} \n총 페이지 수: ${totalPages}`;

            devLog(`   🔄 ${item.name}:`);
            devLog(`     💰 가격: ${item.price} → ${formattedPrice} (${totalPages}페이지)`);
            devLog(`     📝 설명: "${item.description}" → "${updatedDescription}"`);

            item.price = formattedPrice;
            item.description = updatedDescription;
            // 기존 page_count를 덮어쓰지 않음. 대신 별도 필드에 저장
            try { (item as any)._design_page_count = totalPages; } catch (e) {}
          } catch (itemError) {
            console.warn(`화면설계/UI디자인 항목 "${item.name}" 가격 업데이트 실패, 기존 값 유지:`, itemError);
          }
        });
      });
    });
  } catch (error) {
    console.warn('화면설계/UI디자인 가격 업데이트 중 오류 발생, 원본 견적 반환:', error);
    return estimate;
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
        updatedEstimate = updateDesignItemPrices(estimate, totalPages);
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
