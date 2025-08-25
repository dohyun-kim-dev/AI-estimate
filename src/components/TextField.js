'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AppColors } from '@/styles/colors';
import { useDevice } from '@/contexts/DeviceContext';
import { StyledInput, StyledTextarea } from '@/elements/InputElement';
import { InputStyles, LabelStyles } from '@/constants/componentConstants';
const Label = styled.label `
  margin-left: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '8px' : '0')};
  margin-bottom: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '0' : '4px')};
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '1' : 'none')};
`;
const Container = styled.div `
  display: flex;
  flex-direction: ${({ $labelPosition }) => ($labelPosition === 'vertical' ? 'column' : 'row')};
  width: 100%;
  padding: ${({ $device }) => InputStyles.containerPadding[$device]};
  align-items: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'center' : 'flex-start')};
`;
const InputWrapper = styled.div `
  display: flex;
  flex-direction: column;
  flex: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? '5' : '1')};
  width: ${({ $labelPosition }) => ($labelPosition === 'horizontal' ? 'auto' : '100%')};
`;
const InputFieldWrapper = styled.div `
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
`;
const ErrorText = styled.span `
  color: ${AppColors.error};
  font-size: 12px;
  margin-top: 4px;
  margin-left: 4px;
`;
const SuffixIconWrapper = styled.div `
  position: absolute;
  right: ${({ $device }) => InputStyles.suffixIconRight[$device]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ $isPasswordVisible }) => $isPasswordVisible ? AppColors.iconPrimary : AppColors.iconDisabled};
`;
export const TextField = ({ value, onChange, placeholder, errorMessage, showSuffixIcon, isPasswordField = false, readOnly = false, multiline = false, minLines, maxLines, radius, fontSize, height, padding, paddingRight, label, labelColor, $labelPosition = 'vertical', $inputBackgroundColor, $placeholderColor, $textColor, $borderColor, autoComplete, }) => {
    const device = useDevice();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const resolvedInputType = isPasswordField && !isPasswordVisible ? 'password' : 'text';
    const handleToggleVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };
    const commonProps = {
        value,
        onChange,
        placeholder,
        radius,
        fontSize,
        height,
        padding,
        paddingRight,
        readOnly,
        $hasSuffix: !!(showSuffixIcon && isPasswordField),
        $device: device,
        autoComplete,
        $inputBackgroundColor,
        $placeholderColor,
        $textColor,
        $borderColor,
    };
    return (_jsxs(Container, { "$device": device, "$labelPosition": $labelPosition, children: [label && (_jsx(Label, { "$labelPosition": $labelPosition, style: {
                    fontSize: LabelStyles.fontSize[device],
                    color: labelColor || LabelStyles.color,
                }, children: label })), _jsxs(InputWrapper, { "$labelPosition": $labelPosition, children: [_jsx(InputFieldWrapper, { children: multiline ? (_jsx(StyledTextarea, { ...commonProps, rows: minLines || 3, resize: "vertical" })) : (_jsxs(_Fragment, { children: [_jsx(StyledInput, { ...commonProps, type: resolvedInputType }), showSuffixIcon && isPasswordField && (_jsx(SuffixIconWrapper, { onClick: handleToggleVisibility, "$isPasswordVisible": isPasswordVisible, "$device": device, children: isPasswordVisible ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }))] })) }), errorMessage && _jsx(ErrorText, { children: errorMessage })] })] }));
};
