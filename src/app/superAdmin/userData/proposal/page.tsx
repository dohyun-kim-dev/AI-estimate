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
import { getEstimateDownloadList, downloadEstimate, downloadEstimateExcel } from '@/lib/api/admin/adminApi';
import { devLog } from '@/utils/devLogger'

type ProposalDownload = {
  no: number;
  companyName: string;
  user: string;
  profileImageUrl: string;
  userId: string;
  email: string;
  updateAt: string;
  title: string;
  _id: string;
  isGuest?: boolean;
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

const DownloadButton = styled.button`
  width: 100px;
  height: 30px;
  background-color: #214A72;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 0px;
  cursor: pointer;
  padding: 4px;
`;

const ExcelDownloadButton = styled.button`
  width: 100px;
  height: 30px;
  background-color: #51815A;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 0px;
  cursor: pointer;
  padding: 4px;
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

  const handleDownloadFile = async (estimateId: string) => {
    try {
      devLog(`Downloading file for estimate: ${estimateId}`);
      
      // 새 탭에서 PDF 미리보기 페이지 열기 (EstimateCard의 openPreviewTab과 동일한 방식)
      const previewUrl = `/superadmin/pdf-preview?uuid=${estimateId}`;
      const newWindow = window.open(previewUrl, '_blank');
      
      setTimeout(() => {
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = previewUrl;
        }
      }, 100);
      
      devLog('PDF 미리보기 페이지가 새 탭에서 열립니다.');
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleExcelDownload = async (estimateId: string) => {
    try {
      devLog(`Downloading Excel for estimate: ${estimateId}`);
      
      // 엑셀 파일 다운로드 실행
      const result = await downloadEstimateExcel(estimateId);
      devLog(`엑셀 다운로드 완료: ${result.filename}`);
      
      // 성공 메시지 표시 (선택사항)
      // alert(`엑셀 파일이 다운로드되었습니다: ${result.filename}`);
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    }
  };


    const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
      setSelectedCompanyCode(company.id);
      setSelectedCompanyName(company.name);
      
      // 고객사 선택 시 즉시 데이터 다시 조회
      if (listRef.current) {
        listRef.current.refetch();
      }
    }, []);

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<ProposalDownload>> => {
      try {
        // 키워드가 전달되면 현재 키워드 업데이트 (빈 문자열 포함)
        let searchKeyword = '';
        if (params.keyword !== undefined) {
          setCurrentKeyword(params.keyword);
          searchKeyword = params.keyword;
        } else {
          searchKeyword = currentKeyword;
        }

        const fromDate = params.fromDate || dateRange?.fromDate || dayjs().subtract(3, 'month').format('YYYY-MM-DD');
        const toDate = params.toDate || dateRange?.toDate || dayjs().format('YYYY-MM-DD');
        
        devLog('🔍 [견적 다운로드 fetchData 호출]', { searchKeyword, fromDate, toDate });
        
        // API 호출
        const response = await getEstimateDownloadList({
          keyword: searchKeyword,
          fromDate: fromDate,
          toDate: toDate,
          companyCode: selectedCompanyCode || undefined,
        });
        
        devLog('✅ [견적 다운로드 fetchData 응답 받음]', response);
        
        // 응답 처리 (응답 구조에 맞게 수정)
        if (response && typeof response === 'object') {
          // 응답이 직접 API 응답 객체인 경우
          if ('statusCode' in response && response.statusCode === 200) {
            // 타입 단언으로 안전하게 처리
            const responseWithData = response as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
            const estimateData = responseWithData.data || [];
            
            // API 응답 데이터를 컴포넌트용 데이터로 변환
            const transformedData: ProposalDownload[] = estimateData.map((item: any, index: number) => ({
              no: item.no || index + 1,
              companyName: item.company?.companyName || '알 수 없음',
              user: item.userInfo?.name || '비회원',
              profileImageUrl: item.userInfo?.name ? null : '/cms/guest.png',
              userId: item.user || '',
              email: item.userInfo?.email || '',
              updateAt: item.createAt || '',
              title: item.title || '',
              _id: item._id || '',
              isGuest: !item.userInfo?.name
            }));
            
            const totalItems = responseWithData.metadata?.totalCnt || transformedData.length;
            const allItems = responseWithData.metadata?.allCnt || totalItems;
            return { data: transformedData, totalItems, allItems };
          } 
          // 응답이 배열로 감싸져 있는 경우 (callAdminApi 특성)
          else if (Array.isArray(response) && response[0]) {
            const firstItem = response[0];
            if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
              const responseData = firstItem.data;
              if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
                // 타입 단언으로 안전하게 처리
                const typedResponseData = responseData as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
                const estimateData = typedResponseData.data || [];
                
                // API 응답 데이터를 컴포넌트용 데이터로 변환
                const transformedData: ProposalDownload[] = estimateData.map((item: any, index: number) => ({
                  no: item.no || index + 1,
                  companyName: item.company?.companyName || '알 수 없음',
                  user: item.userInfo?.name || '비회원',
                  profileImageUrl: item.userInfo?.name ? null : '/cms/guest.png',
                  userId: item.user || '',
                  email: item.userInfo?.email || '',
                  updateAt: item.createAt || '',
                  title: item.title || '',
                  _id: item._id || '',
                  isGuest: !item.userInfo?.name
                }));
                
                const totalItems = typedResponseData.metadata?.totalCnt || transformedData.length;
                const allItems = typedResponseData.metadata?.allCnt || totalItems;
                return { data: transformedData, totalItems, allItems };
              }
            }
          }
        }
        
        console.error('견적 다운로드 목록 응답 형식이 예상과 다릅니다:', response);
        return { data: [], totalItems: 0, allItems: 0 };
      } catch (error) {
        console.error('견적 다운로드 현황 조회 오류:', error);
        return { data: [], totalItems: 0, allItems: 0 };
      }
    },
    [currentKeyword, selectedCompanyCode, dateRange]
  );

  const columns: ColumnDefinition<ProposalDownload>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no', width: 60, sortable: true },
      { header: '고객사', accessor: 'companyName', flex: 0.7, sortable: true },
      { header: '유저', accessor: 'user', flex: 0.7, sortable: true },
      {
        header: '프로필',
        accessor: 'profileImageUrl',
        width: 60,
        formatter: (value, row) => (
          <ProfileWrapper>
            <ProfileHeader $imageUrl={row.isGuest ? '/cms/guest.png' : row.profileImageUrl} />
          </ProfileWrapper>
        ),
      },
      { header: '아이디', accessor: 'userId', flex: 1.2, sortable: true },
      { header: '이메일', accessor: 'email', flex: 1.2, sortable: true },
      { header: '날짜', accessor: 'updateAt', flex: 1, sortable: true, formatter: (value) => dayjs(value).format('YYYY-MM-DD') },
      { header: '제목', accessor: 'title', flex: 2 },
      {
        header: '파일다운로드',
        accessor: '_id',
        width: 120,
        formatter: (value) => (
          <DownloadButton onClick={() => handleDownloadFile("b3434c8a-1d19-4e80-8499-4da501e6ff84")}>
            파일 다운로드
          </DownloadButton>
        ),
      },
      {
        header: '견적xlx다운',
        accessor: '_id',
        width: 120,
        formatter: (value) => (
          <ExcelDownloadButton onClick={() => handleExcelDownload("b3434c8a-1d19-4e80-8499-4da501e6ff84")}>
            엑셀 다운로드
          </ExcelDownloadButton>
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
        data={[]} // 빈 배열로 초기화 (fetchData 사용 시)
        columns={columns}
        fetchData={fetchData}
        enableDateFilter={true}
        searchPlaceholder="유저, 아이디, 이메일, 제목 검색"
        enableCompanySearch={true}
        themeMode="light"
        onCompanySelect={handleCompanySelect}
        
        dateRangeOptions={['3개월', '6개월', '1년', '지정']}
        onDateChange={(fromDate, toDate) => {
          devLog('📅 견적 다운로드 현황 - 날짜 변경:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onInitialDateSet={(fromDate, toDate) => {
          devLog('📅 견적 다운로드 현황 - 초기 날짜 설정:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onSearchChange={(keyword) => {
          devLog('🔍 견적 다운로드 현황 - 검색어 변경:', keyword);
          setCurrentKeyword(keyword);
        }}
      />
      <CmsPopup title="다운로드 상세" isOpen={isPopupOpen} onClose={closePopup}>
        <div>
          {selectedItem && (
            <div>
              <p><strong>제목:</strong> {selectedItem.title}</p>
              <p><strong>사용자:</strong> {selectedItem.user}</p>
              <p><strong>이메일:</strong> {selectedItem.email}</p>
              <p><strong>날짜:</strong> {selectedItem.updateAt ? dayjs(selectedItem.updateAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</p>
            </div>
          )}
        </div>
      </CmsPopup>
    </>
  );
};

export default ProposalDownloadPage;