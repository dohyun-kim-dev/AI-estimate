import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { useDevice } from '@/contexts/DeviceContext';
import { InputStyles, LabelStyles } from '@/constants/componentConstants';
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
const SelectionWrapper = styled.div `
  display: flex;
  gap: 16px;
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '5' : '1')};
  width: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'auto' : '100%')};
`;
const OptionButton = styled.button `
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
export const SelectionField = ({ value, onChange, label, leftLabel, rightLabel, labelColor, $labelPosition = 'vertical', }) => {
    const device = useDevice();
    return (_jsxs(Container, { "$device": device, "$labelPosition": $labelPosition, children: [label && (_jsx(Label, { "$labelPosition": $labelPosition, style: {
                    fontSize: LabelStyles.fontSize[device],
                    color: labelColor || LabelStyles.color,
                }, children: label })), _jsx(SelectionWrapper, { "$labelPosition": $labelPosition, children: [leftLabel, rightLabel].map((option) => (_jsx(OptionButton, { selected: value === option, onClick: () => onChange(option), children: option }, option))) })] }));
};
export default SelectionField;
