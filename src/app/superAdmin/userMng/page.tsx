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
import { adminGetList, getUserList, adminCreate } from '@/lib/api/admin/adminApi';
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
import { toast, ToastContainer } from 'react-toastify';
import Switch from '@/components/Switch';
import { SwitchInput } from '@/components/SwitchInput';
import { devLog } from '@/lib/utils/devLogger';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import ConfirmButton from '@/components/ConfirmButton';

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
  gap: 8px;
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
  margin-right: 8px;
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
  margin: 10px 0;
  padding: 0;
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
  padding: 24px;
  background-color: #2C2E3C; // 이미지 배경색에 맞춰 조정
  border-radius: 8px;
  margin-bottom: 24px;
`;

const ProfileImage = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 100px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  font-size: 16px;
  flex-grow: 1;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const DetailIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #fff;
`;

const NameText = styled.div`
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 8px;
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

const UserMngPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(
    null
  );

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

  const handleRowClick = (item: User) => {
    resetForm(item); // 수정
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSave = async () => {
    let valid = true;

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

    if (!Validators.email(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      valid = false;
    } else setEmailError(null);

    if (!Validators.phone(cellphone)) {
      setCellphoneError('연락처는 숫자 11자리여야 합니다.');
      valid = false;
    } else setCellphoneError(null);

    if (!valid) return;

    try {
      const response = await adminCreate({
        adminId: userId,
        password,
        name,
        cellphone,
        memo: description, // description을 memo로 변경
        email,
        receiveEmail: emailYn === 'Y', // Y/N 값을 boolean으로 변환
        receiveAlimtalk: smsYn === 'Y', // Y/N 값을 boolean으로 변환
        companyCode: selectedCompanyCode || undefined, // 선택된 회사 코드 추가
      });

      devLog('사용자 등록 응답', response);

      const responseData = Array.isArray(response) ? response[0] : response;
      
      // 타입 안전하게 응답 처리
      if (responseData && typeof responseData === 'object' && 'message' in responseData && responseData.message === 'success') {
        toast.success('사용자가 성공적으로 등록되었습니다.');
        setIsPopupOpen(false);
        
        // 현재 검색어와 필터를 유지하면서 리스트 새로고침
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
        
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.customMessage || error?.message || '사용자 등록에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<User>> => {
      try {
        // 현재 입력된 검색어 저장
        if (params.keyword !== undefined) {
          setCurrentKeyword(params.keyword);
        }

        const fromDate = params.fromDate || '2000-01-01';
        const toDate = params.toDate || dayjs().format('YYYY-MM-DD');
        
        // API 호출
        const response = await getUserList({
          keyword: params.keyword || currentKeyword || '',
          fromDate: fromDate,
          toDate: toDate,
          companyCode: selectedCompanyCode || '',
        });
        
        console.log('고객 회원 조회 응답:', response);
        
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
    [currentKeyword, selectedCompanyCode]
  );

  const handleDropdownChange = useCallback(
    (adminId: string, type: 'emailYn' | 'smsYn', newValue: 'Y' | 'N') => {
      console.log(`Changed ${type} for ${adminId} to ${newValue}`);
    },
    []
  );

  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    
    // 고객사 변경 시 리스트 새로고침
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.refetch();
      }
    }, 100);
  }, []);

  const columns: ColumnDefinition<User>[] = useMemo(
    () => [
      { 
        header: 'No', 
        accessor: 'no',
        formatter: (_value, _item, index) => index + 1 
      },
      {
        header: '가입일시',
        accessor: 'createAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
      },
      {
        header: '최근접속',
        accessor: 'lastLoginAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
      },
      {
        header: '고객사명',
        accessor: 'usingService',
        formatter: (value) => (Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'),
      },
      {
        header: '이름',
        accessor: 'name',
      },
      {
        header: '프로필',
        accessor: 'profileImage',
        formatter: (value, row) => (
          <ProfileWrapper>
            <ProfileHeader $imageUrl={row.profileImage || null} />
          </ProfileWrapper>
        ),
      },
      { 
        header: '아이디', 
        accessor: '_id',
        formatter: (value) => value || '-'
      },
      { 
        header: '이메일', 
        accessor: 'email',
        formatter: (value) => value || '-'
      },
      { 
        header: '국가', 
        accessor: 'nation',
        formatter: (value) => value || '-' 
      },
      { 
        header: '전화번호', 
        accessor: 'cellphone',
        formatter: (value) => value || '-' 
      },
      { 
        header: '비고', 
        accessor: 'memo',
        formatter: (value) => value || '-' 
      },
    ],
    []
  );

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 10000 }}
      ></ToastContainer>
      <CmsResponsiveContainer<User>
        ref={listRef}
        title="고객 회원관리"
        columns={columns}
        fetchData={fetchData}
        enableDateFilter={true}
        searchPlaceholder="이름, 이메일, 아이디 검색"
        onRowClick={handleRowClick}
        themeMode="light"
        enableCompanySearch={true}
        onCompanySelect={handleCompanySelect}
        renderMiddleContent={() => (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {selectedCompanyName && (
              <div style={{ color: '#666', fontSize: '14px' }}>
                선택된 고객사: {selectedCompanyName}
              </div>
            )}
          </div>
        )}
      />

<CmsPopup
      title="회원 정보 수정"
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
            <SaveButton onClick={handleSave}>저장</SaveButton>
            <CancelButton onClick={closePopup}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >
      <FormContainer>
        {/* 사용자 정보 섹션 */}
        <Title>사용자 정보</Title>
        
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
                <span>사용 서비스: {selectedUser.usingService.join(', ')}</span>
              </DetailItem>
            )}
          </UserDetails>
        </UserInfoSection>

        <Title>연락처 정보</Title>

        <FormSection>
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
      </FormContainer>
    </CmsPopup>
    </>
  );
};

export default UserMngPage;