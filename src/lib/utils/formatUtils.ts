/**
 * 전화번호 포맷팅 함수
 * 숫자만 추출하여 xxx-xxxx-xxxx 형태로 포맷팅
 * @param phone - 전화번호 문자열
 * @returns 포맷팅된 전화번호 또는 원본 (포맷팅할 수 없는 경우)
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  // null, undefined, 빈 문자열 처리
  if (!phone || phone.trim() === '' || phone === '-') {
    return '-';
  }

  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '');
  
  // 숫자가 없거나 너무 짧으면 원본 반환
  if (numbers.length < 10) {
    return phone;
  }

  // 한국 휴대폰 번호 포맷팅 (010-xxxx-xxxx)
  if (numbers.length === 11 && numbers.startsWith('010')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  
  // 일반 전화번호 포맷팅 (02-xxx-xxxx, 031-xxx-xxxx 등)
  if (numbers.length === 10) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  // 기타 경우는 원본 반환
  return phone;
}

/**
 * 긴 텍스트를 처리하는 함수 (GenericDataTable에서 사용)
 * @param text - 원본 텍스트
 * @param maxLength - 첫 번째 줄 최대 길이 (기본값: 20)
 * @returns 포맷팅된 텍스트
 */
export function formatLongText(text: string | null | undefined, maxLength: number = 20): string {
  if (!text || text.trim() === '') {
    return '-';
  }

  const textStr = String(text);
  
  // 짧으면 그대로 반환
  if (textStr.length <= maxLength) {
    return textStr;
  }

  // 첫 번째 줄과 나머지로 분리
  const firstLine = textStr.slice(0, maxLength);
  const remaining = textStr.slice(maxLength);

  // 두 번째 줄도 maxLength를 초과하면 말줄임표 처리
  if (remaining.length > maxLength) {
    return `${firstLine}\n${remaining.slice(0, maxLength)}...`;
  }

  return `${firstLine}\n${remaining}`;
}
