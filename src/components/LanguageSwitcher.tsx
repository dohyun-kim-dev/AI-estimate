'use client';

import React from 'react';
import { useLang } from '@/contexts/LangContext';
import DropdownInput from '@/components/DropdownInput';
import { AppColors } from '@/styles/colors';
import { userStamp } from '@/lib/api/user/api';

const logLanguageChange = (lang: 'ko' | 'en') => {
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

  return (
    <DropdownInput
      value={lang}
      onChange={(value) => {
        const selectedLang = value as 'ko' | 'en';
        setLang(selectedLang);
        logLanguageChange(selectedLang);
      }}
      options={languageOptions}
      $triggerBackgroundColor={AppColors.background}
      $triggerFontSize='18px'
      $triggerTextColor={AppColors.onBackground}
      $contentBackgroundColor={AppColors.background}
      $contentTextColor={AppColors.onBackground}
      $itemHoverBackgroundColor={AppColors.primary}
      $itemHoverTextColor={AppColors.onBackground}
      $triggerContent={
        <img
          src="/globe.svg" // public 폴더의 globe.svg 경로
          alt="Language Selector"
          width={24}
          height={24}
          
        />
      }
      width="auto"
    />
  );
};

export default LanguageSwitcher;