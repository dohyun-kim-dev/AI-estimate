'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { useDevice } from '@/contexts/DeviceContext';
import { InputStyles, LabelStyles } from '@/constants/componentConstants';
import Switch from './Switch';
const Container = styled.div `
  display: flex;
  flex-direction: ${({ $labelPosition }) => ($labelPosition === 'vertical' ? 'column' : 'row')};
  width: 100%;
  padding: ${({ $device }) => InputStyles.containerPadding[$device]};
  align-items: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'center' : 'flex-start')};
`;
const Label = styled.label `
  margin-left: 8px;
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '1' : 'none')};
`;
const SwitchWrapper = styled.div `
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '5' : '1')};
  display: flex;
  flex-direction: column;
  align-items: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'flex-start' : 'stretch')};
`;
export const SwitchInput = ({ value, onChange, label, labelColor, $labelPosition = 'vertical', }) => {
    const device = useDevice();
    const isChecked = value === 'Y';
    return (_jsxs(Container, { "$device": device, "$labelPosition": $labelPosition, children: [label && (_jsx(Label, { "$labelPosition": $labelPosition, style: {
                    fontSize: LabelStyles.fontSize[device],
                    color: labelColor || LabelStyles.color,
                }, children: label })), _jsx(SwitchWrapper, { "$labelPosition": $labelPosition, children: _jsx(Switch, { checked: isChecked, onToggle: () => onChange(isChecked ? 'N' : 'Y') }) })] }));
};
