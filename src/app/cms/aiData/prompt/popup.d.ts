import React from 'react';
type PromptPopupProps = {
    index: number;
    isOpen: boolean;
    firstCreatedTime: string;
    firstContent: string;
    onClose: () => void;
};
declare const PromptPopup: React.FC<PromptPopupProps>;
export default PromptPopup;
