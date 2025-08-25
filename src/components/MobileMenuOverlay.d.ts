import React from 'react';
interface MobileMenuOverlayProps {
    navLinks: {
        label: string;
        targetId: string;
        content: string;
        memo: string;
    }[];
    onClose: () => void;
    onNavigate: (targetId: string, content: string, memo: string) => void;
}
declare const MobileMenuOverlay: React.FC<MobileMenuOverlayProps>;
export default MobileMenuOverlay;
