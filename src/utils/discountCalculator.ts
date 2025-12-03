// 할인 계산 유틸리티
// PeriodSlider와 EstimateAccordion에서 공통으로 사용

export interface DiscountSettings {
  checkpointList: Array<{ checkpoint: number; discountRate: number }>;
  discountRate: string; // 'WEEK' | 'MONTH' | 'QUANTITY'
  rateRule: string; // 'FIXED' | 'DYNAMIC'
  minValue?: number;
  maxValue?: number;
}

export interface DiscountInfo {
  percentage: number;
  amount: number;
}

/**
 * 할인 정보 계산
 * @param periodValue - 연장 기간 값 (주, 월, 수량)
 * @param basePrice - 기본 가격
 * @param discountSettings - 할인 설정
 * @returns 할인 정보 (퍼센티지, 할인 금액)
 */
export function calculateDiscountInfo(
  periodValue: number,
  basePrice: number,
  discountSettings: DiscountSettings
): DiscountInfo {
  const { checkpointList, rateRule } = discountSettings;

  if (rateRule === 'FIXED') {
    // FIXED 모드: 체크포인트 단위마다 누적 할인
    const checkpointValue = checkpointList[0]?.checkpoint || 1;
    const discountRatePerCheckpoint = checkpointList[0]?.discountRate || 1.25;
    const totalSteps = Math.floor(periodValue / checkpointValue);
    const percentage = totalSteps * discountRatePerCheckpoint;
    
    return {
      percentage,
      amount: Math.floor(basePrice * percentage / 100)
    };
  } else {
    // DYNAMIC 모드: 각 체크포인트의 고정 할인율
    let percentage = 0;
    
    if (periodValue === 0) {
      percentage = 0;
    } else {
      // 현재 값과 정확히 일치하는 체크포인트 찾기
      const currentCheckpoint = checkpointList.find(cp => cp.checkpoint === periodValue);
      if (currentCheckpoint) {
        percentage = currentCheckpoint.discountRate;
      } else {
        percentage = 0;
      }
    }
    
    return {
      percentage,
      amount: Math.floor(basePrice * percentage / 100)
    };
  }
}

/**
 * 할인 적용된 가격 계산
 * @param basePrice - 기본 가격
 * @param discountInfo - 할인 정보
 * @returns 할인 적용된 가격
 */
export function applyDiscount(basePrice: number, discountInfo: DiscountInfo): number {
  return basePrice - discountInfo.amount;
}

/**
 * 할인 제외 항목 판별 (EstimateAccordion에서 사용하던 로직)
 */
export function isNonDiscountableItem(item: any): boolean {
  if (!item?.name) return false;

  const normalize = (s: string) =>
    (s ?? '')
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/[\s\-_./|\\,[\]{}:;'"`~!@#$%^&*+?<>·•]/g, '')
      .toLowerCase()
      .replace(/uxui/g, 'uiux');

  const NON_DISCOUNT_TOKENS = [
    '화면설계', '화면디자인', '화면퍼블리싱','설계',
    'uiux디자인', 'uidesign', 'uxdesign', 'guidesign',
    '스토리보드', '와이어프레임', '프로토타입', '프로토타이핑', '시안',
    '퍼블리싱', '퍼블', '마크업', 'markup', '정적코딩', 'htmlcss', 'html코딩', 'css코딩',
    '화면기획', '기획설계', '기획', '서비스 기획', '기획/설계', '디자인'
  ];

  const zws = '[\\s\\u200B-\\u200D\\uFEFF]*';
  const NON_DISCOUNT_REGEX: RegExp[] = [
    new RegExp(`화면${zws}(설계|디자인|퍼블리싱)`, 'i'),
    new RegExp(`(ui${zws}\\/?${zws}ux|ux${zws}\\/?${zws}ui|uiux|uxui)${zws}(디자인|design)?`, 'i'),
    new RegExp(`(스토리보드|와이어${zws}프레임|프로토타입|프로토타이핑|gui${zws}디자인|시안)`, 'i'),
    new RegExp(`(퍼블리싱|퍼블|마크업|markup|정적${zws}코딩|html${zws}\\/?${zws}css)`, 'i'),
    new RegExp(`화면${zws}(기획)`, 'i'),
    new RegExp(`기획`, 'i'),
    new RegExp(`화면${zws}설계${zws}\\(${zws}기획${zws}\\)`, 'i'),
  ];

  const heuristicScreenDesign = (raw: string) => {
    const clean = raw.replace(/[\u200B-\u200D\uFEFF]/g, '');
    return /화면/i.test(clean) && /(설계|디자인|퍼블리싱|마크업|기획)/i.test(clean);
  };

  const raw = String(item.name);
  const norm = normalize(raw);

  // 카테고리 기반
  if (item?.category && /(디자인|퍼블리싱|기획|화면)/i.test(item.category)) {
    return true;
  }

  // 태그 기반
  if (Array.isArray(item?.tags) && item.tags.some(Boolean)) {
    for (const t of item.tags) {
      const tRaw = String(t ?? '');
      const tNorm = normalize(tRaw);
      if (NON_DISCOUNT_REGEX.some((re) => re.test(tRaw))) return true;
      if (NON_DISCOUNT_TOKENS.some((tok) => tNorm.includes(normalize(tok)))) return true;
    }
  }

  // 원문 정규식
  if (NON_DISCOUNT_REGEX.some((re) => re.test(raw))) return true;

  // 정규화 토큰 포함
  if (NON_DISCOUNT_TOKENS.some((tok) => norm.includes(normalize(tok)))) return true;

  // 휴리스틱
  if (heuristicScreenDesign(raw)) return true;

  // 괄호 안에 기획이 포함된 경우
  if (/\([^)]*기획[^)]*\)/i.test(raw)) return true;

  return false;
}
