"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { THEME_COLORS, ThemeMode } from "@/styles/theme_colors";

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

const CompanySearchModal: React.FC<CompanySearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  themeMode = 'light'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // 회사 검색 함수 (API 연동 필요)
  const searchCompanies = async (term: string) => {
    setLoading(true);
    try {
      // TODO: API 연동
      // const response = await fetch(`/api/companies/search?term=${term}`);
      // const data = await response.json();
      // setCompanies(data);
      
      // 테스트 데이터
      setCompanies([
        {
          id: '1',
          name: '엠브이픽',
          ceo: '김브이',
          createdTime: '2025-01-10',
        },
        {
          id: '2',
          name: 'KT 지사',
          ceo: '김철수',
          createdTime: '2025-02-20',
        },
        {
          id: '3',
          name: '여기닷',
          ceo: '김여기',
          createdTime: '2025-03-15',
        },
      ]);
    } catch (error) {
      console.error('회사 검색 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const debounce = setTimeout(() => {
        searchCompanies(searchTerm);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()} $themeMode={themeMode}>
        <ModalHeader $themeMode={themeMode}>
          <h2>고객사 검색</h2>
          <CloseButton onClick={onClose} $themeMode={themeMode}>&times;</CloseButton>
        </ModalHeader>
        
                  <Flex>
                    <CompanySearchInput
                      type="text"
                      placeholder="고객사명을 입력하세요"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      $themeMode={themeMode}
                    />
                    <SearchButton onClick={() => setIsCompanyModalOpen(true)} $themeMode={themeMode}>
                      검색
                    </SearchButton>
                  </Flex>

        <TableContainer $themeMode={themeMode}>
          <Table>
            <TableHeader $themeMode={themeMode}>
              <tr>
                <th>No</th>
                <th>가입일</th>
                <th>고객사명</th>
                <th>대표명</th>
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <LoadingText $themeMode={themeMode}>검색 중...</LoadingText>
                  </td>
                </tr>
              ) : companies.length > 0 ? (
                companies.map((company, index) => (
                  <TableRow
                    key={company.id}
                    onClick={() => {
                      onSelect(company);
                      onClose();
                    }}
                    $themeMode={themeMode}
                  >
                    <td>{index + 1}</td>
                    <td>{company.createdTime}</td>
                    <td>{company.name}</td>
                    <td>{company.ceo}</td>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <NoResults $themeMode={themeMode}>
                      {searchTerm.length > 0 ? '검색 결과가 없습니다.' : '검색어를 입력하세요.'}
                    </NoResults>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CompanySearchModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $themeMode: ThemeMode }>`
  width: 500px;
  max-height: 600px;
  background-color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#ffffff' : THEME_COLORS.dark.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div<{ $themeMode: ThemeMode }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
    font-size: 20px;
  }
`;

const CloseButton = styled.button<{ $themeMode: ThemeMode }>`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#666666' : THEME_COLORS.dark.text};
  
  &:hover {
    color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.accent};
  }
`;

const SearchInput = styled.input<{ $themeMode: ThemeMode }>`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${({ $themeMode }) =>
    $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  margin-bottom: 15px;
  background-color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#ffffff' : THEME_COLORS.dark.inputBackground};
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};

  &:focus {
    outline: none;
    border-color: ${({ $themeMode }) =>
      $themeMode === 'light' ? THEME_COLORS.light.primary : THEME_COLORS.dark.accent};
  }
`;

const TableContainer = styled.div<{ $themeMode: ThemeMode }>`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${({ $themeMode }) =>
    $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  margin-top: 15px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead<{ $themeMode: ThemeMode }>`
  background-color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.secondary};
  
  th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
    border-bottom: 1px solid ${({ $themeMode }) =>
      $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  }
`;

const TableBody = styled.tbody`
  tr:last-child td {
    border-bottom: none;
  }
`;

const TableRow = styled.tr<{ $themeMode: ThemeMode }>`
  cursor: pointer;
  
  td {
    padding: 12px;
    color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
    border-bottom: 1px solid ${({ $themeMode }) =>
      $themeMode === 'light' ? '#eeeeee' : THEME_COLORS.dark.borderColor};
  }

  &:hover {
    background-color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#f5f5f5' : THEME_COLORS.dark.hoverBackground};
  }
`;

const LoadingText = styled.div<{ $themeMode: ThemeMode }>`
  padding: 20px;
  text-align: center;
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#666666' : THEME_COLORS.dark.text};
`;

const NoResults = styled.div<{ $themeMode: ThemeMode }>`
  padding: 20px;
  text-align: center;
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#666666' : THEME_COLORS.dark.text};
`;


const CompanySearchInput = styled(SearchInput)`
  cursor: pointer;
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  margin: 0px;
  &:hover {
    background-color: ${({ $themeMode }) =>
      $themeMode === "light" ? "#f5f5f5" : THEME_COLORS.dark.hoverBackground};
  }
`;

const SearchButton = styled.button<{ $themeMode: ThemeMode }>`
  width: 60px;
  height: 40px;
  margin-left: 10px;
  background: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.primary : THEME_COLORS.dark.buttonBackground};
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.buttonText : THEME_COLORS.dark.buttonText)};
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  border-left: none;
  border-radius: 0;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
`;