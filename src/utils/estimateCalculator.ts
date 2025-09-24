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
  
  if (totalPages <= 10) {
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
  console.log('💻 기능별 개발 기간 합산 시작');
  let totalFeDays = 0;
  let totalBeDays = 0;

  categories.forEach(category => {
    console.log(`   📁 카테고리: ${category.category_name}`);
    category.sub_categories.forEach(subCategory => {
      devLog(`     📂 하위 카테고리: ${subCategory.sub_category_name}`);
      subCategory.items.forEach(item => {
        if (!item.is_deleted) {
          // fe, be 문자열을 숫자로 변환 (예: "3일" -> 3, "3" -> 3)
          const feMatch = item.fe.match(/(\d+)/);
          const beMatch = item.be.match(/(\d+)/);
          
          const feDays = feMatch ? parseInt(feMatch[1]) : 0;
          const beDays = beMatch ? parseInt(beMatch[1]) : 0;
          
          if (feDays > 0 || beDays > 0) {
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
  pureDevelopmentDays: number
): number {
  devLog('🏁 최종 프로젝트 기간 종합 계산');
  devLog(`   📋 입력값: 기획/디자인 ${planningDesignWeeks}주, 순수 개발 ${pureDevelopmentDays}일`);

  // 개발 기간(주) = CEILING(순수 개발일 / 5)
  const developmentWeeks = Math.ceil(pureDevelopmentDays / 5);
  devLog(`   📈 개발 기간: ${pureDevelopmentDays}일 ÷ 5 = ${(pureDevelopmentDays / 5).toFixed(1)} → ${developmentWeeks}주 (올림)`);

  // 최종 예상 기간(주) = 기획/디자인 기간 + 개발 기간 + 2주(검수/테스트)
  const finalWeeks = planningDesignWeeks + developmentWeeks + 2;
  devLog(`   🎯 최종 계산: ${planningDesignWeeks}주(기획/디자인) + ${developmentWeeks}주(개발) + 2주(검수/테스트) = ${finalWeeks}주`);

  return finalWeeks;
}

/**
 * 총 페이지 수 계산
 * 화면설계, UI/UX디자인을 제외한 나머지 기능들의 page_count를 합산
 */
export function calculateTotalPages(categories: Category[]): number {
  devLog('📄 총 페이지 수 계산 시작 (화면설계, UI/UX디자인 제외)');
  let totalPages = 0;

  categories.forEach(category => {
    devLog(`   📁 카테고리: ${category.category_name}`);
    category.sub_categories.forEach(subCategory => {
      devLog(`     📂 하위 카테고리: ${subCategory.sub_category_name}`);
      subCategory.items.forEach(item => {
        if (!item.is_deleted) {
          // 화면설계, UI/UX디자인은 페이지 수 계산에서 제외
          const isDesignItem = item.name === '화면설계' || 
                              item.name === 'UI/UX디자인' || 
                              item.name === '화면 설계' || 
                              item.name === 'UI/UX 디자인' ||
                               item.name === '스토리보드' ||
                              item.name === '화면디자인';
          
          if (!isDesignItem) {
            const pageCount = item.page_count || 0;
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
export function updateDesignItemPrices(estimate: ProjectEstimate, totalPages: number): ProjectEstimate {
  devLog('🎨 화면설계/UI디자인 가격 및 설명 업데이트 시작');
  devLog(`   📊 총 페이지 수: ${totalPages}페이지`);
  devLog(`   💰 계산 공식: ${totalPages} × 150,000원 = ${totalPages * 150000}원`);

  const updatedEstimate = JSON.parse(JSON.stringify(estimate)); // 깊은 복사
  
  updatedEstimate.categories.forEach(category => {
    category.sub_categories.forEach(subCategory => {
      subCategory.items.forEach(item => {
        if (!item.is_deleted) {
          const isDesignItem = item.name === '화면설계' || 
                              item.name === 'UI/UX디자인' || 
                              item.name === '화면 설계' || 
                              item.name === 'UI/UX 디자인' ||
                               item.name === '스토리보드' ||
                              item.name === '화면디자인';
          
          if (isDesignItem) {
            const newPrice = totalPages * 150000; // 15만원
            const formattedPrice = newPrice.toLocaleString();

            // 기존 description에서 총 페이지 수 정보 제거 (있다면)
            let baseDescription = item.description;
            // 다양한 패턴으로 기존 페이지 수 정보 제거
            baseDescription = baseDescription
              .replace(/\s*총\s*(장수|페이지\s*수)\s*:\s*\d+/g, '')
              .replace(/\s*총\s*(장수|페이지\s*수)\s*\d+/g, '')
              .replace(/\s*\(\s*총\s*(장수|페이지\s*수)\s*:\s*\d+\s*\)/g, '')
              .trim();
            
            // 새로운 총 페이지 수 정보 추가
            const updatedDescription = `${baseDescription} \n총 페이지 수: ${totalPages}`;

            devLog(`   🔄 ${item.name}:`);
            devLog(`     💰 가격: ${item.price} → ${formattedPrice}`);
            devLog(`     📝 설명: "${item.description}" → "${updatedDescription}"`);
            
            item.price = formattedPrice;
            item.description = updatedDescription;
            item.page_count = totalPages; // 페이지 카운트도 업데이트
          }
        }
      });
    });
  });
  
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

  // 1단계: 총 페이지 수 계산
  const totalPages = calculateTotalPages(estimate.categories);
  devLog('1️⃣ 총 페이지 수:', totalPages, '페이지');

  // 1.5단계: 화면설계/UI디자인 가격 업데이트
  const updatedEstimate = updateDesignItemPrices(estimate, totalPages);
  
  // 2단계: 기획/디자인 기간 산출
  const planningDesignWeeks = calculatePlanningDesignPeriod(totalPages);
  devLog('2️⃣ 기획/디자인 기간:', planningDesignWeeks, '주');

  // 3단계: 기능별 개발 기간 합산
  const { totalFeDays, totalBeDays } = calculateDevelopmentDays(estimate.categories);
  devLog('3️⃣ 개발 기간 합산:');
  devLog('   - 프론트엔드:', totalFeDays, '일');
  devLog('   - 백엔드:', totalBeDays, '일');
  
  // 4단계: 순수 개발 기간 확정
  const pureDevelopmentDays = calculatePureDevelopmentDays(totalFeDays, totalBeDays);
  devLog('4️⃣ 순수 개발 기간:', pureDevelopmentDays, '일 (FE/BE 중 최대값)');

  // 5단계: 최종 프로젝트 기간 계산
  const developmentWeeks = Math.ceil(pureDevelopmentDays / 5);
  devLog('5️⃣ 개발 기간(주):', developmentWeeks, '주 (', pureDevelopmentDays, '일 ÷ 5 = ', (pureDevelopmentDays / 5).toFixed(1), '→', developmentWeeks, ')');

  const finalWeeks = calculateFinalProjectPeriod(planningDesignWeeks, pureDevelopmentDays);
  devLog('6️⃣ 최종 계산:', planningDesignWeeks, '주(기획/디자인) +', developmentWeeks, '주(개발) + 2주(검수/테스트) =', finalWeeks, '주');

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
}
