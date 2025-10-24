'use client';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
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
import { useToast } from '@/components/common/ToastProvider';
import { downloadEstimate, downloadEstimateExcel, updateEstimateRequestStatus } from '@/lib/api/admin/adminApi';
import ChatHistoryModal from '@/components/ChatHistoryModal';
import EstimateInquiryModal from '@/components/EstimateInquiryModal';
import { devLog } from '@/utils/devLogger';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';

// 프로필 스타일 컴포넌트 (대화 이력 관리와 동일)
const ProfileWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

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
  background-image: url(${({ $imageUrl }) => $imageUrl || '/ai-estimate/no-profile.png'});
  border: 1px solid #ccc;
  flex-shrink: 0;
`;

// API 응답 타입 정의 (새로운 응답 형식에 맞게 수정)
interface EstimateRequestUserInfo {
  _id: string;
  name: string;
  email: string;
  cellphone: string;
  profileImage?: string; // 프로필 이미지 추가
  isGuest?: boolean; // 게스트 여부 추가
}

interface EstimateRequestItem {
  _id: string;
  user: string; // 사용자 ID
  userInfo: EstimateRequestUserInfo;
  company: string;
  title: string;
  chatSession: string;
  estimateId: string;
  createAt: string;
  memo?: string;
  status?: string; // 서버에서 올 예정인 상태 필드
}

interface EstimateRequestResponse {
  statusCode: number;
  message: string;
  data: EstimateRequestItem[];
  metadata: {
    allCnt: number;
    totalCnt: number;
  };
  error: null;
}

// 화면에서 사용할 타입
type Inquiry = {
  no: number;
  _id: string;
  inquiryDate: string;
  name: string;
  userId: string;
  profileImageUrl: string; // 프로필 이미지 URL 추가
  email: string;
  cellphone: string;
  title: string;
  memo?: string;
  status?: string;
  chatSession?: string;
  estimateId?: string;
  estimateFile?: string;
  isGuest?: boolean; // 게스트 여부 추가
  userInfo?: EstimateRequestUserInfo; // userInfo 추가
};

// 버튼 스타일
const DetailActionButton = styled(ActionButton)`
  background-color: ${THEME_COLORS.light.primary};
  color: #fff;
  width: 90px;
  height: 32px;
  font-size: 12px;
  padding: 0px;
  margin: 0px;
  &:hover:not(:disabled) {
    background-color: #1e3a5f;
  }
`;

const DownloadPdfButton = styled(ActionButton)`
  background-color: #214A72;
  color: #fff;
  width: 90px;
  height: 32px;
  padding: 0px;
  margin: 0px;
  font-size: 12px;
  &:hover:not(:disabled) {
    background-color: #1a395c;
  }
`;

// 상태 드롭다운 컴포넌트
interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ currentStatus, onStatusChange }) => {
  const { show: showToast } = useToast(); // 토스트 훅 추가
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const statusOptions = [
    { value: '접수', color: '#FF9800', apiValue: 'pending' },
    { value: '진행', color: '#2196F3', apiValue: 'in_progress' },
    { value: '실패', color: '#F44336', apiValue: 'rejected' },
    { value: '완료', color: '#4CAF50', apiValue: 'approved' },
  ];

  const getCurrentStatusColor = () => {
    const option = statusOptions.find(opt => opt.value === currentStatus);
    return option?.color || '#2196F3';
  };

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = statusOptions.filter(opt => opt.value !== currentStatus).length * 40; // 각 항목 약 40px
      const viewportHeight = window.innerHeight;
      
      // 드롭다운이 아래로 열렸을 때 화면 밖으로 나가는지 확인
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // 아래 공간이 부족하고 위 공간이 더 크면 위로 열기
      const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      setPosition({
        top: shouldOpenUpward 
          ? rect.top + window.scrollY - dropdownHeight - 4 // 위로 열기 (4px 간격)
          : rect.bottom + window.scrollY + 4, // 아래로 열기 (4px 간격)
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    const selectedOption = statusOptions.find(opt => opt.value === value);
    if (selectedOption) {
      onStatusChange(selectedOption.apiValue);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updatePosition(); // 스크롤 시 위치 재계산
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); // 모든 스크롤 이벤트 캡처
      window.addEventListener('resize', updatePosition); // 윈도우 리사이즈 시 위치 재계산
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  return (
    <>
      <StatusDropdownContainer ref={containerRef}>
        <StatusDropdownHeader onClick={handleToggle}>
          <StatusText>{currentStatus}</StatusText>
          <DropdownIcon $isOpen={isOpen}>▼</DropdownIcon>
        </StatusDropdownHeader>
      </StatusDropdownContainer>

      {isOpen && (
        <StatusDropdownList
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
          }}
        >
          {statusOptions.filter(option => option.value !== currentStatus).map((option) => (
            <StatusDropdownItem
              key={option.value}
              onClick={() => handleSelect(option.value)}
              $statusColor={option.color}
              $isSelected={false}
            >
              {option.value}
            </StatusDropdownItem>
          ))}
        </StatusDropdownList>
      )}
    </>
  );
};

// 상태 드롭다운 스타일
const StatusDropdownContainer = styled.div`
  position: relative;
  width: 80px;
  font-size: 12px;
`;

const StatusDropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  color: black;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const StatusText = styled.span`
  flex: 1;
  text-align: center;
`;

const DropdownIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 10px;
  margin-left: 4px;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease;
`;

const StatusDropdownList = styled.ul`
  position: fixed;
  width: 80px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 99999;
  margin-top: 4px;
`;

const StatusDropdownItem = styled.li<{ $statusColor: string; $isSelected: boolean }>`
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  background-color: ${({ $isSelected }) => ($isSelected ? '#f0f4f8' : 'white')};
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ $isSelected }) => ($isSelected ? '#e8f0f6' : '#f8f9fa')};
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const InquiryPage: React.FC = () => {
  const { show: showToast } = useToast(); // 토스트 훅 추가
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inquiry | null>(null);
  const [isChatHistoryModalOpen, setIsChatHistoryModalOpen] = useState(false);
  const [selectedChatSession, setSelectedChatSession] = useState<string>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedChatTitle, setSelectedChatTitle] = useState<string>('');
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

  // URL에서 회사 코드 추출하여 초기화
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // URL에서 /cms/가 포함되면 회사 코드 자동 추출
    if (currentPath.includes('/cms/')) {
      const extractedCompanyCode = getCompanyCodeFromUrl();
      if (extractedCompanyCode && extractedCompanyCode !== 'aigo') {
        setSelectedCompanyCode(extractedCompanyCode);
        setSelectedCompanyName(extractedCompanyCode.toUpperCase());
        setIsInitialLoad(false); // 회사 코드 추출 시 초기 로드 플래그 해제
        devLog('🏢 [상담 요청 관리] URL에서 회사 코드 자동 추출:', {
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

  // 컴포넌트 마운트 시 isRoot 값 확인
  React.useEffect(() => {
    devLog('🔍 [InquiryPage] 컴포넌트 마운트 시 상태 확인:', {
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

  // 견적문의 상태 업데이트 핸들러
  const handleInquiryStatusSave = async (inquiryId: string, newStatus: string, newMemo: string) => {
    try {
      devLog('견적문의 상태 업데이트:', { inquiryId, newStatus, newMemo });
      
      // API 호출로 상태 업데이트
      await updateEstimateRequestStatus(inquiryId, {
        status: newStatus as 'pending' | 'approved' | 'rejected',
        memo: newMemo
      });

      showToast('상담 요청 정보가 수정되었습니다.', 'success');

      // 리스트 새로고침
      listRef.current?.refetch();
    } catch (error) {
      console.error('견적문의 상태 업데이트 오류:', error);
      showToast('상담 요청 정보가 수정에 실패했습니다.', 'error');
      throw error;
    }
  };

  // 테이블에서 상태 변경 핸들러
  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      devLog('테이블에서 상태 변경:', { inquiryId, newStatus });
      
      // API 호출로 상태만 업데이트 (메모는 기존 값 유지)
      await updateEstimateRequestStatus(inquiryId, {
        status: newStatus as 'pending' | 'approved' | 'rejected'
      });
      
      showToast('처리상태가 변경되었습니다.', 'success');
      
      // 리스트 새로고침
      listRef.current?.refetch();
    } catch (error) {
      console.error('상태 변경 오류:', error);
      showToast('상태 변경에 실패했습니다.', 'error');
    }
  };

  // 상태 텍스트 변환 함수 (서버 영어 상태 -> 한글 상태)
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'pending': return '접수';
      case 'in_progress': return '진행';
      case 'rejected': return '실패';
      case 'approved': return '완료';
      default: return status || '접수';
    }
  };

  // 대화 이력 보기 핸들러
  const handleChatHistoryClick = (chatSession?: string, userName?: string, chatTitle?: string) => {
    if (chatSession) {
      setSelectedChatSession(chatSession);
      setSelectedUserName(userName || '사용자');
      setSelectedChatTitle(chatTitle || '견적 문의');
      setIsChatHistoryModalOpen(true);
    } else {
      showToast('대화 이력이 없습니다.', 'error');
    }
  };

  // 채팅 이력 모달 닫기 핸들러
  const closeChatHistoryModal = () => {
    setIsChatHistoryModalOpen(false);
    setSelectedChatSession('');
    setSelectedUserName('');
    setSelectedChatTitle('');
  };

  // PDF 다운로드 핸들러
  const handleDownloadPdf = async (estimateId?: string) => {
    if (!estimateId) {
      showToast('견적 PDF가 없습니다.', 'error');
      return;
    }
    
    try {
      devLog(`Downloading PDF for estimate: ${estimateId}`);
      
      // URL 경로 결정: /cms/가 포함되면 회사별 CMS, 아니면 슈퍼어드민
      const currentPath = window.location.pathname;
      let previewUrl = `/superadmin/pdf-preview?uuid=${estimateId}&companyCode=${selectedCompanyCode}`;
      
      if (currentPath.includes('/cms/')) {
        const companyCode = getCompanyCodeFromUrl();
        previewUrl = `/${companyCode}/cms/pdf-preview?uuid=${estimateId}`;
      } 
      const newWindow = window.open(previewUrl, '_blank');
      
      setTimeout(() => {
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = previewUrl;
        }
      }, 100);
      
      devLog('PDF 미리보기 페이지가 새 탭에서 열립니다.','success');
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      showToast('PDF 다운로드 중 오류가 발생했습니다.', 'error');
    }
  };

  // 파일 다운로드 핸들러 (사용하지 않지만 남겨둠)
  const handleDownloadFile = (estimateFile?: string) => {
    if (estimateFile) {
      showToast(`견적 파일 다운로드: ${estimateFile}`, 'success');
    } else {
      showToast('견적 파일이 없습니다.', 'error');
    }
  };

  // 엑셀 다운로드 핸들러 (adminApi.ts의 downloadEstimateExcel 함수 사용)
  const handleDownloadExcel = async (estimateId?: string) => {
    if (!estimateId) {
      showToast('견적 ID가 없습니다.', 'error');
      return;
    }
    
    try {
      devLog(`Downloading Excel for estimate: ${estimateId}`);
      
      // adminApi.ts의 downloadEstimateExcel 함수를 직접 사용
      const result = await downloadEstimateExcel(estimateId);
      
      if (result.success) {
        devLog(`엑셀 다운로드 완료: ${result.filename}`);
        showToast('엑셀 파일이 성공적으로 다운로드되었습니다.', 'success');
      } else {
        throw new Error('엑셀 파일 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      showToast('엑셀 다운로드 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.', 'error');
    }
  };

  // 고객사 선택 핸들러
  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    devLog('🏢 [고객사 선택]:', company);
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    
    // 초기 로드 플래그 해제 (실제 조회이므로)
    setIsInitialLoad(false);
    
    // 고객사 변경 시 리스트 새로고침
    setTimeout(() => {
      listRef.current?.refetch();
    }, 100);
  }, []);

  // 초기 날짜 설정 핸들러 (GenericUI에서 초기 날짜가 설정되었을 때 호출)
  const handleInitialDateSet = useCallback((fromDate: string, toDate: string) => {
    devLog('📅 [초기 날짜 설정]:', { fromDate, toDate });
    setCurrentFromDate(fromDate);
    setCurrentToDate(toDate);
  }, []);

  // 날짜 변경 핸들러 (GenericUI에서 날짜가 변경되었을 때 호출)
  const handleDateChange = useCallback((fromDate: string, toDate: string) => {
    devLog('📅 [날짜 변경]:', { fromDate, toDate });
    setCurrentFromDate(fromDate);
    setCurrentToDate(toDate);
    // 날짜 변경 시에는 실제 조회이므로 초기 로드 플래그 해제
    setIsInitialLoad(false);
  }, []);

  // 검색 변경 핸들러 (GenericUI에서 검색이 실행될 때 호출)
  const handleSearchChange = useCallback((keyword: string) => {
    devLog('🔍 [검색 변경]:', { keyword });
    setCurrentKeyword(keyword);
    // 검색 시에는 실제 조회이므로 초기 로드 플래그 해제
    setIsInitialLoad(false);
  }, []);

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<Inquiry>> => {
      try {
        // 검색이나 날짜 변경 등으로 인한 호출이 아닌 초기 로드 시에는 API 호출하지 않음
        // params에 값이 있으면 실제 조회이므로 API 호출
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
          devLog('🔄 [상담요청 조회] AuthContext 준비 중...');
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
            devLog('🔄 [상담 요청 API] URL에서 회사 코드 추출:', {
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
          devLog('🚫 [상담요청 조회] 통합관리자 - 회사 선택 필요');
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
        
        devLog('🚀 [상담요청 조회] fetchData 시작:', {
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

        devLog('📋 [상담요청 조회] API 호출 전 파라미터:', {
          apiParams,
          companyCode,
          isRoot,
          selectedCompanyCode,
          willCallIntegratedAdmin: isRoot,
          willCallSiteAdmin: !isRoot,
        });
        
        const response = await getEstimateRequestListByRole(apiParams, companyCode);
        
        devLog('✅ [상담요청 조회] API 응답:', response);

        // adminMng와 동일한 응답 처리 로직
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        devLog('actualResponse', actualResponse);

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data;
        devLog('apiResponse', apiResponse);

        // API 응답이 배열로 직접 오는 경우 처리
        if (Array.isArray(apiResponse)) {
          // 새로운 API 응답 형식에 맞게 데이터 매핑
          const mappedData: Inquiry[] = apiResponse.map((item: any, index: number) => {
            const isGuest = item.userInfo?.isGuest === true;
            let profileImageUrl = '/ai-estimate/no-profile.png'; // 기본값
            
            if (isGuest) {
              profileImageUrl = '/cms/guest.png';
            } else if (item.userInfo?.profileImage) {
              profileImageUrl = item.userInfo.profileImage;
            }
            
            return {
              no: item.no || index + 1, // API 응답의 no 필드 사용, 없으면 index + 1
              _id: item._id,
              inquiryDate: item.createAt,
              name: item.userInfo?.name || '알 수 없음',
              userId: item.user, // 사용자 ID
              profileImageUrl, // 수정된 프로필 이미지 로직
              email: item.userInfo?.email || '-',
              cellphone: item.userInfo?.cellphone || '-',
              title: item.title,
              memo: item.memo || '-',
              status: getStatusText(item.status), // 상태 텍스트 변환
              chatSession: item.chatSession,
              estimateId: item.estimateId,
              estimateFile: undefined, // 새 응답에는 estimateFile이 없음
              isGuest,
              userInfo: item.userInfo,
            };
          });

          devLog('📋 [상담요청 조회] 매핑된 데이터:', mappedData);

          return {
            data: mappedData,
            totalItems: mappedData.length,
            allItems: mappedData.length,
          };
        } else if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          // 기존 형식의 응답 처리
          const mappedData: Inquiry[] = (apiResponse.data || []).map((item: any, index: number) => {
            const isGuest = item.userInfo?.isGuest === true;
            let profileImageUrl = '/ai-estimate/no-profile.png'; // 기본값
            
            if (isGuest) {
              profileImageUrl = '/cms/guest.png';
            } else if (item.userInfo?.profileImage) {
              profileImageUrl = item.userInfo.profileImage;
            }
            
            return {
              no: item.no || index + 1, // API 응답의 no 필드 사용, 없으면 index + 1
              _id: item._id,
              inquiryDate: item.createAt,
              name: item.userInfo?.name || '알 수 없음',
              userId: item.user, // 사용자 ID
              profileImageUrl, // 수정된 프로필 이미지 로직
              email: item.userInfo?.email || '-',
              cellphone: item.userInfo?.cellphone || '-',
              title: item.title,
              memo: item.memo || '-',
              status: getStatusText(item.status), // 상태 텍스트 변환
              chatSession: item.chatSession,
              estimateId: item.estimateId,
              estimateFile: undefined, // 새 응답에는 estimateFile이 없음
              isGuest,
              userInfo: item.userInfo,
            };
          });

          devLog('📋 [상담요청 조회] 매핑된 데이터:', mappedData);

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
    [isRoot, currentKeyword, ready, currentFromDate, currentToDate, isInitialLoad, selectedCompanyCode] // selectedCompanyCode 다시 추가
  );

  const columns: ColumnDefinition<Inquiry>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no', sortable: true, width: 60 },
      { 
        header: '문의 일시', 
        accessor: 'inquiryDate', 
        sortable: true, 
        width: 150,
        formatter: (value) => dayjs(value).format('YY.MM.DD(ddd) HH:mm') 
      },
      {
        header: '프로필',
        accessor: 'profileImageUrl',
        width: 60, // 60px 너비 설정
        noPopup: true,
        formatter: (value, row) => {
          let imageUrl = '/ai-estimate/no-profile.png'; // 기본값
          
          if (row.userInfo?.isGuest === true) {
            imageUrl = '/cms/guest.png';
          } else if (row.userInfo?.profileImage) {
            imageUrl = row.userInfo.profileImage;
          } else if (row.profileImageUrl) {
            imageUrl = row.profileImageUrl;
          }
          
          return (
            <ProfileWrapper>
              <ProfileHeader $imageUrl={imageUrl} />
            </ProfileWrapper>
          );
        },
      },
      { header: '이름', accessor: 'name', sortable: true, flex: 0.7 },
      { header: '이메일', accessor: 'email', sortable: true, allowWrap: true, flex: 1 },
      { header: '전화번호', accessor: 'cellphone', sortable: true, width: 110 },
      { header: '아이디', accessor: 'userId', sortable: true, flex: 1, allowWrap: true },
      { header: '제목', accessor: 'title' ,flex:1,allowWrap: true},
      { header: '메모', accessor: 'memo', formatter: (value) => value || '-' },
      { 
        header: '처리상태', 
        accessor: 'status', 
        width: 100,
        noPopup: true,
        formatter: (value, row) => (
          <StatusDropdown
            currentStatus={value || '접수'}
            onStatusChange={(newStatus) => handleStatusChange(row._id, newStatus)}
          />
        )
      },
      {
        header: '견적PDF다운',
        accessor: 'estimateId',
        noPopup: true,
        sortable: false,
        width: 110,
        formatter: (value, row) => (
            <DownloadPdfButton 
              $themeMode="light" 
              onClick={() => handleDownloadPdf(row.estimateId)}
            >
              PDF 다운로드
            </DownloadPdfButton>
        ),
      },
      {
        header: '견적XLX다운',
        accessor: 'estimateId',
        noPopup: true,
        sortable: false,
        width: 110,
        formatter: (value, row) => (
            <DownloadPdfButton 
              $themeMode="light" 
              style={{ backgroundColor: '#51815A' }}
              onClick={() => handleDownloadExcel(row.estimateId)}
            >
              엑셀 다운로드
            </DownloadPdfButton>
        ),
      },
      {
        header: '대화이력보기',
        accessor: 'chatSession',
        sortable: false,
        noPopup: true,
        width: 110,
        formatter: (value, row) => (
            <DetailActionButton 
              $themeMode="light" 
              onClick={() => handleChatHistoryClick(row.chatSession, row.name, row.title)}
            >
              대화 이력 보기
            </DetailActionButton>
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
      />
      {/* 견적문의 처리 모달 */}
      <EstimateInquiryModal
        isOpen={isPopupOpen}
        onClose={closePopup}
        selectedInquiry={selectedItem}
        onSave={handleInquiryStatusSave}
      />

      {/* 채팅 이력 모달 */}
      <ChatHistoryModal
        isOpen={isChatHistoryModalOpen}
        onClose={closeChatHistoryModal}
        chatSessionId={selectedChatSession}
        userName={selectedUserName}
        chatTitle={selectedChatTitle}
      />
    </>
  );
};

export default InquiryPage;