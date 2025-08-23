import React from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { useDevice } from '@/contexts/DeviceContext';
import type { DeviceType } from '@/types/device';
import { InputStyles, LabelStyles } from '@/constants/componentConstants';

const Container = styled.div<{ $device: DeviceType; $labelPosition: 'vertical' | 'horizontal' }>`
  display: flex;
  flex-direction: ${({ $labelPosition }) => ($labelPosition === 'vertical' ? 'column' : 'row')};
  width: 100%;
  padding: ${({ $device }) => InputStyles.containerPadding[$device]};
  align-items: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'center' : 'flex-start')};
`;

const Label = styled.label<{ $labelPosition: 'vertical' | 'horizontal' }>`
  margin-left: 8px;
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '1' : 'none')};
`;

const SelectionWrapper = styled.div<{ $labelPosition: 'vertical' | 'horizontal' }>`
  display: flex;
  gap: 16px;
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '5' : '1')};
  width: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'auto' : '100%')};
`;

const OptionButton = styled.button<{ selected: boolean }>`
  flex: 1; // <== 추가: 버튼이 반반 차지
  padding: 8px 16px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid ${({ selected }) => (selected ? AppColors.primary : AppColors.border)};
  background-color: ${({ selected }) => (selected ? AppColors.primary : 'transparent')};
  color: ${({ selected }) => (selected ? AppColors.onPrimary : AppColors.onSurface)};
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background-color: ${({ selected }) => (selected ? AppColors.primary : AppColors.shadowMedium)};
  }
`;


interface SelectionFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  leftLabel: string;
  rightLabel: string;
  labelColor?: string;
  $labelPosition?: 'vertical' | 'horizontal';
}

export const SelectionField = ({
  value,
  onChange,
  label,
  leftLabel,
  rightLabel,
  labelColor,
  $labelPosition = 'vertical',
}: SelectionFieldProps) => {
  const device = useDevice();

  return (
    <Container $device={device} $labelPosition={$labelPosition}>
      {label && (
        <Label
          $labelPosition={$labelPosition}
          style={{
            fontSize: LabelStyles.fontSize[device],
            color: labelColor || LabelStyles.color,
          }}
        >
          {label}
        </Label>
      )}
      <SelectionWrapper $labelPosition={$labelPosition}>
        {[leftLabel, rightLabel].map((option) => (
          <OptionButton
            key={option}
            selected={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </OptionButton>
        ))}
      </SelectionWrapper>
    </Container>
  );
};
export default SelectionField;