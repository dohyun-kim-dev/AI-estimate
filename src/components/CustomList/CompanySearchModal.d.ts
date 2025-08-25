import React from 'react';
import { ThemeMode } from "@/styles/theme_colors";
interface Company {
    id: string;
    name: string;
    ceo: string;
    createdTime: string;
}
interface CompanySearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (company: Company) => void;
    themeMode?: ThemeMode;
}
declare const CompanySearchModal: React.FC<CompanySearchModalProps>;
export default CompanySearchModal;
