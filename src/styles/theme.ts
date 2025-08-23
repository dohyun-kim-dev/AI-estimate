// src/styles/theme.ts
export const lightTheme = {
  // 사용자가 제공한 라이트 모드 색상
  body: '#FFFFFF', // 가장 바깥 배경
  surface1: '#F0F4F9', // 컴포넌트 배경
  surface2: '#F7F7F7', // 헤더 등 강조 영역 배경
  surface3: '#FFFFFF', // 헤더 등 강조 영역 배경
  
  // 텍스트 및 기타 색상
  text: '#171B23', // 기본 텍스트
  subtleText: '#666666', // 보조 텍스트
  border: '#CBCBCC', // 테두리
  accent: '#000000', // 강조색
  track: '#B5B5B5', // 슬라이더 트랙
  pick:'#D1D5DE', //선택된 색

  accordionHeader: '#F8F8F8',
  subAccordionHeader: '#FFFFFF',

  // 아코디언 레벨별 배경색
  accordionLevel1: '#ffffff',
  accordionLevel2: '#F8F8F8',
  accordionLevel3: '#f0f0f0',

  actionButton: '#F3F3F3',
};

export const darkTheme = {
  // 사용자가 제공한 다크 모드 색상
  body: '#08080F', // 가장 바깥 배경
  surface1: '#1F2937', // 컴포넌트 배경
  surface2: '#171B23', // 헤더 등 강조 영역 배경
  surface3: '#1E212D', // 헤더 등 강조 영역 배경
  track: '#374151', // 슬라이더 트랙
  // 텍스트 및 기타 색상
  text: '#F8F8F8', // 기본 텍스트
  subtleText: '#A1A1AA', // 보조 텍스트
  border: '#374151', // 테두리
  accent: '#3391FF', // 강조색
  pick : '#434B5D', //선택된 색

  accordionHeader: '#1C2128',
  subAccordionHeader: '#21262D',

  // 아코디언 레벨별 배경색
  accordionLevel1: '#1E1E24',
  accordionLevel2: '#1E1E24',
  accordionLevel3: '#1E1E24',

  actionButton: '#283139',
};

export type Theme = typeof lightTheme;