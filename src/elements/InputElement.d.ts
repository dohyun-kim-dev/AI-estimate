import type { DeviceType } from '@/types/device';
import React from 'react';
export interface BaseInputElementProps {
    radius?: string;
    padding?: string;
    height?: string;
    fontSize?: string;
    paddingRight?: string;
    $hasSuffix?: boolean;
    $device: DeviceType;
    background?: string;
    autoComplete?: string;
    $inputBackgroundColor?: string;
    $textColor?: string;
    $placeholderColor?: string;
    $borderColor?: string;
}
interface TextareaElementProps extends BaseInputElementProps {
    rows?: number;
    maxRows?: number;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
/** 단일 라인 input 필드 */
export declare const StyledInput: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components/dist/types").Substitute<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, BaseInputElementProps>> & string;
/** 자동 높이 조절 기능 포함된 Textarea 컴포넌트 */
export declare const StyledTextarea: React.FC<TextareaElementProps>;
export {};
