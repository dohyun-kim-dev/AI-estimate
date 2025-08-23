'use client';

import React from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { useDevice } from '@/contexts/DeviceContext';
import { InputStyles, LabelStyles } from '@/constants/componentConstants';
import type { DeviceType } from '@/types/device';
import Switch from './Switch';

interface SwitchInputProps {
  value: 'Y' | 'N';
  onChange: (val: 'Y' | 'N') => void;
  label?: string;
  labelColor?: string;
  $labelPosition?: 'vertical' | 'horizontal';
}

const Container = styled.div<{
  $device: DeviceType;
  $labelPosition: 'vertical' | 'horizontal';
}>`
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

const SwitchWrapper = styled.div<{ $labelPosition: 'vertical' | 'horizontal' }>`
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '5' : '1')};
  display: flex;
  flex-direction: column;
  align-items: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'flex-start' : 'stretch')};
`;

export const SwitchInput = ({
  value,
  onChange,
  label,
  labelColor,
  $labelPosition = 'vertical',
}: SwitchInputProps) => {
  const device = useDevice();
  const isChecked = value === 'Y';

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

      <SwitchWrapper $labelPosition={$labelPosition}>
        <Switch
          checked={isChecked}
          onToggle={() => onChange(isChecked ? 'N' : 'Y')}
        />
      </SwitchWrapper>
    </Container>
  );
};
