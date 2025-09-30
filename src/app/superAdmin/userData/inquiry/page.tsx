'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import dayjs from 'dayjs';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import ActionButton from '@/components/ActionButton';
import { THEME_COLORS } from '@/styles/theme_colors';
import { getEstimateRequestListByRole } from '@/lib/utils/adminApiRouter';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'react-toastify';

// API 응답 타입 정의
interface EstimateRequestUser {
  id: string;
  name: string;
  cellphone: string;
  email: string;
  _id: string;
}

interface EstimateRequestItem {
  _id: string;
  user: EstimateRequestUser;
  title: string;
  chatSession?: string;
  estimateId?: string;
  estimateFile?: string;
  createAt: string;
}

interface EstimateRequestResponse {
  statusCode: number;
  message: string;
  data: {
    result: EstimateRequestItem[];
    metadata: {
      allCnt: number;
      totalCnt: number;
    };
  };
  metadata: null;
  error: null;
}

// 화면에서 사용할 타입
type Inquiry = {
  no: number;
  _id: string;
  inquiryDate: string;
  name: string;
  userId: string;
  email: string;
  cellphone: string;
  title: string;
  memo?: string;
  status?: string;
  chatSession?: string;
  estimateId?: string;
  estimateFile?: string;
};

// 버튼 스타일
const DetailActionButton = styled(ActionButton)`
  background-color: ${THEME_COLORS.light.primary};
  color: #fff;
  width: 100px;
  height: 30px;
  font-size: 12px;
  margin-right: 5px;
  &:hover:not(:disabled) {
    background-color: #1e3a5f;
  }
`;

const DownloadPdfButton = styled(ActionButton)`
  background-color: #214A72;
  color: #fff;
  width: 100px;
  height: 30px;
  font-size: 12px;
  margin-right: 5px;
  &:hover:not(:disabled) {
    background-color: #1a395c;
  }
`;

const InquiryPage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partial<Inquiry> | null>(null);
  const listRef = useRef<{ refetch: () => void }>(null);
  const { isRoot, ready } = useAdminAuth(); // ready 상태 추가
  
  // 고객사 선택 상태 추가
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  
  // 키워드 상태 추가 (userMng와 동일)
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  
  // 날짜 상태 추가 - GenericUI에서 초기 설정된 값을 저장
  const [currentFromDate, setCurrentFromDate] = useState<string>('');
  const [currentToDate, setCurrentToDate] = useState<string>('');
  
  // 초기 로드 상태 플래그 (초기에는 API 호출하지 않기 위함)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
   const [dateRange, setDateRange] = useState<{
      fromDate: string;
      toDate: string;
    } | null>(null);

  // 컴포넌트 마운트 시 isRoot 값 확인
  React.useEffect(() => {
    console.log('🔍 [InquiryPage] 컴포넌트 마운트 시 상태 확인:', {
      isRoot,
      localStorage_adminIsRoot: localStorage.getItem('admin_isRoot'),
      localStorage_adminId: localStorage.getItem('adminId'),
      localStorage_adminToken: !!localStorage.getItem('admin_access_token'),
    });
  }, [isRoot]);

  const handleRowClick = (item: Inquiry) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  // 대화 이력 보기 핸들러
  const handleChatHistoryClick = (chatSession?: string) => {
    if (chatSession) {
      alert(`대화 이력 페이지로 이동: ${chatSession}`);
    } else {
      alert('대화 이력이 없습니다.');
    }
  };

  // PDF 다운로드 핸들러
  const handleDownloadPdf = (estimateId?: string) => {
    if (estimateId) {
      alert(`견적 PDF 파일 다운로드: ${estimateId}`);
    } else {
      alert('견적 PDF가 없습니다.');
    }
  };

  // 파일 다운로드 핸들러 (사용하지 않지만 남겨둠)
  const handleDownloadFile = (estimateFile?: string) => {
    if (estimateFile) {
      alert(`견적 파일 다운로드: ${estimateFile}`);
    } else {
      alert('견적 파일이 없습니다.');
    }
  };

  // 고객사 선택 핸들러
  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    console.log('🏢 [고객사 선택]:', company);
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    
    // 고객사 변경 시 리스트 새로고침
    setTimeout(() => {
      listRef.current?.refetch();
    }, 100);
  }, []);

  // 초기 날짜 설정 핸들러 (GenericUI에서 초기 날짜가 설정되었을 때 호출)
  const handleInitialDateSet = useCallback((fromDate: string, toDate: string) => {
    console.log('📅 [초기 날짜 설정]:', { fromDate, toDate });
    setCurrentFromDate(fromDate);
    setCurrentToDate(toDate);
  }, []);

  // 날짜 변경 핸들러 (GenericUI에서 날짜가 변경되었을 때 호출)
  const handleDateChange = useCallback((fromDate: string, toDate: string) => {
    console.log('📅 [날짜 변경]:', { fromDate, toDate });
    setCurrentFromDate(fromDate);
    setCurrentToDate(toDate);
    // 날짜 변경 시에는 실제 조회이므로 초기 로드 플래그 해제
    setIsInitialLoad(false);
  }, []);

  // 검색 변경 핸들러 (GenericUI에서 검색이 실행될 때 호출)
  const handleSearchChange = useCallback((keyword: string) => {
    console.log('🔍 [검색 변경]:', { keyword });
    setCurrentKeyword(keyword);
    // 검색 시에는 실제 조회이므로 초기 로드 플래그 해제
    setIsInitialLoad(false);
  }, []);

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<Inquiry>> => {
      try {
        // 초기 로드 시에는 API 호출하지 않음
        if (isInitialLoad) {
          return { data: [], totalItems: 0, allItems: 0 };
        }

        // AuthContext가 아직 준비되지 않았으면 대기
        if (!ready) {
          console.log('🔄 [상담요청 조회] AuthContext 준비 중...');
          return { data: [], totalItems: 0, allItems: 0 };
        }

        // 고객사 코드 결정: 통합관리자는 선택된 고객사 코드, 사이트관리자는 기본값 또는 선택된 고객사 코드
        const companyCode = isRoot 
          ? selectedCompanyCode || undefined  // 통합관리자: 선택된 고객사 (없으면 전체)
          : selectedCompanyCode || 'heredot'; // 사이트관리자: 선택된 고객사 또는 기본값

        // 통합관리자이고 회사가 선택되지 않은 경우 토스트 메시지 표시
        if (isRoot && !selectedCompanyCode) {
        toast.warn('회사를 먼저 선택해주세요.'); // TODO: 토스트 라이브러리로 교체
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

        const fromDate = params.fromDate || currentFromDate;
        const toDate = params.toDate || currentToDate;
        
        console.log('🚀 [상담요청 조회] fetchData 시작:', {
          params,
          searchKeyword,
          fromDate,
          toDate,
          isRoot,
          ready,
          selectedCompanyCode,
          selectedCompanyName,
          localStorage_adminIsRoot: localStorage.getItem('admin_isRoot'),
          localStorage_adminIsRootParsed: localStorage.getItem('admin_isRoot') === 'true',
          contextIsRoot: isRoot,
          typeOfIsRoot: typeof isRoot,
        });
        
        // API 파라미터 구성
        const apiParams = {
          keyword: searchKeyword,
          fromDate: fromDate,
          toDate: toDate,
        };

        console.log('📋 [상담요청 조회] API 호출 전 파라미터:', {
          apiParams,
          companyCode,
          isRoot,
          selectedCompanyCode,
          willCallIntegratedAdmin: isRoot,
          willCallSiteAdmin: !isRoot,
        });
        
        const response = await getEstimateRequestListByRole(apiParams, companyCode);
        
        console.log('✅ [상담요청 조회] API 응답:', response);

        // adminMng와 동일한 응답 처리 로직
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        console.log('actualResponse', actualResponse);

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data;
        console.log('apiResponse', apiResponse);

        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          // API 응답 데이터를 Inquiry 타입에 맞게 매핑
          const mappedData: Inquiry[] = (apiResponse.data || []).map((item: any, index: number) => ({
            no: index + 1,
            _id: item._id,
            inquiryDate: item.createAt,
            name: item.user.name,
            userId: item.user.id,
            email: item.user.email,
            cellphone: item.user.cellphone,
            title: item.title,
            memo: item.memo,
            status: item.status,
            chatSession: item.chatSession,
            estimateId: item.estimateId,
            estimateFile: item.estimateFile,
          }));

          console.log('📋 [상담요청 조회] 매핑된 데이터:', mappedData);

          return {
            data: mappedData,
            totalItems: apiResponse.metadata?.totalCnt || 0,
            allItems: apiResponse.metadata?.allCnt || 0,
          };
        } else {
          console.error('❌ [상담요청 조회] API 에러:', apiResponse);
          return {
            data: [],
            totalItems: 0,
            allItems: 0,
          };
        }
      } catch (error) {
        console.error('❌ [상담요청 조회] Fetch 에러:', error);
        return {
          data: [],
          totalItems: 0,
          allItems: 0,
        };
      }
    },
    [isRoot, selectedCompanyCode, currentKeyword, ready, currentFromDate, currentToDate, isInitialLoad] // 초기 로드 플래그 의존성 추가
  );

  const columns: ColumnDefinition<Inquiry>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no', sortable: true },
      { 
        header: '문의 일시', 
        accessor: 'inquiryDate', 
        sortable: true, 
        formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') 
      },
      { header: '이름', accessor: 'name', sortable: true },
      { header: '아이디', accessor: 'userId', sortable: true },
      { header: '이메일', accessor: 'email', sortable: true },
      { header: '전화번호', accessor: 'cellphone', sortable: true },
      { header: '제목', accessor: 'title' },
      { header: '메모', accessor: 'memo', formatter: (value) => value || '-' },
      { header: '상태', accessor: 'status', formatter: (value) => value || '-' },
      {
        header: '대화 이력',
        accessor: 'chatSession',
        noPopup: true,
        formatter: (value, row) => (
          <div>
            <DetailActionButton 
              $themeMode="light" 
              onClick={() => handleChatHistoryClick(row.chatSession)}
            >
              대화 이력 보기
            </DetailActionButton>
          </div>
        ),
      },
      {
        header: '견적 다운로드',
        accessor: 'estimateId',
        noPopup: true,
        formatter: (value, row) => (
          <div>
            <DownloadPdfButton 
              $themeMode="light" 
              onClick={() => handleDownloadPdf(row.estimateId)}
            >
              견적 다운로드
            </DownloadPdfButton>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <CmsResponsiveContainer<Inquiry>
        ref={listRef}
        title="상담 요청 관리"
        data={[]} // 초기값, fetchData가 있으면 무시됨
        columns={columns}
        fetchData={fetchData}
        onRowClick={handleRowClick}
        themeMode="light"
        compactFieldCount={3}
        defaultViewMode="detail"
        enableDateFilter={true}
        enableCompanySearch={true} // 고객사 선택 기능 활성화
        onCompanySelect={handleCompanySelect} // 고객사 선택 핸들러 추가
        onInitialDateSet={handleInitialDateSet} // 초기 날짜 설정 핸들러 추가
        onDateChange={handleDateChange} // 날짜 변경 핸들러 추가
        onSearchChange={handleSearchChange} // 검색 변경 핸들러 추가
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
      <CmsPopup title="문의 상세" isOpen={isPopupOpen} onClose={closePopup}>
        {selectedItem ? (
          <div>
            <h3>{selectedItem.title}</h3>
            <p><strong>이름:</strong> {selectedItem.name}</p>
            <p><strong>아이디:</strong> {selectedItem.userId}</p>
            <p><strong>이메일:</strong> {selectedItem.email}</p>
            <p><strong>전화번호:</strong> {selectedItem.cellphone}</p>
            <p><strong>문의 일시:</strong> {selectedItem.inquiryDate ? dayjs(selectedItem.inquiryDate).format('YYYY-MM-DD HH:mm') : '-'}</p>
            <p><strong>메모:</strong> {selectedItem.memo || '-'}</p>
            <p><strong>상태:</strong> {selectedItem.status || '-'}</p>
            <p><strong>채팅 세션:</strong> {selectedItem.chatSession || '-'}</p>
            <p><strong>견적 ID:</strong> {selectedItem.estimateId || '-'}</p>
          </div>
        ) : null}
      </CmsPopup>
    </>
  );
};

export default InquiryPage;