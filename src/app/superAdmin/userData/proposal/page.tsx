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
import { devLog } from '@/utils/devLogger';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';
import 'dayjs/locale/ko';
import { useToast } from '@/components/common/ToastProvider';
import { useAdminAuth } from '@/contexts/AdminAuthContext';


dayjs.locale('ko');

type ProposalDownload = {
  no: number;
  companyName: string;
  user: string;
  profileImageUrl: string;
  userId: string;
  userInfo: userInfo;
  email: string;
  cellphone: string;
  createAt: string;
  title: string;
  _id: string;
  isGuest?: boolean;
  downloadCount: number; // ✅ 추가: 다운로드 횟수
};

type userInfo={
  name:string;
  email:string;
  cellphone:string;
  profileImage:string;
  isGuest?:boolean;
}

const ProfileWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
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
  const { show: showToast } = useToast();
  const { isRoot, ready } = useAdminAuth(); // 관리자 인증 상태 추가
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
  
  // 초기 로드 상태 플래그 (초기에는 API 호출하지 않기 위함)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [currentFromDate, setCurrentFromDate] = useState<string>('');
  const [currentToDate, setCurrentToDate] = useState<string>('');

  // URL에서 회사 코드 추출하여 초기화
  React.useEffect(() => {
    const currentPath = window.location.pathname;
    
    // URL에서 /cms/가 포함되면 회사 코드 자동 추출
    if (currentPath.includes('/cms/')) {
      const extractedCompanyCode = getCompanyCodeFromUrl();
      if (extractedCompanyCode && extractedCompanyCode !== 'aigo') {
        setSelectedCompanyCode(extractedCompanyCode);
        setSelectedCompanyName(extractedCompanyCode.toUpperCase());
        setIsInitialLoad(false); // 회사 코드 추출 시 초기 로드 플래그 해제
        devLog('🏢 [견적 발행 이력] URL에서 회사 코드 자동 추출:', {
          path: currentPath,
          companyCode: extractedCompanyCode
        });
        
        // 회사 코드 추출 후 데이터 로드
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.refetch();
          }
        }, 100);
      }
    }
  }, []);

  // 초기 날짜 설정 핸들러
  const handleInitialDateSet = useCallback((fromDate: string, toDate: string) => {
    devLog('📅 [견적 발행 이력 - 초기 날짜 설정]:', { fromDate, toDate });
    setCurrentFromDate(fromDate);
    setCurrentToDate(toDate);
  }, []);

  // 날짜 변경 핸들러
  const handleDateChange = useCallback((fromDate: string, toDate: string) => {
    devLog('📅 [견적 발행 이력 - 날짜 변경]:', { fromDate, toDate });
    setCurrentFromDate(fromDate);
    setCurrentToDate(toDate);
    setDateRange({ fromDate, toDate });
    // 날짜 변경 시에는 실제 조회이므로 초기 로드 플래그 해제
    setIsInitialLoad(false);
  }, []);

  // 검색 변경 핸들러
  const handleSearchChange = useCallback((keyword: string) => {
    devLog('🔍 [견적 발행 이력 - 검색 변경]:', { keyword });
    setCurrentKeyword(keyword);
    // 검색 시에는 실제 조회이므로 초기 로드 플래그 해제
    setIsInitialLoad(false);
  }, []);

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
      
      // 통합관리자: selectedCompanyCode 사용
      // 사이트관리자: URL에서 추출한 companyCode 사용
      const currentPath = window.location.pathname;
      let companyCodeToUse = '';
      
      if (currentPath.includes('/cms/')) {
        // 사이트관리자: URL에서 회사 코드 추출
        const extractedCompanyCode = getCompanyCodeFromUrl();
        if (extractedCompanyCode && extractedCompanyCode !== 'aigo') {
          companyCodeToUse = extractedCompanyCode;
        }
      } else {
        // 통합관리자: 선택된 회사 코드 사용
        companyCodeToUse = selectedCompanyCode;
        devLog('📄 [파일 다운로드] 사용할 회사 코드:', companyCodeToUse);
      }
      
      
      devLog('📄 [파일 다운로드] 사용할 회사 코드:', companyCodeToUse);
      
      // 새 탭에서 PDF 미리보기 페이지 열기 (EstimateCard의 openPreviewTab과 동일한 방식)
      let previewUrl = `/superadmin/pdf-preview?uuid=${estimateId}&companyCode=${companyCodeToUse}`;
      const newWindow = window.open(previewUrl, '_blank');
      
      setTimeout(() => {
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = previewUrl;
        }
      }, 100);
      
      devLog('PDF 미리보기 페이지가 새 탭에서 열립니다.');
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      showToast('PDF 다운로드 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleExcelDownload = async (estimateId: string) => {
    try {
      devLog(`Downloading Excel for estimate: ${estimateId}`);
      
      // 엑셀 파일 다운로드 실행
      const result = await downloadEstimateExcel(estimateId);
      devLog(`엑셀 다운로드 완료: ${result.filename}`);
      
      // 성공 메시지 표시 (선택사항)
      showToast(`엑셀 파일이 다운로드되었습니다: ${result.filename}`, 'success');
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      showToast('엑셀 다운로드 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.', 'error');
    }
  };


  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    devLog('🏢 [견적 발행 이력 - 고객사 선택]:', company);
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    devLog('🏢 [견적 발행 이력 - 고객사 선택] 선택된 고객사:', company);
    // 초기 로드 플래그 해제 (실제 조회이므로)
    setIsInitialLoad(false);
    
    // 고객사 선택 시 즉시 데이터 다시 조회
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.refetch();
      }
    }, 100);
  }, []);

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<ProposalDownload>> => {
      try {
        // 검색이나 날짜 변경 등으로 인한 호출이 아닌 초기 로드 시에는 API 호출하지 않음
        const hasSearchParams = params.keyword !== undefined || params.fromDate || params.toDate;
        if (isInitialLoad && !hasSearchParams) {
          return { data: [], totalItems: 0, allItems: 0 };
        }
        
        // 검색이나 날짜 변경 등의 실제 조회 시에는 초기 로드 플래그 해제
        if (hasSearchParams) {
          setIsInitialLoad(false);
        }

        // AuthContext가 아직 준비되지 않았으면 대기
        if (!ready) {
          devLog('🔄 [견적 발행 이력] AuthContext 준비 중...');
          return { data: [], totalItems: 0, allItems: 0 };
        }

        // URL에서 회사 코드 실시간 추출
        const currentPath = window.location.pathname;
        let companyCodeToUse = selectedCompanyCode;
        
        // URL에 /cms/가 포함되면 자동으로 회사 코드 추출
        if (currentPath.includes('/cms/')) {
          const extractedCompanyCode = getCompanyCodeFromUrl();
          if (extractedCompanyCode && extractedCompanyCode !== 'aigo') {
            companyCodeToUse = extractedCompanyCode;
            devLog('🔄 [견적 발행 이력 API] URL에서 회사 코드 추출:', {
              path: currentPath,
              companyCode: extractedCompanyCode
            });
          }
        }

        // 고객사 코드 결정: 통합관리자는 선택된 고객사 코드, 사이트관리자는 추출된 회사 코드 또는 기본값
        const companyCode = isRoot 
          ? selectedCompanyCode  // 통합관리자: 선택된 고객사 (필수)
          : companyCodeToUse || ''; // 사이트관리자: 추출된 회사 코드 또는 기본값

        // 통합관리자이고 회사가 선택되지 않은 경우 API 호출하지 않음
        if (isRoot && !companyCode) {
          devLog('🚫 [견적 발행 이력] 통합관리자 - 회사 선택 필요');
          return { data: [], totalItems: 0, allItems: 0 };
        }

        // superAdmin에서 회사가 선택되지 않은 경우에도 API 호출하지 않음 (cms URL 제외)
        if (!currentPath.includes('/cms/') && !companyCode) {
          devLog('🚫 [견적 발행 이력] SuperAdmin - 회사 선택 필요 (cms URL 아님)');
          return { data: [], totalItems: 0, allItems: 0 };
        }

        // 키워드가 전달되면 현재 키워드 업데이트 (빈 문자열 포함)
        let searchKeyword = '';
        if (params.keyword !== undefined) {
          setCurrentKeyword(params.keyword);
          searchKeyword = params.keyword;
        } else {
          searchKeyword = currentKeyword;
        }

        const fromDate = params.fromDate || currentFromDate || dayjs().subtract(3, 'month').format('YYYY-MM-DD');
        const toDate = params.toDate || currentToDate || dayjs().format('YYYY-MM-DD');
        
        devLog('🔍 [견적 발행 이력 fetchData 호출]', { 
          searchKeyword, 
          fromDate, 
          toDate, 
          companyCode,
          isRoot,
          ready,
          selectedCompanyCode
        });
        
        // API 호출
        const response = await getEstimateDownloadList({
          keyword: searchKeyword,
          fromDate: fromDate,
          toDate: toDate,
          companyCode: companyCode,
        });
        
        devLog('✅ [견적 발행 이력 fetchData 응답 받음]', response);
        
        // 응답 처리 (응답 구조에 맞게 수정)
        if (response && typeof response === 'object') {
          // 응답이 직접 API 응답 객체인 경우
          if ('statusCode' in response && response.statusCode === 200) {
            // 타입 단언으로 안전하게 처리
            const responseWithData = response as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
            const estimateData = responseWithData.data || [];
            
            // API 응답 데이터를 컴포넌트용 데이터로 변환
            const transformedData: ProposalDownload[] = estimateData.map((item: any, index: number) => {
              const isGuest = item.userInfo?.isGuest === true;
              let profileImageUrl = '/ai-estimate/no_profile.png'; // 기본값
              
              if (isGuest) {
                profileImageUrl = '/cms/guest.png';
              } else if (item.userInfo?.profileImage) {
                profileImageUrl = item.userInfo.profileImage;
              }
              
              return {
                no: item.no || index + 1,
                companyName: item.company?.companyName || '알 수 없음',
                user: item.userInfo?.name || '비회원',
                profileImageUrl,
                userId: item.user || '',
                userInfo: item.userInfo || {},
                email: item.userInfo?.email || '',
                cellphone: item.userInfo?.cellphone || '',
                createAt: item.createAt || '',
                title: item.title || '',
                _id: item._id || '',
                isGuest,
                downloadCount: item.downloadCount || 0 // ✅ 추가
              };
            });
            
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
                const transformedData: ProposalDownload[] = estimateData.map((item: any, index: number) => {
                  const isGuest = item.userInfo?.isGuest === true;
                  let profileImageUrl = '/ai-estimate/no_profile.png'; // 기본값
                  
                  if (isGuest) {
                    profileImageUrl = '/cms/guest.png';
                  } else if (item.userInfo?.profileImage) {
                    profileImageUrl = item.userInfo.profileImage;
                  }
                  
                  return {
                    no: item.no || index + 1,
                    companyName: item.company?.companyName || '알 수 없음',
                    user: item.userInfo?.name || '비회원',
                    profileImageUrl,
                    userId: item.user || '',
                    userInfo: item.userInfo || {},
                    email: item.userInfo?.email || '',
                    cellphone: item.userInfo?.cellphone || '',
                    createAt: item.createAt || '',
                    title: item.title || '',
                    _id: item._id || '',
                    isGuest,
                    downloadCount: item.downloadCount || 0 // ✅ 추가
                  };
                });
                
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
    [isRoot, currentKeyword, ready, currentFromDate, currentToDate, isInitialLoad, selectedCompanyCode]
  );

  const columns: ColumnDefinition<ProposalDownload>[] = useMemo(
    () => {
      const isCmsUrl = window.location.pathname.includes('/cms/');
      
      const baseColumns: ColumnDefinition<ProposalDownload>[] = [
        { header: 'No', accessor: 'no', width: 60, sortable: true },
        { header: '날짜', accessor: 'createAt', width: 120, sortable: true, formatter: (value) => dayjs(value).format('YY.MM.DD(ddd)') },
        ...(!isCmsUrl ? [{ header: '고객사', accessor: 'companyName' as const, flex: 1, sortable: true }] : []),
        {
          header: '프로필',
          accessor: 'profileImageUrl' as const,
          width: 60,
          formatter: (value, row) => {
            let imageUrl = '/ai-estimate/no_profile.png'; // 기본값
            
            if (row.userInfo?.isGuest === true) {
              imageUrl = '/cms/guest.png';
            } else if (row.userInfo?.profileImage) {
              imageUrl = row.userInfo.profileImage;
            } else if (row.profileImageUrl) {
              imageUrl = row.profileImageUrl;
            }
            
            return (
              <ProfileWrapper>
                <ProfileImage 
                  src={imageUrl}
                  alt="프로필"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/ai-estimate/no_profile.png';
                  }}
                />
              </ProfileWrapper>
            );
          },
        },
        { header: '이름', accessor: 'user' as const, flex: 0.7, sortable: true },
        { header: '연락처', accessor: 'cellphone' as const, flex: 1, sortable: true, width:120, },
        { header: '이메일', accessor: 'email' as const, flex: 1.2, sortable: true, allowWrap: true },
        { header: '아이디', accessor: 'userId' as const, flex: 1.2, sortable: true, allowWrap: true },
        { header: '견적 제목', accessor: 'title' as const, flex: 2, allowWrap: true },
        { 
          header: '다운로드', 
          accessor: 'downloadCount' as const, 
          width: 100, 
          sortable: true,
          formatter: (value) => String(value || 0) // 숫자만 표시
        },
        {
          header: '파일다운로드',
          accessor: '_id' as const,
          width: 120,
          sortable: false,
          noPopup: true,
          formatter: (value, row) => (
            <DownloadButton onClick={() => handleDownloadFile(row._id)}>
              파일 다운로드
            </DownloadButton>
          ),
        },
        {
          header: '견적xlx다운',
          accessor: '_id' as const,
          width: 120,
          sortable: false,
          noPopup: true,
          formatter: (value, row) => (
            <ExcelDownloadButton onClick={() => handleExcelDownload(row._id)}>
              엑셀 다운로드
            </ExcelDownloadButton>
          ),
        },
      ];
      
      return baseColumns;
    },
    [selectedCompanyCode]
  );

  return (
    <>
      <CmsResponsiveContainer<ProposalDownload>
        ref={listRef}
        title="견적 발행 이력"
        data={[]} // 빈 배열로 초기화 (fetchData 사용 시)
        columns={columns}
        fetchData={fetchData}
        enableDateFilter={true}
        searchPlaceholder="유저, 아이디, 이메일, 제목 검색"
        enableCompanySearch={true}
        themeMode="light"
        onCompanySelect={handleCompanySelect}
        onInitialDateSet={handleInitialDateSet} // 초기 날짜 설정 핸들러 추가
        onDateChange={handleDateChange} // 수정된 날짜 변경 핸들러
        onSearchChange={handleSearchChange} // 검색 변경 핸들러 추가
        dateRangeOptions={['3개월', '6개월', '1년', '지정']}
      />
      <CmsPopup title="다운로드 상세" isOpen={isPopupOpen} onClose={closePopup}>
        <div>
          {selectedItem && (
            <div>
              <p><strong>제목:</strong> {selectedItem.title}</p>
              <p><strong>사용자:</strong> {selectedItem.userInfo?.name}</p>
              <p><strong>이메일:</strong> {selectedItem.userInfo?.email}</p>
              <p><strong>날짜:</strong> {selectedItem.createAt ? dayjs(selectedItem.createAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</p>
            </div>
          )}
        </div>
      </CmsPopup>
    </>
  );
};

export default ProposalDownloadPage;