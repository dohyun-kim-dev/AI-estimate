// src/app/cms/userData/proposal/page.tsx

'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import dayjs from 'dayjs';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import ActionButton from '@/components/ActionButton';

type ProposalDownload = {
  no: number;
  user: string;
  profileImageUrl: string;
  userId: string;
  email: string;
  downloadDate: string;
  projectName: string;
  functionTitle: string;
  filePath: string; // 다운로드 파일 경로
};

const ProfileWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const ProfileHeader = styled.div<{ $imageUrl: string | null }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-image: url(${({ $imageUrl }) => $imageUrl || '/default-profile.png'});
  border: 1px solid #ccc;
  flex-shrink: 0;
`;

const DownloadButton = styled(ActionButton)`
  width: 80px;
  height: 30px;
  background-color: #51815a;
  color: white;
  border: none;
  font-size: 12px;
  &:hover:not(:disabled) {
    background-color: #3e6b47;
  }
`;

const ProposalDownloadPage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partial<ProposalDownload> | null>(null);
  const listRef = useRef<{ refetch: () => void }>(null);
 const [dateRange, setDateRange] = useState<{
    fromDate: string;
    toDate: string;
  } | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');

  const handleRowClick = (item: ProposalDownload) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  const handleDownloadFile = (filePath: string) => {
    console.log(`Downloading file from: ${filePath}`);
    alert(`파일 다운로드: ${filePath}`);
  };


    const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
      setSelectedCompanyCode(company.id);
      setSelectedCompanyName(company.name);
      
      
    }, []);

//이런 느낌 으로 api 연동
  // const fetchData = useCallback(
  //   async (params: FetchParams): Promise<FetchResult<User>> => {
  //     try {
  //       // 키워드가 전달되면 현재 키워드 업데이트 (빈 문자열 포함)
  //       let searchKeyword = '';
  //       if (params.keyword !== undefined) {
  //         setCurrentKeyword(params.keyword);
  //         searchKeyword = params.keyword;
  //       } else {
  //         searchKeyword = currentKeyword;
  //       }

  //       const fromDate = params.fromDate || dateRange?.fromDate || dayjs().subtract(3, 'month').format('YYYY-MM-DD');
  //       const toDate = params.toDate || dateRange?.toDate || dayjs().format('YYYY-MM-DD');
        
  //       devLog('🔍 [fetchData 호출]', { searchKeyword, fromDate, toDate, selectedCompanyCode });
        
  //       // API 호출
  //       const response = await getUserList({
  //         keyword: searchKeyword,
  //         fromDate: fromDate,
  //         toDate: toDate,
  //         companyCode: selectedCompanyCode || '',
  //       });
        
  //       devLog('✅ [fetchData 응답 받음]', response);
        
  //       // 응답 처리 (응답 구조에 맞게 수정)
  //       if (response && typeof response === 'object') {
  //         // 응답이 직접 API 응답 객체인 경우
  //         if ('statusCode' in response && response.statusCode === 200) {
  //           // 타입 단언으로 안전하게 처리
  //           const responseWithData = response as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
  //           const userData = responseWithData.data || [];
  //           const totalItems = responseWithData.metadata?.totalCnt || userData.length;
  //           const allItems = responseWithData.metadata?.allCnt || totalItems;
  //           return { data: userData, totalItems, allItems };
  //         } 
  //         // 응답이 배열로 감싸져 있는 경우 (callAdminApi 특성)
  //         else if (Array.isArray(response) && response[0]) {
  //           const firstItem = response[0];
  //           if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
  //             const responseData = firstItem.data;
  //             if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
  //               // 타입 단언으로 안전하게 처리
  //               const typedResponseData = responseData as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
  //               const userData = typedResponseData.data || [];
  //               const totalItems = typedResponseData.metadata?.totalCnt || userData.length;
  //               const allItems = typedResponseData.metadata?.allCnt || totalItems;
  //               return { data: userData, totalItems, allItems };
  //             }
  //           }
  //         }
  //       }
        
  //       console.error('유저 목록 응답 형식이 예상과 다릅니다:', response);
  //       return { data: [], totalItems: 0, allItems: 0 };
  //     } catch (error) {
  //       console.error('고객 회원 조회 오류:', error);
  //       return { data: [], totalItems: 0, allItems: 0 };
  //     }
  //   },
  //   [currentKeyword, selectedCompanyCode, dateRange]
  // );

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<ProposalDownload>> => {
      console.log('Mock Data fetching for ProposalDownload...', params);
      const dummyProfileUrls = [
        'https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8',
      ];

      const mockData: ProposalDownload[] = [
        {
          no: 1, user: '이민지', profileImageUrl: dummyProfileUrls[0], userId: 'lmj_user', email: 'lmj@example.com', downloadDate: '2025-08-14T10:00:00Z', projectName: '신규 쇼핑몰 개발', functionTitle: '회원가입 기능', filePath: '/files/proposal1.pdf',
        },
        {
          no: 2, user: '홍길동', profileImageUrl: dummyProfileUrls[1], userId: 'gildong', email: 'gildong@heredotcorp.com', downloadDate: '2025-08-13T15:30:00Z', projectName: '고객 관리 시스템', functionTitle: '데이터 분석 모듈', filePath: '/files/proposal2.docx',
        },
        // ...
      ];

      const filteredByDate = mockData.filter(item => {
        const itemDate = dayjs(item.downloadDate);
        const fromDate = params.fromDate ? dayjs(params.fromDate) : null;
        const toDate = params.toDate ? dayjs(params.toDate) : null;
        if (fromDate && itemDate.isBefore(fromDate, 'day')) return false;
        if (toDate && itemDate.isAfter(toDate, 'day')) return false;
        return true;
      });

      const filteredData = params.keyword
        ? filteredByDate.filter(item =>
            item.user.includes(params.keyword as string) ||
            item.userId.includes(params.keyword as string) ||
            item.email.includes(params.keyword as string) ||
            item.projectName.includes(params.keyword as string)
          )
        : filteredByDate;

      return { data: filteredData, totalItems: filteredData.length, allItems: mockData.length };
    },
    []
  );

  const columns: ColumnDefinition<ProposalDownload>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no', sortable: true },
      { header: '유저', accessor: 'user', sortable: true },
      {
        header: '프로필',
        accessor: 'profileImageUrl',
        formatter: (value, row) => (
          <ProfileWrapper>
            <ProfileHeader $imageUrl={row.profileImageUrl} />
          </ProfileWrapper>
        ),
      },
      { header: '아이디', accessor: 'userId', sortable: true },
      { header: '이메일', accessor: 'email', sortable: true },
      { header: '날짜', accessor: 'downloadDate', sortable: true, formatter: (value) => dayjs(value).format('YYYY-MM-DD') },
      { header: '프로젝트', accessor: 'projectName' },
      { header: '기능제목', accessor: 'functionTitle' },
      {
        header: '파일다운로드',
        accessor: 'filePath',
        formatter: (value) => (
          <DownloadButton onClick={() => handleDownloadFile(value as string)}>
            다운로드
          </DownloadButton>
        ),
      },
    ],
    []
  );

  return (
    <>
      <CmsResponsiveContainer<ProposalDownload>
        ref={listRef}
        title="견적 다운로드 현황"
        excelFileName="ProposalDownloads"
        columns={columns}
        fetchData={fetchData}
        enableSearch
        enableDateFilter
        searchPlaceholder="유저, 아이디, 이메일, 프로젝트명 검색"
        onRowClick={handleRowClick}
        themeMode="light"
        onCompanySelect={handleCompanySelect}
        dateRangeOptions={['3개월', '6개월', '1년', '지정']}
        onDateChange={(fromDate, toDate) => {
          console.log('📅 고객 회원관리 - 날짜 변경:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onInitialDateSet={(fromDate, toDate) => {
          console.log('📅 고객 회원관리 - 초기 날짜 설정:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onSearchChange={(keyword) => {
          console.log('🔍 고객 회원관리 - 검색어 변경:', keyword);
          setCurrentKeyword(keyword);
        }}
      />
      <CmsPopup title="다운로드 상세" isOpen={isPopupOpen} onClose={closePopup}>
        {/* ... */}
      </CmsPopup>
    </>
  );
};

export default ProposalDownloadPage;