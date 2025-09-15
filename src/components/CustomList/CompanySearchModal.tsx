"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { THEME_COLORS, ThemeMode } from "@/styles/theme_colors";
import { getCompanyList } from '@/lib/api/admin/adminApi';

interface Company {
  _id: string;
  name: string;
  companyName: string;
  cellphone: string;
  email: string;
  companyCode: string;
  dbName: string;
  address: string;
  detailAddress: string;
  ciImage: string;
  businessImage: string;
  contractType: string;
  contractStartDate: string;
  contractEndDate: string;
  aiConfidence: any;
  mode: string;
  category: string;
  createAt: string;
  updateAt: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: Company[];
  metadata: {
    allCnt: number;
    totalCnt: number;
  };
  error: any;
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

  // 고객사 목록 조회 함수
  const loadCompanyList = async (keyword?: string) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 (YYYY-MM-DD)
      const params = {
        keyword: keyword || '',
        fromDate: '2025-08-09', // 고정값
        toDate: today // 오늘 날짜
      };
      
      console.log('🔍 고객사 조회 시작');
      console.log('📅 API 호출 파라미터:', params);
      
      // 토큰 상태 확인
      const adminToken = localStorage.getItem('admin_access_token');
      console.log('🔑 localStorage에서 토큰 확인:', adminToken ? 'exists' : 'not found');
      console.log('🌍 현재 환경:', import.meta.env.VITE_ENV_NAME);
      console.log('🌐 현재 프로토콜:', window.location.protocol);
      
      const response = await getCompanyList(params);
      
      console.log('✅ 고객사 조회 API 응답 성공:', response);
      console.log('📊 응답 타입:', typeof response, Array.isArray(response));
      
      // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
      const actualResponse = Array.isArray(response) ? response[0] : response;
      console.log('📋 실제 응답 데이터:', actualResponse);
      
      // actualResponse.data에서 실제 API 응답을 가져옴
      const apiData = (actualResponse as any)?.data as ApiResponse;
      console.log('📋 API 데이터:', apiData);
      
      // API 응답 구조에 맞게 data 필드에서 배열을 추출
      if (apiData && apiData.data && Array.isArray(apiData.data)) {
        console.log('📋 고객사 목록 설정:', apiData.data.length, '개');
        console.log('📋 첫 번째 고객사 데이터:', apiData.data[0]);
        setCompanies(apiData.data);
      } else {
        console.log('⚠️ API 응답이 예상된 구조가 아님:', apiData);
        setCompanies([]);
      }
    } catch (error) {
      console.error('❌ 고객사 목록 조회 중 오류 발생:', error);
      console.error('❌ 에러 상세:', JSON.stringify(error, null, 2));
      // 오류 발생 시 빈 배열로 설정
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // 회사 검색 함수
  const searchCompanies = async (term: string) => {
    await loadCompanyList(term);
  };

  // 모달이 열릴 때 초기 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadCompanyList();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const debounce = setTimeout(() => {
        searchCompanies(searchTerm);
      }, 300);
      return () => clearTimeout(debounce);
    } else if (searchTerm.length === 0) {
      // 검색어가 없으면 전체 목록 다시 로드
      loadCompanyList();
    }
  }, [searchTerm]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchCompanies(searchTerm.trim());
    } else {
      loadCompanyList();
    }
  };

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
                    <SearchButton onClick={handleSearch} $themeMode={themeMode}>
                      조회
                    </SearchButton>
                  </Flex>

        <TableContainer $themeMode={themeMode}>
          <Table>
            <TableHeader $themeMode={themeMode}>
              <tr>
                <th>No</th>
                <th>가입일</th>
                <th>회사명</th>
                <th>담당자</th>
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
                    key={company._id}
                    onClick={() => {
                      onSelect(company);
                      onClose();
                    }}
                    $themeMode={themeMode}
                  >
                    <td>{index + 1}</td>
                    <td>{company.createAt}</td>
                    <td>{company.companyName || company.name}</td>
                    <td>{company.name}</td>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <NoResults $themeMode={themeMode}>
                      {searchTerm.length > 0 ? '검색 결과가 없습니다.' : '고객사 목록을 불러오는 중...'}
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
  background-color: rgba(0, 0, 0, 0.8);
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
      $themeMode === 'light' ? '#f5f5f5' : THEME_COLORS.dark.background};
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
      $themeMode === "light" ? "#f5f5f5" : THEME_COLORS.dark.background};
  }
`;

const SearchButton = styled.button<{ $themeMode: ThemeMode }>`
  width: 80px;
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