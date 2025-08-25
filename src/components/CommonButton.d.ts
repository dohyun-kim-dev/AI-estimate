import React from 'react';
interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    icon?: React.ReactNode;
    $iconPosition?: 'left' | 'right';
    width?: string;
    maxWidth?: string;
    height?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    backgroundColor?: string;
    borderColor?: string;
    isSkeletonText?: boolean;
}
declare const CommonButton: React.FC<CommonButtonProps>;
export default CommonButton;
