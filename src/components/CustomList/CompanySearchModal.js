"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { THEME_COLORS } from "@/styles/theme_colors";
const CompanySearchModal = ({ isOpen, onClose, onSelect, themeMode = 'light' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    // 회사 검색 함수 (API 연동 필요)
    const searchCompanies = async (term) => {
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
        }
        catch (error) {
            console.error('회사 검색 중 오류 발생:', error);
        }
        finally {
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
    if (!isOpen)
        return null;
    return (_jsx(ModalOverlay, { onClick: onClose, children: _jsxs(ModalContent, { onClick: e => e.stopPropagation(), "$themeMode": themeMode, children: [_jsxs(ModalHeader, { "$themeMode": themeMode, children: [_jsx("h2", { children: "\uACE0\uAC1D\uC0AC \uAC80\uC0C9" }), _jsx(CloseButton, { onClick: onClose, "$themeMode": themeMode, children: "\u00D7" })] }), _jsxs(Flex, { children: [_jsx(CompanySearchInput, { type: "text", placeholder: "\uACE0\uAC1D\uC0AC\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), "$themeMode": themeMode }), _jsx(SearchButton, { onClick: () => setIsCompanyModalOpen(true), "$themeMode": themeMode, children: "\uAC80\uC0C9" })] }), _jsx(TableContainer, { "$themeMode": themeMode, children: _jsxs(Table, { children: [_jsx(TableHeader, { "$themeMode": themeMode, children: _jsxs("tr", { children: [_jsx("th", { children: "No" }), _jsx("th", { children: "\uAC00\uC785\uC77C" }), _jsx("th", { children: "\uACE0\uAC1D\uC0AC\uBA85" }), _jsx("th", { children: "\uB300\uD45C\uBA85" })] }) }), _jsx(TableBody, { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, children: _jsx(LoadingText, { "$themeMode": themeMode, children: "\uAC80\uC0C9 \uC911..." }) }) })) : companies.length > 0 ? (companies.map((company, index) => (_jsxs(TableRow, { onClick: () => {
                                        onSelect(company);
                                        onClose();
                                    }, "$themeMode": themeMode, children: [_jsx("td", { children: index + 1 }), _jsx("td", { children: company.createdTime }), _jsx("td", { children: company.name }), _jsx("td", { children: company.ceo })] }, company.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, children: _jsx(NoResults, { "$themeMode": themeMode, children: searchTerm.length > 0 ? '검색 결과가 없습니다.' : '검색어를 입력하세요.' }) }) })) })] }) })] }) }));
};
export default CompanySearchModal;
const ModalOverlay = styled.div `
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
const ModalContent = styled.div `
  width: 500px;
  max-height: 600px;
  background-color: ${({ $themeMode }) => $themeMode === 'light' ? '#ffffff' : THEME_COLORS.dark.background};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;
const ModalHeader = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: ${({ $themeMode }) => $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
    font-size: 20px;
  }
`;
const CloseButton = styled.button `
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ $themeMode }) => $themeMode === 'light' ? '#666666' : THEME_COLORS.dark.text};
  
  &:hover {
    color: ${({ $themeMode }) => $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.accent};
  }
`;
const SearchInput = styled.input `
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${({ $themeMode }) => $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  margin-bottom: 15px;
  background-color: ${({ $themeMode }) => $themeMode === 'light' ? '#ffffff' : THEME_COLORS.dark.inputBackground};
  color: ${({ $themeMode }) => $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};

  &:focus {
    outline: none;
    border-color: ${({ $themeMode }) => $themeMode === 'light' ? THEME_COLORS.light.primary : THEME_COLORS.dark.accent};
  }
`;
const TableContainer = styled.div `
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${({ $themeMode }) => $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  margin-top: 15px;
`;
const Table = styled.table `
  width: 100%;
  border-collapse: collapse;
`;
const TableHeader = styled.thead `
  background-color: ${({ $themeMode }) => $themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.secondary};
  
  th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: ${({ $themeMode }) => $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
    border-bottom: 1px solid ${({ $themeMode }) => $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  }
`;
const TableBody = styled.tbody `
  tr:last-child td {
    border-bottom: none;
  }
`;
const TableRow = styled.tr `
  cursor: pointer;
  
  td {
    padding: 12px;
    color: ${({ $themeMode }) => $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
    border-bottom: 1px solid ${({ $themeMode }) => $themeMode === 'light' ? '#eeeeee' : THEME_COLORS.dark.borderColor};
  }

  &:hover {
    background-color: ${({ $themeMode }) => $themeMode === 'light' ? '#f5f5f5' : THEME_COLORS.dark.hoverBackground};
  }
`;
const LoadingText = styled.div `
  padding: 20px;
  text-align: center;
  color: ${({ $themeMode }) => $themeMode === 'light' ? '#666666' : THEME_COLORS.dark.text};
`;
const NoResults = styled.div `
  padding: 20px;
  text-align: center;
  color: ${({ $themeMode }) => $themeMode === 'light' ? '#666666' : THEME_COLORS.dark.text};
`;
const CompanySearchInput = styled(SearchInput) `
  cursor: pointer;
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  margin: 0px;
  &:hover {
    background-color: ${({ $themeMode }) => $themeMode === "light" ? "#f5f5f5" : THEME_COLORS.dark.hoverBackground};
  }
`;
const SearchButton = styled.button `
  width: 60px;
  height: 40px;
  margin-left: 10px;
  background: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.primary : THEME_COLORS.dark.buttonBackground};
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
const Flex = styled.div `
  display: flex;
  align-items: center;
`;
