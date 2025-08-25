import React from 'react';
type CmsPopupProps = {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    isWide?: boolean;
    showRequiredMark?: boolean;
    bottomFloating?: React.ReactNode;
    height?: string | null;
    backgroundColor?: string;
};
declare const CmsPopup: React.FC<CmsPopupProps>;
export default CmsPopup;
