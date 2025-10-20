'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import GenericListUI, {
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import {
} from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import { adminGetList, getUserList, adminCreate, updateUser, getUserDetail } from '@/lib/api/admin/adminApi';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { THEME_COLORS } from '@/styles/theme_colors';
import ActionButton from '@/components/ActionButton';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import CommonTextField from '@/components/common/TextField';
import TextArea from '@/components/common/TextArea';
import SelectionField from '@/components/selectionField';
import { AppColors } from '@/styles/colors';
import { Validators } from '@/lib/utils/validators';
import { useToast } from '@/components/common/ToastProvider';
import Switch from '@/components/Switch';
import { SwitchInput } from '@/components/SwitchInput';
import { devLog } from '@/lib/utils/devLogger';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import ConfirmButton from '@/components/ConfirmButton';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useCompanyCode } from '@/hooks/useCompanyCode';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
`;

const SwitchLabel = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: black;
`;

const ProfileWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ProfileHeader = styled.div<{ $imageUrl: string | null }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-image: url(${({ $imageUrl }) => $imageUrl || '/ai-astimate/no-profile.png'});
  border: 1px solid #ccc;
  flex-shrink: 0;
  // margin-right: 8px;
`;

type User = {
  _id: string;
  name: string;
  email: string;
  cellphone: string;
  lastLoginAt?: string | null;
  createAt: string;
  updateAt?: string;
  profileImage?: string;
  providerId?: string;
  usingService?: string[];
  memo?: string;
  nation?: string;
};

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 0 14px;
`;

const Title = styled.h2`
  padding: 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
`;

const FooterButton = styled.button`
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;

  &:hover{
  border: 1px solid ${AppColors.border};
`;

const CancelButton = styled(FooterButton)`
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};
  border-radius: 4px;
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
  border-radius: 4px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 22px;
  justify-content: space-evenly;
`;

const RegisterButton = styled(ActionButton)<{ $themeMode: 'light' | 'dark' }>`
  background: ${({ $themeMode }) =>
    $themeMode === 'light'
      ? THEME_COLORS.light.primary
      : THEME_COLORS.dark.buttonText};
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.primary};
  border: none;
  &:hover:not(:disabled) {
    background-color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#e8e8e8' : '#424451'};
  }
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 0 0 0;
  // background-color: #2C2E3C; // 이미지 배경색에 맞춰 조정
  border-radius: 8px;
  // margin-bottom: 24px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 50px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  color: #000;
  font-size: 16px;
  flex-grow: 1;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
`;

const DetailIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #AAAAAA;
`;

const NameText = styled.div`
  // font-weight: bold;
  font-size: 14px;
  // margin-bottom: 8px;
`;

const MemoField = styled(TextField)`
  .MuiInputBase-root {
    min-height: 150px;
    align-items: flex-start;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 10px;
`;

// 가입이력 관련 스타일 컴포넌트들
const JoinHistorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
`;

const JoinHistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 0;
  // border-bottom: 1px solid #e0e0e0;
  
`;

const JoinHistoryTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
`;

const JoinHistoryIcon = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  transform: ${({ $isExpanded }) => $isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'};
  
  svg {
    width: 14px;
    height: 8px;
  }
`;

const JoinHistoryContent = styled.div<{ $isExpanded: boolean }>`
  display: ${({ $isExpanded }) => $isExpanded ? 'block' : 'none'};
  // background-color: #f8f9fa;
  border-radius: 8px;
  padding: 0;
  margin-top: 8px;
  gap: 8px;
`;

const JoinHistoryItem = styled.div`
  background-color: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const JoinHistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const JoinHistoryCompany = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const JoinHistoryDate = styled.div`
  font-size: 12px;
  color: #999;
  font-weight: 400;
`;

const JoinHistoryToggleButton = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  color: #666;
  font-size: 12px;
  gap: 4px;
  
  svg {
    width: 12px;
    height: 6px;
    transition: transform 0.3s ease;
    transform: ${({ $isExpanded }) => $isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'};
  }
  
  &:hover {
    color: #333;
  }
`;

const JoinHistoryMemoSection = styled.div<{ $isExpanded: boolean }>`
  display: ${({ $isExpanded }) => $isExpanded ? 'block' : 'none'};
  margin-top: 12px;
`;

const JoinHistoryLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 12px;
`;

const JoinHistoryMemo = styled.div`
  font-size: 13px;
  color: #555;
  background-color: #F7F7F7;
  padding: 12px;
  border-radius: 4px;
  line-height: 1.4;
`;

const UserMngPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(
    null
  );
  const { show: showToast } = useToast(); // 토스트 훅 추가
  
  // 권한 및 URL 기반 상태 관리
  const { isRoot } = useAdminAuth();
  const urlCompanyCode = useCompanyCode();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [emailYn, setEmailYn] = useState<'Y' | 'N'>('Y');
  const [smsYn, setSmsYn] = useState<'Y' | 'N'>('Y');
  const [description, setDescription] = useState('');

  const [idError, setIdError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cellphoneError, setCellphoneError] = useState<string | null>(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  
  // 가입이력 관련 상태
  const [isJoinHistoryExpanded, setIsJoinHistoryExpanded] = useState(false);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<{ [key: number]: boolean }>({});
  
  // 가입이력 데이터 (API 응답에서 가져온 데이터)
  const joinHistory = useMemo(() => {
    if (!selectedUser?.usingService || !Array.isArray(selectedUser.usingService)) {
      return [];
    }
    
    return selectedUser.usingService.map((service: any) => ({
      companyName: service.company?.companyName || '알 수 없음',
      joinDate: service.createAt || service.createAt,
      memo: service.memo || '메모 없음'
    }));
  }, [selectedUser]);

  // 가입이력 토글 함수
  const toggleJoinHistory = () => {
    setIsJoinHistoryExpanded(!isJoinHistoryExpanded);
  };

  // 개별 이력 아이템 더보기 토글 함수
  const toggleHistoryItemMemo = (index: number) => {
    setExpandedHistoryItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 화살표 아이콘 컴포넌트
  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.70832 0.293633C7.52079 0.106162 7.26648 0.000846386 7.00132 0.000846386C6.73616 0.000846386 6.48185 0.106162 6.29432 0.293633L0.63732 5.95063C0.541809 6.04288 0.465627 6.15322 0.413218 6.27523C0.360809 6.39723 0.333223 6.52845 0.332069 6.66123C0.330915 6.79401 0.356217 6.92569 0.406498 7.04859C0.456779 7.17148 0.531032 7.28314 0.624925 7.37703C0.718818 7.47092 0.830469 7.54517 0.953365 7.59546C1.07626 7.64574 1.20794 7.67104 1.34072 7.66988C1.4735 7.66873 1.60472 7.64114 1.72672 7.58874C1.84873 7.53633 1.95907 7.46014 2.05132 7.36463L7.00132 2.41463L11.9513 7.36463C12.1399 7.54679 12.3925 7.64759 12.6547 7.64531C12.9169 7.64303 13.1677 7.53786 13.3531 7.35245C13.5385 7.16704 13.6437 6.91623 13.646 6.65403C13.6483 6.39184 13.5475 6.13924 13.3653 5.95063L7.70832 0.293633Z" fill="#555555"/>
    </svg>
  );
  
  
  // 날짜 상태 - 초기값은 null로 설정하고 UI에서 설정된 값을 받음
  const [dateRange, setDateRange] = useState<{
    fromDate: string;
    toDate: string;
  } | null>(null);

  const listRef = useRef<{ refetch: () => void }>(null);

  const clearFormErrors = useCallback(() => {
    setIdError(null);
    setPwdError(null);
    setNameError(null);
    setEmailError(null);
    setCellphoneError(null);
  }, []);

  const resetForm = useCallback(
    (initial?: Partial<User>) => {
      setSelectedUser(initial ?? null);
      setUserId(initial?._id ?? '');
      setPassword('');
      setName(initial?.name ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      // 이메일/SMS 수신 여부 기본값 설정
      setEmailYn('Y'); // 기본값으로 설정
      setSmsYn('Y'); // 기본값으로 설정
      setDescription(initial?.memo || '');
      clearFormErrors();
    },
    [clearFormErrors]
  );

  const handleHeaderButtonClick = () => {
    resetForm(); // 신규 등록
    setIsPopupOpen(true);
  };

  const handleRowClick = async (item: User) => {
    try {
      // URL에 cms가 포함된 경우 상세 조회 API 호출하지 않고 기본 데이터 사용
      const isCompanyCMS = typeof window !== 'undefined' && 
        window.location.pathname.includes('/cms');
      
      if (isCompanyCMS) {
        // cms URL인 경우 리스트 데이터만 사용
        // 현재 회사 코드 추출
        const currentCompanyCode = urlCompanyCode || '';
        
        // usingService 배열에서 현재 회사 코드와 일치하는 항목의 memo 찾기
        let extractedMemo = '';
        if (item.usingService && Array.isArray(item.usingService) && item.usingService.length > 0) {
          // 현재 회사 코드와 일치하는 서비스 찾기
          const matchingService = item.usingService.find((service: any) => {
            if (service && typeof service === 'object') {
              // company.companyCode 또는 companyCode로 비교
              const serviceCompanyCode = service.company?.companyCode || service.companyCode;
              return serviceCompanyCode === currentCompanyCode;
            }
            return false;
          });
          
          // 일치하는 서비스가 있으면 해당 memo 사용
          if (matchingService) {
            const matchingServiceObj = matchingService as any;
            if (matchingServiceObj && typeof matchingServiceObj === 'object' && 'memo' in matchingServiceObj) {
              extractedMemo = matchingServiceObj.memo || '';
            }
          }
          // 일치하는 서비스가 없으면 첫 번째 항목의 memo 사용 (폴백)
          if (!extractedMemo && item.usingService.length > 0) {
            const firstService = item.usingService[0];
            if (firstService) {
              const firstServiceObj = firstService as any;
              if (firstServiceObj && typeof firstServiceObj === 'object' && 'memo' in firstServiceObj) {
                extractedMemo = firstServiceObj.memo || '';
              }
            }
          }
        }
        
        devLog('📝 [CMS 회원 상세] memo 추출:', {
          currentCompanyCode,
          extractedMemo,
          usingServiceCount: item.usingService?.length || 0
        });
        
        const itemWithMemo = {
          ...item,
          memo: extractedMemo
        };
        
        resetForm(itemWithMemo);
        setIsPopupOpen(true);
        return;
      }
      
      // 통합관리자인 경우만 상세 조회 API 호출
      const response = await getUserDetail(item._id);
      
      devLog('회원 상세 정보 조회 응답:', response);
      
      let detailData = null;
      
      // 응답 처리 (다른 API와 동일한 패턴)
      if (response && typeof response === 'object') {
        if ('statusCode' in response && response.statusCode === 200) {
          detailData = (response as any).data;
        } else if (Array.isArray(response) && response[0]) {
          const firstItem = response[0];
          if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
            const responseData = firstItem.data;
            if (responseData && typeof responseData === 'object' && 'statusCode' in responseData && responseData.statusCode === 200) {
              detailData = (responseData as any).data;
            }
          }
        }
      }
      
      if (detailData) {
        // memo 추출: 최상위 memo 또는 usingService 배열의 첫 번째 항목의 memo
        let extractedMemo = detailData.memo || '';
        if (!extractedMemo && detailData.usingService && Array.isArray(detailData.usingService) && detailData.usingService.length > 0) {
          const firstService = detailData.usingService[0];
          if (firstService && typeof firstService === 'object' && 'memo' in firstService) {
            extractedMemo = (firstService as any).memo || '';
          }
        }
        
        // 상세 정보로 폼 초기화
        const userWithDetails = {
          ...item,
          ...detailData,
          memo: extractedMemo,
          // usingService 배열을 처리하여 가입이력 데이터로 변환
          usingService: detailData.usingService || []
        };
        
        resetForm(userWithDetails);
      } else {
        // 상세 정보 조회 실패 시 기본 정보로 폴백
        resetForm(item);
        showToast('회원 상세 정보를 불러올 수 없습니다. 기본 정보로 표시됩니다.', 'error');
      }
      
      setIsPopupOpen(true);
    } catch (error) {
      console.error('회원 상세 정보 조회 오류:', error);
      // 에러 발생 시 기본 정보로 폴백
      resetForm(item);
      setIsPopupOpen(true);
      showToast('회원 상세 정보 조회 중 오류가 발생했습니다.', 'error');
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSave = async () => {
    let valid = true;
    
    // 수정 모드인지 확인 (selectedUser가 있으면 수정, 없으면 신규 등록)
    const isEditMode = selectedUser && selectedUser._id;
    
    // URL에 cms가 포함되었는지 확인
    const isCompanyCMS = typeof window !== 'undefined' && 
      window.location.pathname.includes('/cms');

    // 신규 등록시에만 아이디와 비밀번호 검증
    if (!isEditMode) {
      if (!Validators.required(userId) || !Validators.id(userId)) {
        setIdError('아이디는 영문자와 숫자를 포함한 6~20자여야 합니다.');
        valid = false;
      } else setIdError(null);

      if (!Validators.password(password)) {
        setPwdError(
          '비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.'
        );
        valid = false;
      } else setPwdError(null);

      if (!Validators.required(name)) {
        setNameError('이름을 입력해주세요.');
        valid = false;
      } else setNameError(null);
    }

    // 이메일과 전화번호는 cms URL이 아닌 경우에만 검증
    if (!isCompanyCMS) {
      if (!Validators.email(email)) {
        setEmailError('올바른 이메일 형식이 아닙니다.');
        valid = false;
      } else setEmailError(null);

      if (!Validators.phone(cellphone)) {
        setCellphoneError('연락처는 숫자 11자리여야 합니다.');
        valid = false;
      } else setCellphoneError(null);
    }

    if (!valid) return;

    try {
      let response;
      
      if (isEditMode) {
        // 회원 정보 수정
        const apiCompanyCode = isRoot ? selectedCompanyCode : urlCompanyCode;
        
        // cms URL인 경우 memo만 포함하는 요청 바디
        const updateParams = isCompanyCMS 
          ? {
              id: selectedUser._id!,
              memo: description,
              companyCode: apiCompanyCode || '',
            }
          : {
              id: selectedUser._id!,
              cellphone: cellphone,
              email: email,
              memo: description,
              companyCode: apiCompanyCode || '',
            };
        
        response = await updateUser(updateParams);
        
        devLog('회원 정보 수정 응답', response);
        
        const responseData = Array.isArray(response) ? response[0] : response;
        devLog("응답데이터 ",responseData);
      if (responseData && responseData.data.statusCode === 200 && responseData.data.message === 'success') {
          showToast('회원 정보가 수정되었습니다.','success');
          setIsPopupOpen(false);
          listRef.current?.refetch();
        } else {
          let errorMessage = '회원 정보 수정에 실패했습니다.';
          
          if (responseData && typeof responseData === 'object') {
            if ('error' in responseData && responseData.error && typeof responseData.error === 'object' && 'customMessage' in responseData.error) {
              errorMessage = responseData.error.customMessage as string;
            } else if ('message' in responseData) {
              errorMessage = responseData.message as string;
            }
          }

          showToast(errorMessage, 'error');
        }
      } else {
        // 신규 사용자 등록 (기존 로직)
        response = await adminCreate({
          adminId: userId,
          password,
          name,
          cellphone,
          memo: description,
          email,
          receiveEmail: emailYn === 'Y',
          receiveAlimtalk: smsYn === 'Y',
          companyCode: selectedCompanyCode || undefined,
        });

        devLog('사용자 등록 응답', response);

        const responseData = Array.isArray(response) ? response[0] : response;
        
        if (responseData && typeof responseData === 'object' && 'message' in responseData && responseData.message === 'success') {
          showToast('사용자가 성공적으로 등록되었습니다.','success');
          setIsPopupOpen(false);
          listRef.current?.refetch();
        } else {
          let errorMessage = '사용자 등록에 실패했습니다.';
          
          if (responseData && typeof responseData === 'object') {
            if ('error' in responseData && responseData.error && typeof responseData.error === 'object' && 'customMessage' in responseData.error) {
              errorMessage = responseData.error.customMessage as string;
            } else if ('message' in responseData) {
              errorMessage = responseData.message as string;
            }
          }

          showToast(errorMessage, 'error');
        }
      }
    } catch (error: any) {
      const errorMessage = error?.customMessage || error?.message || (isEditMode ? '회원 정보 수정에 실패했습니다.' : '사용자 등록에 실패했습니다.');
      showToast(errorMessage, 'error');
    }
  };

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<User>> => {
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
        
        // API 호출 시 사용할 companyCode 결정
        const apiCompanyCode = isRoot ? selectedCompanyCode : urlCompanyCode;
        
        devLog('🔍 [fetchData 호출]', { searchKeyword, fromDate, toDate, apiCompanyCode, isRoot });
        
        // API 호출
        const response = await getUserList({
          keyword: searchKeyword,
          fromDate: fromDate,
          toDate: toDate,
          companyCode: apiCompanyCode || '',
          isRoot: isRoot, // 권한 정보도 함께 전달
        });
        
        devLog('✅ [fetchData 응답 받음]', response);
        
        // 응답 처리 (응답 구조에 맞게 수정)
        if (response && typeof response === 'object') {
          // 응답이 직접 API 응답 객체인 경우
          if ('statusCode' in response && response.statusCode === 200) {
            // 타입 단언으로 안전하게 처리
            const responseWithData = response as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
            const userData = responseWithData.data || [];
            const totalItems = responseWithData.metadata?.totalCnt || userData.length;
            const allItems = responseWithData.metadata?.allCnt || totalItems;
            return { data: userData, totalItems, allItems };
          } 
          // 응답이 배열로 감싸져 있는 경우 (callAdminApi 특성)
          else if (Array.isArray(response) && response[0]) {
            const firstItem = response[0];
            if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
              const responseData = firstItem.data;
              if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
                // 타입 단언으로 안전하게 처리
                const typedResponseData = responseData as { data?: any[]; metadata?: { totalCnt?: number; allCnt?: number } };
                const userData = typedResponseData.data || [];
                const totalItems = typedResponseData.metadata?.totalCnt || userData.length;
                const allItems = typedResponseData.metadata?.allCnt || totalItems;
                return { data: userData, totalItems, allItems };
              }
            }
          }
        }
        
        console.error('유저 목록 응답 형식이 예상과 다릅니다:', response);
        return { data: [], totalItems: 0, allItems: 0 };
      } catch (error) {
        console.error('고객 회원 조회 오류:', error);
        return { data: [], totalItems: 0, allItems: 0 };
      }
    },
    [currentKeyword, selectedCompanyCode, dateRange, isRoot, urlCompanyCode]
  );

  const handleDropdownChange = useCallback(
    (adminId: string, type: 'emailYn' | 'smsYn', newValue: 'Y' | 'N') => {
      devLog(`Changed ${type} for ${adminId} to ${newValue}`);
    },
    []
  );

  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    // 통합관리자만 회사 선택 가능
    if (!isRoot) return;
    
    devLog('=== Company selected ===:', company);
    
    if (!company.id) {
      showToast('회사 코드가 없습니다. 고객사를 다시 선택해주세요.', 'error');
      return;
    }
    
    // 상태 업데이트
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    
    // 고객사 변경 시 리스트 새로고침
    setTimeout(() => {
      listRef.current?.refetch();
    }, 100);
  }, [showToast, isRoot]);

  // selectedCompanyCode 변경 시 refetch 실행 (통합관리자만)
  React.useEffect(() => {
    if (isRoot && selectedCompanyCode && listRef.current) {
      devLog('🏢 Company 변경 감지, refetch 실행:', selectedCompanyCode);
      listRef.current.refetch();
    }
  }, [selectedCompanyCode, isRoot]);

  const columns: ColumnDefinition<User>[] = useMemo(
    () => [
      { 
        header: 'No', 
        accessor: 'no',
        width: 60,
        // formatter: (_value, _item, index) => index + 1 
      },
      {
        header: '가입일시',
        accessor: 'createAt',
        sortable: true,
        flex: 1,
        allowWrap: true,
        formatter: (value) => (value ? dayjs(value).format('YY.MM.DD(ddd) HH:mm') : '-'),
      },
      {
        header: '최근접속',
        accessor: 'lastLoginAt',
        sortable: true,
        flex: 1,
        allowWrap: true,
        formatter: (value) => (value ? dayjs(value).format('YY.MM.DD(ddd) HH:mm') : '-'),
      },
      // {
      //   header: '고객사명',
      //   accessor: 'usingService',
      //   flex: 1,
      //   formatter: (value) => (Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'),
      // },
      {
        header: '프로필',
        accessor: 'profileImage',
        width: 60,
        formatter: (value, row) => (
          <ProfileWrapper>
            <ProfileHeader $imageUrl={row.profileImage || "/ai-estimate/no_profile.png"} />
          </ProfileWrapper>
        ),
      },
      {
        header: '이름',
        flex: 1,
        accessor: 'name',
      },
      { 
        header: '이메일', 
        accessor: 'email',
        flex: 1,
        allowWrap: true,
        formatter: (value) => value || '-'
      },
      { 
        header: '전화번호', 
        accessor: 'cellphone',
        flex: 1,
        formatter: (value) => value || '-' 
      },
      { 
        header: '아이디', 
        accessor: '_id',
        flex: 1,
        allowWrap: true,
        formatter: (value) => value || '-'
      },
      // { 
      //   header: '국가', 
      //   accessor: 'nation',
      //    width: 60,
      //   formatter: (value) => value || 'KR' 
      // },
      { 
        header: '비고', 
        flex: 1,
        accessor: 'memo',
        formatter: (value, row) => {
          // URL에 cms가 포함되어 있으면 usingService에서 현재 회사의 memo 찾기
          const isCompanyCMS = typeof window !== 'undefined' && 
            window.location.pathname.includes('/cms');
          
          if (isCompanyCMS) {
            const currentCompanyCode = urlCompanyCode || '';
            
            // usingService 배열에서 현재 회사 코드와 일치하는 항목의 memo 찾기
            if (row.usingService && Array.isArray(row.usingService) && row.usingService.length > 0) {
              const matchingService = row.usingService.find((service: any) => {
                if (service && typeof service === 'object') {
                  const serviceCompanyCode = service.company?.companyCode || service.companyCode;
                  return serviceCompanyCode === currentCompanyCode;
                }
                return false;
              });
              
              if (matchingService) {
                const matchingServiceObj = matchingService as any;
                if (matchingServiceObj && typeof matchingServiceObj === 'object' && 'memo' in matchingServiceObj) {
                  return matchingServiceObj.memo || '-';
                }
              }
              
              // 일치하는 항목이 없으면 첫 번째 항목의 memo (폴백)
              const firstService = row.usingService[0];
              if (firstService) {
                const firstServiceObj = firstService as any;
                if (firstServiceObj && typeof firstServiceObj === 'object' && 'memo' in firstServiceObj) {
                  return firstServiceObj.memo || '-';
                }
              }
            }
          }
          
          // 최상위 memo 또는 기본값 반환
          return value || '-';
        }
      },
    ],
    []
  );

  return (
    <>
      <CmsResponsiveContainer<User>
        ref={listRef}
        title="사용자 관리"
        data={[]}
        columns={columns}
        fetchData={fetchData}
        enableDateFilter={true}
        
        searchPlaceholder="이름, 이메일, 아이디 검색"
        
        onRowClick={handleRowClick}
        themeMode="light"
        enableCompanySearch={isRoot} // 통합관리자만 CompanySearch 표시
        onCompanySelect={handleCompanySelect}
        dateRangeOptions={['3개월', '6개월', '1년', '지정']}
        onDateChange={(fromDate, toDate) => {
          devLog('📅 고객 회원관리 - 날짜 변경:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onInitialDateSet={(fromDate, toDate) => {
          devLog('📅 고객 회원관리 - 초기 날짜 설정:', { fromDate, toDate });
          setDateRange({ fromDate, toDate });
        }}
        onSearchChange={(keyword) => {
          devLog('🔍 고객 회원관리 - 검색어 변경:', keyword);
          setCurrentKeyword(keyword);
        }}
      />

<CmsPopup
      title={selectedUser?._id ? "회원 정보 수정" : "회원 등록"}
      isOpen={isPopupOpen}
      onClose={closePopup}
      showRequiredMark={true}
      height="auto"
      backgroundColor="white"
      bottomFloating={
        <PopupFooter>
          {/* 왼쪽 영역 */}
          <div />

          {/* 오른쪽 영역: 저장/닫기 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveButton onClick={handleSave}>
              {selectedUser?._id ? "수정" : "등록"}
            </SaveButton>
            <CancelButton onClick={closePopup}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >
      <FormContainer>
        {/* URL에 cms가 포함되었는지 확인 */}
        {(() => {
          const isCompanyCMS = typeof window !== 'undefined' && 
            window.location.pathname.includes('/cms');
          
          return (
            <>
              {/* 사용자 정보 섹션 */}
              <Title>회원 정보</Title>
              
              <UserInfoSection>
                <ProfileImage src={selectedUser?.profileImage || "/ai-estimate/no_profile.png"} alt="Profile" />
                <UserDetails>
                  <DetailItem>
                    <DetailIcon><PersonIcon /></DetailIcon>
                    <NameText>{selectedUser?.name || '-'}</NameText>
                  </DetailItem>
                  <DetailItem>
                    <DetailIcon><svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 14 11" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.332031 0.166992V10.8337H13.6653V0.166992H0.332031ZM6.21744 8.16699V2.63184H7.74869C8.39973 2.63184 8.92056 2.69434 9.31119 2.81934C9.8216 2.9834 10.2122 3.28809 10.4831 3.7334C10.7539 4.17611 10.8893 4.7321 10.8893 5.40137C10.8893 6.08887 10.7539 6.65006 10.4831 7.08496C10.1445 7.63444 9.62108 7.96777 8.91275 8.08496C8.58723 8.13965 8.17056 8.16699 7.66275 8.16699H6.21744ZM7.46353 7.19043H7.70181C8.26952 7.19043 8.69009 7.09798 8.96353 6.91309C9.20311 6.75423 9.37629 6.50814 9.48306 6.1748C9.56119 5.92743 9.60025 5.66441 9.60025 5.38574C9.60025 5.08628 9.55468 4.80894 9.46353 4.55371C9.37239 4.29852 9.24739 4.0993 9.08853 3.95605C8.93749 3.82064 8.76561 3.72949 8.57291 3.68262C8.3802 3.63314 8.08983 3.6084 7.70181 3.6084H7.46353V7.19043ZM3.65494 2.63184V8.16699H4.90103V2.63184H3.65494Z" fill="#AAAAAA"/>
      </svg></DetailIcon>
                    <span>ID: {selectedUser?._id || '-'}</span>
                  </DetailItem>
                  <DetailItem>
                    <DetailIcon><PhoneIcon /></DetailIcon>
                    <span>{selectedUser?.cellphone || '-'}</span>
                  </DetailItem>
                  <DetailItem>
                    <DetailIcon><EmailIcon /></DetailIcon>
                    <span>{selectedUser?.email || '-'}</span>
                  </DetailItem>
                  {selectedUser?.usingService && selectedUser.usingService.length > 0 && (
                    <DetailItem>
                      <DetailIcon><i className="fas fa-building"></i></DetailIcon>
                      {/* <span>사용 서비스: {selectedUser.usingService.join(', ')}</span> */}
                    </DetailItem>
                  )}
                </UserDetails>
              </UserInfoSection>

              {/* "정보 수정" 헤더는 cms URL이 아닌 경우에만 표시 */}
              {!isCompanyCMS && <Title>{selectedUser?._id ? "정보 수정" : "회원 등록"}</Title>}

              <FormSection>
                {/* 신규 등록시에만 표시되는 필드들 */}
                {!selectedUser?._id && (
                  <>
                    <CommonTextField
                      id="userId"
                      value={userId}
                      label="* 아이디"
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="영문자와 숫자를 포함한 6~20자"
                      errorMessage={idError ?? undefined}
                    />
                    <CommonTextField
                      id="password"
                      value={password}
                      label="* 비밀번호"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="영문, 숫자, 특수문자를 포함해 8자 이상"
                      errorMessage={pwdError ?? undefined}
                    />
                    <CommonTextField
                      id="name"
                      value={name}
                      label="* 이름"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      errorMessage={nameError ?? undefined}
                    />
                  </>
                )}
                
                {/* 이메일/전화번호 입력란은 cms URL이 아닌 경우에만 표시 */}
                {!isCompanyCMS && (
                  <>
                    <CommonTextField
                      id="email"
                      value={email}
                      label="* 이메일"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일 형식으로 입력하세요"
                      errorMessage={emailError ?? undefined}
                    />
                    <CommonTextField
                      id="cellphone"
                      value={cellphone}
                      label="* 전화번호"
                      onChange={(e) => {
                        const input = e.target.value;
                        if (/^\d*$/.test(input) && input.length <= 11) {
                          setCellphone(input);
                        }
                      }}
                      placeholder="- 제외하고 입력하세요"
                      errorMessage={cellphoneError ?? undefined}
                    />
                  </>
                )}
                
                {/* 가입이력 섹션 - 수정 모드이고 cms URL이 아닌 경우에만 표시 */}
                {selectedUser?._id && !isCompanyCMS && (
                  <JoinHistorySection>
                    <JoinHistoryHeader onClick={toggleJoinHistory}>
                      <JoinHistoryTitle>가입이력</JoinHistoryTitle>
                      <JoinHistoryIcon $isExpanded={isJoinHistoryExpanded}>
                        <ArrowIcon />
                      </JoinHistoryIcon>
                    </JoinHistoryHeader>
                    
                    <JoinHistoryContent $isExpanded={isJoinHistoryExpanded}>
                      {joinHistory.length === 0 ? (
                        <div style={{ 
                          padding: '40px 20px', 
                          textAlign: 'center', 
                          color: '#999', 
                          fontSize: '14px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          <svg 
                            style={{ marginBottom: '12px' }} 
                            width="48" 
                            height="48" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                              fill="#ccc"
                            />
                          </svg>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>가입이력이 없습니다</div>
                          <div style={{ fontSize: '12px' }}>아직 등록된 가입이력 정보가 없습니다.</div>
                        </div>
                      ) : (
                        joinHistory.map((history, index) => (
                          <JoinHistoryItem key={index}>
                            <JoinHistoryItemHeader>
                              <JoinHistoryCompany>{history.companyName}</JoinHistoryCompany>
                              <JoinHistoryDate>
                                {dayjs(history.joinDate).format('YY.MM.DD(ddd) HH:mm')} 가입 완료
                              </JoinHistoryDate>
                            </JoinHistoryItemHeader>
                            <JoinHistoryMemoSection $isExpanded={expandedHistoryItems[index] || false}>
                              <JoinHistoryMemo>
                                <JoinHistoryLabel>비고</JoinHistoryLabel>
                                {history.memo}
                              </JoinHistoryMemo>
                            </JoinHistoryMemoSection>
                            <JoinHistoryToggleButton 
                              $isExpanded={expandedHistoryItems[index] || false}
                              onClick={() => toggleHistoryItemMemo(index)}
                            >
                              <span>{expandedHistoryItems[index] ? '접기' : '더보기'}</span>
                              <ArrowIcon />
                            </JoinHistoryToggleButton>
                          </JoinHistoryItem>
                        ))
                      )}
                    </JoinHistoryContent>
                  </JoinHistorySection>
                )}

                <Title>비고</Title>
                
                <TextArea
                  id="description"
                  value={description}
                  label="비고"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="비고를 입력하세요"
                  height="200px"
                />
              </FormSection>
            </>
          );
        })()}
      </FormContainer>
    </CmsPopup>
    </>
  );
};

export default UserMngPage;