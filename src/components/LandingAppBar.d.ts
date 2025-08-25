import React from 'react';
interface LandingAppBarProps {
    logoSrc: string;
    logoWidth?: string;
    logoHeight?: string;
    navLinks: {
        label: string;
        targetId: string;
        content: string;
        memo: string;
    }[];
    onNavigate: (targetId: string, content: string, memo: string) => void;
    onContact: () => void;
    onLogoClick?: () => void;
    appBarHeight?: string;
    appBarPadding?: string;
    hoverColor?: string;
    isShowLanguageSwitcher?: boolean;
    contactText: string;
}
declare const LandingAppBar: React.FC<LandingAppBarProps>;
export default LandingAppBar;
