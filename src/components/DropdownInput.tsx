'use client';

/**
 * DropdownInput은 커스텀 드롭다운입니다.
 * value, onChange, options, errorMessage 등 상태 및 동작을 포함하며,
 * 디자인 시스템을 따라 일관된 드롭다운 UI를 제공합니다.
 */

import React from 'react';
import { useDevice } from '@/contexts/DeviceContext';
import type { DeviceType } from '@/types/device';
import DropdownFieldElement from '@/elements/DropdownFieldElement';
import { AppColors } from '@/styles/colors';
import { SimpleSelect } from '@/elements/RadixSelectElement';

interface DropdownInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  width?: string;
  errorMessage?: string;

  // ✅ Trigger 스타일
  $triggerBackgroundColor?: string;
  $triggerTextColor?: string;
  $triggerFontSize?: string;
  $triggerFontWeight?: string;
  $height?: string;
  $radius?: string;
  $isShowIcon?: boolean;
  $triggerHoverBackgroundColor?: string;
  $triggerHoverTextColor?: string;

  // ✅ Content 스타일
  $contentBackgroundColor?: string;
  $contentTextColor?: string;
  $contentFontSize?: string;
  $contentFontWeight?: string;

  $itemHoverBackgroundColor?: string;
  $itemHoverTextColor?: string;

  // ✅ 추가된 내용
  $triggerContent?: React.ReactNode; // (nullable) 트리거에 커스텀 렌더링을 허용
}

const DropdownInput = ({
  value,
  onChange,
  options,
  width,
  errorMessage,
  // trigger style
  $triggerBackgroundColor,
  $triggerTextColor,
  $triggerFontSize,
  $triggerFontWeight,
  $height,
  $radius,
  $isShowIcon = true,
  $triggerHoverBackgroundColor,
  $triggerHoverTextColor,
  // content style
  $contentBackgroundColor,
  $contentTextColor,
  $contentFontSize,
  $contentFontWeight,
  $itemHoverBackgroundColor,
  $itemHoverTextColor,
  // 추가된 props
  $triggerContent,
}: DropdownInputProps) => {
  const device: DeviceType = useDevice();

  return (
    <DropdownFieldElement
      $device={device}
      $backgroundColor={$triggerBackgroundColor}
      $textColor={$triggerTextColor}
      style={{ width }}
    >
      <SimpleSelect
        options={options.map((opt) => opt.label)}
        value={options.find((opt) => opt.value === value)?.label || ''}
        onChange={(label) => {
          const selectedOption = options.find((opt) => opt.label === label);
          if (selectedOption) {
            onChange(selectedOption.value);
          }
        }}
        $height={$height}
        $radius={$radius}
        $triggerFontSize={$triggerFontSize}
        $triggerFontWeight={$triggerFontWeight}
        $triggerTextColor={$triggerTextColor}
        $triggerBackgroundColor={$triggerBackgroundColor}
        $triggerHoverBackgroundColor={$triggerHoverBackgroundColor}
        $triggerHoverTextColor={$triggerHoverTextColor}
        $isShowIcon={$isShowIcon}
        $contentBackgroundColor={$contentBackgroundColor}
        $contentTextColor={$contentTextColor}
        $contentFontSize={$contentFontSize}
        $contentFontWeight={$contentFontWeight}
        $itemHoverBackgroundColor={$itemHoverBackgroundColor}
        $itemHoverTextColor={$itemHoverTextColor}
        $triggerContent={$triggerContent} // ✅ SimpleSelect에 triggerContent 전달
      />

      {errorMessage && (
        <span
          style={{
            color: AppColors.error,
            marginTop: '4px',
            fontSize: '12px',
          }}
        >
          {errorMessage}
        </span>
      )}
    </DropdownFieldElement>
  );
};

export default DropdownInput;