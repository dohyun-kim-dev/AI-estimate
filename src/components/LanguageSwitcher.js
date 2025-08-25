'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useLang } from '@/contexts/LangContext';
import DropdownInput from '@/components/DropdownInput';
import { AppColors } from '@/styles/colors';
import { userStamp } from '@/lib/api/user/api';
const logLanguageChange = (lang) => {
    userStamp({
        category: '버튼',
        content: 'LanguageSwitcher',
        memo: `언어 변경: ${lang}`,
    });
};
const LanguageSwitcher = () => {
    const { lang, setLang } = useLang();
    const languageOptions = [
        { label: '한국어', value: 'ko' },
        { label: 'English', value: 'en' },
    ];
    return (_jsx(DropdownInput, { value: lang, onChange: (value) => {
            const selectedLang = value;
            setLang(selectedLang);
            logLanguageChange(selectedLang);
        }, options: languageOptions, "$triggerBackgroundColor": AppColors.background, "$triggerFontSize": '18px', "$triggerTextColor": AppColors.onBackground, "$contentBackgroundColor": AppColors.background, "$contentTextColor": AppColors.onBackground, "$itemHoverBackgroundColor": AppColors.primary, "$itemHoverTextColor": AppColors.onBackground, "$triggerContent": _jsx("img", { src: "/globe.svg" // public 폴더의 globe.svg 경로
            , alt: "Language Selector", width: 24, height: 24 }), width: "auto" }));
};
export default LanguageSwitcher;
