import { css } from "styled-components";
import { AppColors } from "./colors";

/**
 * 사용자 정의 스크롤바 스타일 Mixin 옵션 인터페이스
 */
interface CustomScrollbarOptions {
  trackColor?: string;
  thumbColor?: string;
}

/**
 * 사용자 정의 스크롤바 스타일 Mixin
 * @param options - 스크롤바 색상 옵션 객체 ({ trackColor, thumbColor })
 */
export const customScrollbar = (options?: CustomScrollbarOptions) => {
  // 기본값 설정
  const trackColor = options?.trackColor ?? AppColors.background;
  const thumbColor = options?.thumbColor ?? AppColors.scroll;

  return css`
    overflow-y: scroll; /* 항상 스크롤바를 표시하여 공간 확보 */

    /* Webkit 계열 브라우저 (Chrome, Safari, new Edge) */
    &::-webkit-scrollbar {
      width: 8px; /* 스크롤바 너비 */
    }

    &::-webkit-scrollbar-track {
      background: ${trackColor};
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${thumbColor}; /* 스크롤바 막대 색상 */
      border-radius: 4px;
      /* 트랙 색상과 동일한 테두리를 주어 입체감 표현 (선택 사항, 제거 가능) */
      border: 2px solid ${trackColor};
    }

    /* Firefox */
    scrollbar-width: thin; /* 스크롤바 너비 ('auto' 또는 'thin') */
    scrollbar-color: ${thumbColor} ${trackColor}; /* thumb 색상, track 색상 */
  `;
};

/*
// 사용 예시:
import styled from 'styled-components';
import { customScrollbar } from '@/styles/commonStyles';
import { AppColors } from '@/styles/colors';

const ScrollableContainer = styled.div`
  height: 300px; // 높이 지정 필수
  background-color: ${AppColors.background}; // 예시 배경색
  // 기본 스크롤바 스타일 적용 (기본값 사용)
  ${customScrollbar()} 
  // 또는 특정 색상 지정
  // ${customScrollbar({ trackColor: AppColors.surface, thumbColor: AppColors.primary })}
`;
*/
