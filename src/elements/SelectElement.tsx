// src/elements/SelectElement.tsx

/**
 * SelectElement는 디자인 시스템에서 가장 기본 단위인 "element" 레벨의 셀렉트 박스입니다.
 * 상태나 로직 없이 시각적 스타일만 포함하며, 재사용 가능한 atomic 요소입니다.
 */

import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import type { DeviceType } from '@/types/device';

interface SelectElementProps {
  $device: DeviceType;
  radius?: string;
  fontSize?: string;
  height?: string;
  width?: string;
  value?: string;
  options?: { label: string; value: string }[];
  padding?: string;
  isShowIcon?: boolean; // 드롭다운 아이콘 표시 여부 (기본 true)
  hasBorder?: boolean; // 테두리 표시 여부 (기본 true)
}

const SelectElement = styled.select<SelectElementProps>`
  appearance: none;
  background-color: ${AppColors.background};
  border: ${({ hasBorder }) =>
    hasBorder !== false ? `1px solid ${AppColors.borderLight}` : 'none'};
  color: ${AppColors.onBackground};
  font-size: ${({ fontSize }) => fontSize || AppTextStyles.body1.fontSize};
  font-weight: ${AppTextStyles.body1.fontWeight};
  line-height: ${AppTextStyles.body1.lineHeight};
  cursor: pointer;
  width: ${({ width }) => width || '100%'};
  border-radius: ${({ radius }) => radius || '6px'};
  height: ${({ height }) => height || '36px'};
  padding: ${({ padding, isShowIcon }) =>
    padding || (isShowIcon !== false ? '4px 36px 4px 12px' : '4px 12px')};
  text-align: left; // 왼쪽 정렬 (양쪽 space-between을 위해)

  ${({ isShowIcon }) =>
    isShowIcon !== false &&
    `
      background-image: url("data:image/svg+xml,%3Csvg fill='none' stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px 16px;
    `}

  &:focus {
    border-color: ${AppColors.onSurface};
    outline: none;
  }
`;

export default SelectElement;