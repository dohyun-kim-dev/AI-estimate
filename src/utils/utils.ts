// src/app/ai-estimate/utils.ts

/**
 * "4,000,000" 같은 통화 문자열에서 쉼표를 제거하고 숫자로 변환합니다.
 * @param priceStr - 변환할 가격 문자열
 * @returns 숫자로 변환된 가격 (소수점 포함)
 */
export const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/,/g, ''));
};

/**
 * 숫자를 "4,000,000" 같은 통화 형식의 문자열로 변환합니다.
 * @param number - 변환할 숫자
 * @returns 통화 형식의 문자열
 */
export const formatPrice = (number: number): string => {
  return number.toLocaleString('ko-KR');
};
