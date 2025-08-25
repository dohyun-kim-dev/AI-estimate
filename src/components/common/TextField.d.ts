import React from 'react';
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
}
export default function TextField({ id, label, ...props }: TextFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
