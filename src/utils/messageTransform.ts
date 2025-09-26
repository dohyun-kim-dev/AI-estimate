// 메시지 변환 유틸리티 함수
export const transformMessageForDisplay = (content: string): string => {
  // AI 예산 줄이기 패턴 감지 및 변환
  if (content.includes('AI 예산 줄이기') || content.includes('예산을 줄이')) {
    const projectNameMatch = content.match(/프로젝트명:\s*([^\n]*)/);
    const projectName = projectNameMatch ? projectNameMatch[1].trim() : '프로젝트';
    return `${projectName} - AI 예산 줄이기`;
  }
  
  // AI 맞춤 추천 패턴 감지 및 변환
  if (content.includes('AI 맞춤 추천') || content.includes('맞춤 추천')) {
    const projectNameMatch = content.match(/프로젝트명:\s*([^\n]*)/);
    const projectName = projectNameMatch ? projectNameMatch[1].trim() : '프로젝트';
    return `${projectName} - AI 맞춤 추천`;
  }
  
  // [현재 견적 정보] 패턴이 포함된 경우 프로젝트명만 추출
  if (content.includes('[현재 견적 정보]')) {
    const projectNameMatch = content.match(/프로젝트명:\s*([^\n]*)/);
    if (projectNameMatch) {
      const projectName = projectNameMatch[1].trim();
      // 액션 유형 결정
      if (content.includes('예산을 줄이')) {
        return `${projectName} - AI 예산 줄이기`;
      } else if (content.includes('맞춤 추천')) {
        return `${projectName} - AI 맞춤 추천`;
      }
      return projectName; // 기본적으로 프로젝트명만
    }
  }
  
  return content; // 변환할 패턴이 없으면 원본 반환
};
