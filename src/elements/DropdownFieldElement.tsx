import styled from 'styled-components';
import type { DeviceType } from '@/types/device';
import { InputStyles } from '@/constants/componentConstants';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';

interface DropdownFieldElementProps {
  $device: DeviceType;
  $backgroundColor?: string; // 배경색 (nullable)
  $textColor?: string; // 텍스트 색상 (nullable)
}

const DropdownFieldElement = styled.div<DropdownFieldElementProps>`
  display: flex;
  flex-direction: column;
  max-width: ${({ $device }) => InputStyles.containerMaxWidth[$device]};
  width: 100%;
  padding: ${({ $device }) => InputStyles.containerPadding[$device]};
  background-color: ${({ $backgroundColor }) => $backgroundColor || AppColors.background}; /* 기본값: AppColors.background */
  color: ${({ $textColor }) => $textColor || AppColors.onBackground}; /* 기본값: AppColors.onBackground */
  font-size: ${AppTextStyles.body1.fontSize}; /* 기본 텍스트 스타일 */
  font-weight: ${AppTextStyles.body1.fontWeight};
  line-height: ${AppTextStyles.body1.lineHeight};
`;

export default DropdownFieldElement;