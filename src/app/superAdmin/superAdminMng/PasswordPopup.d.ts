import React from 'react';
interface PasswordPopupProps {
    adminId: string;
    isOpen: boolean;
    onClose: () => void;
}
declare const PasswordPopup: React.FC<PasswordPopupProps>;
export default PasswordPopup;
