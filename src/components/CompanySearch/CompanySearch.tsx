import React, { useState } from 'react';
import styled from 'styled-components';
import { THEME_COLORS, ThemeMode } from '@/styles/theme_colors';
import CompanySearchModal from '@/components/CustomList/CompanySearchModal';

interface CompanySearchProps {
  selectedCompanyCode?: string | null;
  selectedCompanyName?: string;
  onCompanySelect: (company: { id: string; name: string }) => void;
  themeMode?: ThemeMode;
  placeholder?: string;
  width?: string;
}

const CompanySearch: React.FC<CompanySearchProps> = ({
  selectedCompanyCode,
  selectedCompanyName = '',
  onCompanySelect,
  themeMode = 'light',
  placeholder = '고객사를 선택하세요',
  width = '250px'
}) => {
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  const handleCompanySelect = (company: { companyCode: string; companyName: string }) => {
    onCompanySelect({ id: company.companyCode, name: company.companyName });
    setIsCompanyModalOpen(false);
  };

  return (
    <CompanySearchContainer>
      <Flex>
        <CompanySearchInput
          type="text"
          placeholder={placeholder}
          value={selectedCompanyName}
          readOnly
          onClick={() => setIsCompanyModalOpen(true)}
          $themeMode={themeMode}
          $width={width}
        />
        <SearchButton onClick={() => setIsCompanyModalOpen(true)} $themeMode={themeMode}>
          검색
        </SearchButton>
      </Flex>
      
      <CompanySearchModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={handleCompanySelect}
        themeMode={themeMode}
      />
    </CompanySearchContainer>
  );
};

export default CompanySearch;

// Styled Components
const CompanySearchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Flex = styled.div`
  display: flex;
`;

const CompanySearchInput = styled.input<{ $themeMode: ThemeMode; $width: string }>`
  width: ${({ $width }) => $width};
  height: 40px;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  border-right: none;
  border-radius: 4px 0 0 4px;
  cursor: pointer;

  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.inputText : THEME_COLORS.dark.inputText)};
  padding-left: 15px;
  padding-right: 35px;
  background-color: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.inputBackground : THEME_COLORS.dark.inputBackground};
  
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;

  &::placeholder {
    color: ${({ $themeMode }) => ($themeMode === "light" ? "#AAAAAA" : "#888888")};
  }

  &:focus {
    outline: none;
    border-color: ${({ $themeMode }) =>
      $themeMode === "light" ? THEME_COLORS.light.primary : THEME_COLORS.dark.accent};
  }
  
  &:hover {
    background-color: ${({ $themeMode }) =>
      $themeMode === "light" ? "#f5f5f5" : THEME_COLORS.dark.background};
  }
`;

const SearchButton = styled.button<{ $themeMode: ThemeMode }>`
  width: 60px;
  height: 40px;
  background: #214a72;
  border: none;
  border-radius: 0 4px 4px 0;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;
