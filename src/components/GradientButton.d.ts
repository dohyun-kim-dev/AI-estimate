import React from 'react';
interface GradientButtonProps {
    title: string;
    gradient?: string;
    href?: string;
    onClick?: () => void;
    titleColor?: string;
}
export declare const GradientButton: React.FC<GradientButtonProps>;
export {};
