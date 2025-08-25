import React from 'react';
export type IconName = 'image' | 'moon' | 'sun' | 'logo' | 'chat' | 'document' | 'settings' | 'expand';
interface IconProps {
    src: string;
    width?: number;
    height?: number;
    angle?: number;
    className?: string;
    onClick?: () => void;
    fallbackIcon?: IconName;
}
declare const Icon: React.FC<IconProps>;
export default Icon;
