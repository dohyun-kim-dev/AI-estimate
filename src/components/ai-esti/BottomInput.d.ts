import React from 'react';
interface BottomInputProps {
    placeholder?: string;
    onSubmit?: (value: string) => void;
    maxSubmissions?: number;
}
declare const BottomInput: React.FC<BottomInputProps>;
export default BottomInput;
