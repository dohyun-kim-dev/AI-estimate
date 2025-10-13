"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { THEME_COLORS, ThemeMode } from "@/styles/theme_colors";
import { getCompanyList } from '@/lib/api/admin/adminApi';
import CmsPopup from '@/components/CmsPopup';
import { devLog } from '@/utils/devLogger';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

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

  // dayjs 한국어 locale 설정
  dayjs.locale('ko');

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
      
      devLog('🔍 고객사 조회 시작');
      devLog('📅 API 호출 파라미터:', params);
      
      // 토큰 상태 확인
      const adminToken = localStorage.getItem('admin_access_token');
      devLog('🔑 localStorage에서 토큰 확인:', adminToken ? 'exists' : 'not found');
      devLog('🌍 현재 환경:', import.meta.env.VITE_ENV_NAME);
      devLog('🌐 현재 프로토콜:', window.location.protocol);
      
      const response = await getCompanyList(params);
      
      devLog('✅ 고객사 조회 API 응답 성공:', response);
      devLog('📊 응답 타입:', typeof response, Array.isArray(response));
      
      // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
      const actualResponse = Array.isArray(response) ? response[0] : response;
      devLog('📋 실제 응답 데이터:', actualResponse);
      
      // actualResponse.data에서 실제 API 응답을 가져옴
      const apiData = (actualResponse as any)?.data as ApiResponse;
      devLog('📋 API 데이터:', apiData);
      
      // API 응답 구조에 맞게 data 필드에서 배열을 추출
      if (apiData && apiData.data && Array.isArray(apiData.data)) {
        devLog('📋 고객사 목록 설정:', apiData.data.length, '개');
        devLog('📋 첫 번째 고객사 데이터:', apiData.data[0]);
        setCompanies(apiData.data);
      } else {
        // 401 인증 실패 응답 구조일 때 catch로 넘김
        if (
          apiData?.statusCode === 401 ||
          apiData?.message === 'unauthorized' ||
          apiData?.error?.customMessage === '시스템 관리자 인증이 필요합니다.'
        ) {
          devLog('🚫 401 Unauthorized - catch로 에러 전파');
          throw apiData;
        }
        devLog('⚠️ API 응답이 예상된 구조가 아님:', apiData);
        setCompanies([]);
      }
    } catch (error: any) {
      // 401 에러 감지 시 로그아웃 및 superadmin/login으로 이동
      if (
        error?.statusCode === 401 ||
        error?.response?.statusCode === 401 ||
        error?.response?.message === 'unauthorized' ||
        error?.response?.error?.customMessage === '시스템 관리자 인증이 필요합니다.'
      ) {
        localStorage.removeItem('adminId');
        devLog('🚫 401 Unauthorized - 자동 로그아웃 및 superadmin/login 이동');
        window.location.replace('/superadmin/login');
        return;
      }
      console.error('❌ 고객사 목록 조회 중 오류 발생:', error);
      console.error('❌ 에러 상세:', JSON.stringify(error, null, 2));
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // 회사 검색 함수
  const searchCompanies = async (term: string) => {
    await loadCompanyList(term);
  };

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setCompanies([]);
      setSearchTerm('');
      loadCompanyList(); 
    }
  }, [isOpen]);

  // 자동 검색 기능 비활성화 - 조회 버튼으로만 검색
  // useEffect(() => {
  //   if (searchTerm.length >= 2) {
  //     const debounce = setTimeout(() => {
  //       searchCompanies(searchTerm);
  //     }, 300);
  //     return () => clearTimeout(debounce);
  //   } else if (searchTerm.length === 0) {
  //     // 검색어가 없으면 전체 목록 다시 로드
  //     loadCompanyList();
  //   }
  // }, [searchTerm]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchCompanies(searchTerm.trim());
    } else {
      loadCompanyList();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <CmsPopup
      title="고객사 검색"
      isOpen={isOpen}
      onClose={onClose}
      height="auto"
      backgroundColor={themeMode === 'light' ? '#ffffff' : THEME_COLORS.dark.background}
    >
      <SearchContainer>
        <Flex>
          <CompanySearchInput
            type="text"
            placeholder="고객사명을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            $themeMode={themeMode}
            onKeyDown={handleKeyDown}
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
                    $isEven={index % 2 === 1}
                  >
                    <td>{index + 1}</td>
                    <td>{dayjs(company.createAt).format('YY.MM.DD(ddd)')}</td>
                    <td>{company.companyName || company.name}</td>
                    <td>{company.name}</td>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <NoResults $themeMode={themeMode}>
                      {searchTerm.length > 0 ? '검색 결과가 없습니다.' : '고객사명을 입력하고 조회 버튼을 클릭하세요.'}
                    </NoResults>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SearchContainer>
    </CmsPopup>
  );
};

export default CompanySearchModal;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
    border-right: 1px solid #E6E7E9;
  }
`;

const TableBody = styled.tbody`
  tr:last-child td {
    border-bottom: none;
  }
`;

const TableRow = styled.tr<{ $themeMode: ThemeMode; $isEven?: boolean }>`
  cursor: pointer;
  background-color: ${({ $themeMode, $isEven }) => 
    $isEven 
      ? ($themeMode === 'light' ? '#f9f9f9' : THEME_COLORS.dark.secondary)
      : 'transparent'
  };
  
  td {
    padding: 12px;
    color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
    border-right: 1px solid #E6E7E9;
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


const CompanySearchInput = styled.input<{ $themeMode: ThemeMode }>`
  width: 100%;
  height: 48px;
  padding: 10px 15px;
  border: 1px solid ${({ $themeMode }) =>
    $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  background-color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#ffffff' : THEME_COLORS.dark.inputBackground};
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
  cursor: pointer;
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  margin: 0px;

  &:focus {
    outline: none;
    border-color: ${({ $themeMode }) =>
      $themeMode === 'light' ? THEME_COLORS.light.primary : THEME_COLORS.dark.accent};
  }

  &:hover {
    background-color: ${({ $themeMode }) =>
      $themeMode === "light" ? "#f5f5f5" : THEME_COLORS.dark.background};
  }
`;

const SearchButton = styled.button<{ $themeMode: ThemeMode }>`
  width: 86px;
  height: 48px;
  margin-left: 10px;
  background: #2C2E3C;
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.buttonText : THEME_COLORS.dark.buttonText)};
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  border-left: none;
  border-radius: 4px;
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