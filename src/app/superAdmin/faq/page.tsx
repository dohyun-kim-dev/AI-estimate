'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import styled from 'styled-components';
import { useToast } from '@/components/common/ToastProvider';
import { devLog } from '@/lib/utils/devLogger';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import type { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import { getFAQList } from '@/lib/api/admin/adminApi';
import FAQFormPopup from './FAQFormPopup';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useCompanyCode } from '@/hooks/useCompanyCode';

// dayjs 한국어 설정
dayjs.locale('ko');

// FAQ 타입 정의
type FAQ = {
  no: number;
  _id: string;
  title: string;
  content: string;
  language: 'KOR' | 'ENG';
  createAt: string;
  updateAt: string;
  updateBy?: string;
  isShow: boolean; // 노출여부
  createBy?: {
    _id: string;
    name: string;
  }; // 작성자 정보
};

const FAQPage: React.FC = () => {
  const [selectedFAQ, setSelectedFAQ] = useState<Partial<FAQ> | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('heredot');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('여기닷');
  const { show: showToast } = useToast();
  
  // 권한 및 URL 기반 상태 관리
  const { isRoot } = useAdminAuth();
  const urlCompanyCode = useCompanyCode();

  const genericListRef = useRef<{ refetch: () => void }>(null);

  const handleRowClick = (item: FAQ) => {
    setSelectedFAQ(item);
    setIsPopupOpen(true);
  };

  const handleHeaderButtonClick = () => {
    setSelectedFAQ(null); // 신규 등록
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedFAQ(null);
  };


  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    // 통합관리자만 회사 선택 가능
    if (isRoot) {
      setSelectedCompanyCode(company.id);
      setSelectedCompanyName(company.name);
      // 고객사 변경 시 리스트 새로고침
      setTimeout(() => {
        genericListRef.current?.refetch();
      }, 100);
    }
  }, [isRoot]);

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<FAQ>> => {
      try {
        devLog('=== FAQ 목록 조회 시작 ===');
        
        // API 호출 시 사용할 companyCode 결정
        const apiCompanyCode = isRoot ? selectedCompanyCode : urlCompanyCode;
        devLog('선택된 고객사 코드:', apiCompanyCode);
        devLog('검색 키워드:', params.keyword);
        
        // 날짜 범위 설정: 2000-01-01 00:00:00 ~ 오늘 현재 시각
        const fromDate = '2000-01-01T00:00:00';
        const toDate = dayjs().format('YYYY-MM-DDTHH:mm:ss');
        
        devLog('날짜 범위:', { fromDate, toDate });
        
        const response = await getFAQList(
          apiCompanyCode || '', 
          params.keyword || '',
          fromDate,
          toDate
        );
        devLog('FAQ API 응답:', response);

        let faqData: FAQ[] = [];
        let totalItems = 0;
        let allItems = 0;

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data;
        
        if (apiResponse && (apiResponse.statusCode === 200 || apiResponse.statusCode === "200") && apiResponse.message === 'success') {
          faqData = Array.isArray(apiResponse.data) ? apiResponse.data.map((item: any, index: number) => ({
            ...item,
            no: index + 1,
          })) : [];
          
          totalItems = apiResponse.metadata?.totalCnt || faqData.length;
          allItems = apiResponse.metadata?.allCnt || totalItems;
        } else {
          devLog('FAQ 조회 실패 또는 데이터 없음');
          faqData = [];
          totalItems = 0;
          allItems = 0;
        }

        devLog('변환된 FAQ 데이터:', faqData);
        
        return {
          data: faqData,
          totalItems,
          allItems,
        };
      } catch (error) {
        console.error('FAQ 목록 조회 오류:', error);
        return {
          data: [],
          totalItems: 0,
          allItems: 0,
        };
      }
    },
    [selectedCompanyCode, isRoot, urlCompanyCode]
  );

  const columns: ColumnDefinition<FAQ>[] = useMemo(
    () => [
      {
        header: 'No',
        accessor: 'no',
        width: 60,
        sortable: true,
      },
      {
        header: '작성일시',
        accessor: 'createAt',
        width: 150,
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YY.MM.DD(ddd)\nHH:mm') : '-'),
      },
      {
        header: '수정일시',
        accessor: 'updateAt',
        width: 150,
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YY.MM.DD(ddd)\nHH:mm') : '-'),
      },
      {
        header: '제목',
        accessor: 'title',
        flex: 2,
        sortable: true,
        allowWrap: true,
      },
      {
        header: '내용',
        accessor: 'content',
        flex: 3,
        sortable: false,
        allowWrap: true,
        formatter: (value) => {
          const text = value || '';
          return text.length > 50 ? `${text.substring(0, 50)}...` : text;
        },
      },
      {
        header: '노출여부',
        accessor: 'isShow',
        width: 100,
        sortable: true,
        formatter: (value) => (value ? 'Y' : 'N'),
      },
      {
        header: '작성자',
        accessor: 'createBy',
        width: 100,
        sortable: true,
        formatter: (value) => {
          if (value && typeof value === 'object' && 'name' in value) {
            return value.name || '관리자';
          }
          return '관리자';
        },
      },
    ],
    []
  );

  return (
    <>
      <CmsResponsiveContainer<FAQ>
        ref={genericListRef}
        title="FAQ"
        data={[]}
        columns={columns}
        fetchData={fetchData}
        onRowClick={handleRowClick}
        themeMode="light"
        compactFieldCount={4}
        defaultViewMode="detail"
        enableDateFilter={false}
        enableCompanySearch={false} // 통합관리자만 CompanySearch 표시
        onCompanySelect={handleCompanySelect}
        renderMiddleContent={() => (
          <div style={{ flex: 1, textAlign: 'end', fontWeight: 'bold' }}>
            <AddButton onClick={handleHeaderButtonClick}>
              FAQ 등록
            </AddButton>
          </div>
        )}
      />

      <FAQFormPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        selectedFAQ={selectedFAQ}
        companyCode={isRoot ? selectedCompanyCode : urlCompanyCode || ''}
        onSuccess={() => {
          genericListRef.current?.refetch();
          closePopup();
        }}
      />
    </>
  );
};

export default FAQPage;

// 스타일 컴포넌트
const AddButton = styled.button`
  background-color: #214A72;
  color: white;
  border: none;
  width: 110px;
  height: 40px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
`;
