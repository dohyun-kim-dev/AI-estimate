'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react'; // useRef 추가

import GenericListUI, {
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import { adminGetList } from '@/lib/api/admin/adminApi';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { THEME_COLORS } from '@/styles/theme_colors';
import ActionButton from '@/components/ActionButton';
import { Validators } from '@/lib/utils/validators';
import { toast, ToastContainer } from 'react-toastify';
import { adminCreate,adminUpdate } from '@/lib/api/admin';
import { AdminUpdateParams } from '@/lib/api/admin/adminApi.types';
import { devLog } from '@/lib/utils/devLogger';
import PasswordPopup from './PasswordPopup';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import AdminFormPopup from './AdminFormPopup';

// API 응답 타입 정의
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  metadata: {
    allCnt: number;
    totalCnt: number;
  };
  error: {
    statusCode: number;
    message: string;
    customMessage?: string;
  } | null;
}

type AdminUser = {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  cellphone: string;
  createAt: string;
  memo?: string;
  emailYn?: 'Y' | 'N';
  smsYn?: 'Y' | 'N';
  description?: string;
};

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

const AdminMngPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<Partial<AdminUser> | null>(
    null
  );

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [emailYn, setEmailYn] = useState<'Y' | 'N'>('Y');
  const [smsYn, setSmsYn] = useState<'Y' | 'N'>('Y');
  const [description, setDescription] = useState('');

  const [idError, setIdError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [confirmPwdError, setConfirmPwdError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cellphoneError, setCellphoneError] = useState<string | null>(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPwdChangeOpen, setIsPwdChangeOpen] = useState(false);


  const listRef = useRef<{ refetch: () => void }>(null);

  const clearFormErrors = useCallback(() => {
    setIdError(null);
    setPwdError(null);
    setNameError(null);
    setEmailError(null);
    setCellphoneError(null);
  }, []);

  const resetForm = useCallback(
    (initial?: Partial<AdminUser>) => {
      setSelectedUser(initial ?? null);
      setUserId(initial?.adminId ?? '');
      setPassword('');
      setName(initial?.name ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      setEmailYn(initial?.emailYn ?? 'Y');
      setSmsYn(initial?.smsYn ?? 'Y');
      setDescription(initial?.description ?? '');
      clearFormErrors();
    },
    [clearFormErrors]
  );

  const handleHeaderButtonClick = () => {
    resetForm(); // 신규 등록
    setIsPopupOpen(true);
  };

  const handleRowClick = (item: AdminUser) => {
    resetForm(item); // 수정
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSave = async () => {
    let valid = true;
  
    // 아이디 검증
    if (!Validators.required(userId) || !Validators.id(userId)) {
      setIdError('아이디는 영문자와 숫자를 포함한 6~20자여야 합니다.');
      valid = false;
    } else setIdError(null);
  
    // 신규 등록 시 비밀번호 검증
    if (!selectedUser) {
      if (!Validators.password(password)) {
        setPwdError('비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.');
        valid = false;
      } else setPwdError(null);

      if (password !== confirmPassword) {
        setConfirmPwdError('비밀번호가 일치하지 않습니다.');
        valid = false;
      } else setConfirmPwdError(null);
    }
  
    // 이름 검증
    if (!Validators.required(name)) {
      setNameError('이름을 입력해주세요.');
      valid = false;
    } else setNameError(null);
  
    // 이메일 검증
    if (!Validators.email(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      valid = false;
    } else setEmailError(null);
  
    // 연락처 검증
    if (!Validators.phone(cellphone)) {
      setCellphoneError('연락처는 숫자 11자리여야 합니다.');
      valid = false;
    } else setCellphoneError(null);
  
    if (!valid) return;
  
    try {
      if (selectedUser) {
        // 수정 모드
        const updatePayload: AdminUpdateParams = {
          _id: selectedUser._id || '',
          targetAdminId: userId,
          name,
          cellphone,
          description,
          email,
          emailYn,
          smsYn,
          // companyCode는 슈퍼 관리자이므로 전달하지 않음
        };
  
        const response = await adminUpdate(updatePayload);
        
        console.log('adminUpdate response:', response);
        
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;
        
        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          toast.success('관리자 정보가 수정되었습니다.');
          setIsPopupOpen(false);
          
          // 리스트 새로고침
          setTimeout(() => {
            listRef.current?.refetch();
          }, 100);
        } else {
          const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '수정에 실패했습니다.';
          toast.error(errorMessage);
        }
      } else {
        // 신규 등록 모드
        const createPayload = {
          adminId: userId,
          password,
          name,
          cellphone,
          memo: description, // description을 memo로 매핑
          email,
          // companyCode는 통합관리자 생성이므로 제외
        };
  
        console.log('Creating admin with payload:', createPayload);
        const response = await adminCreate(createPayload);
        
        console.log('Create response:', response);
        
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;
        
        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          toast.success('관리자가 성공적으로 등록되었습니다.');
          setIsPopupOpen(false);
          
          // 리스트 새로고침
          setTimeout(() => {
            listRef.current?.refetch();
          }, 100);
        } else {
          const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '등록에 실패했습니다.';
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      const err = error as Error | { customMessage?: string };
      const errorMessage = 'customMessage' in err 
        ? err.customMessage 
        : err instanceof Error 
          ? err.message 
          : '처리에 실패했습니다.';
      toast.error(errorMessage);
    }
  };
  
  

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<AdminUser>> => {
      try {
        const fromDate = '2000-01-01';
        const toDate = dayjs().format('YYYY-MM-DD');

        const response = await adminGetList({ 
          isRoot: true, // 슈퍼 관리자 조회
          keyword: params.keyword || '',
          fromDate: fromDate, 
          toDate: toDate, 
        });

        console.log('response', response);
        
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        console.log('actualResponse', actualResponse);
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;
        console.log('apiResponse', apiResponse);
        
        if (apiResponse && apiResponse.message === 'success') {
          // API 응답 데이터를 AdminUser 타입에 맞게 매핑
          const mappedData = (apiResponse.data || []).map((item: any) => ({
            _id: item._id,
            adminId: item.adminId,
            name: item.name,
            email: item.email,
            cellphone: item.cellphone,
            createAt: item.createAt,
            memo: item.memo,
            emailYn: item.emailYn,
            smsYn: item.smsYn,
            description: item.memo, // memo를 description으로 매핑
          }));

          console.log('Mapped data:', mappedData);

          return {
            data: mappedData,
            totalItems: apiResponse.metadata?.totalCnt || 0,
            allItems: apiResponse.metadata?.allCnt || 0
          } as FetchResult<AdminUser>;
        } else {
          console.error('API Error:', apiResponse);
          return {
            data: [],
            totalItems: 0,
            allItems: 0
          };
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        return {
          data: [],
          totalItems: 0,
          allItems: 0
        };
      }
    },
    []
  );

  const handleDropdownChange = useCallback(
    async (adminId: string, type: 'emailYn' | 'smsYn', newValue: 'Y' | 'N') => {
      try {

        console.log('handleDropdownChange', adminId, type, newValue);

        const updateParams: AdminUpdateParams = {
          _id: adminId, // adminId를 _id로 사용 (API에서는 targetAdminId를 URL에 사용)
          targetAdminId: adminId,
          [type]: newValue,
          // companyCode는 슈퍼 관리자이므로 전달하지 않음
        };

        const response = await adminUpdate(updateParams);

        console.log('adminUpdate response:', response);
        
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;
  
        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          toast.success(`${type === 'emailYn' ? '메일' : 'SMS'} 수신 설정이 변경되었습니다.`);
          listRef.current?.refetch();
        } else {
          const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '변경에 실패했습니다.';
          toast.error(errorMessage);
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err?.message || '변경에 실패했습니다.');
      }
    },
    []
  );
  

  const columns: ColumnDefinition<AdminUser>[] = useMemo(
    () => [
      {
        header: 'No',
        accessor: '_id',
        formatter: (value, item, index) => index + 1,
      },
      {
        header: '가입일',
        accessor: 'createAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      {
        header: '최근 접속',
        accessor: 'lastLoginAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      { header: '이름', accessor: 'name' },
      { header: '아이디', accessor: 'adminId' },
      { header: '이메일', accessor: 'email' },
      { header: '전화번호', accessor: 'cellphone' },
      { 
        header: '비고', 
        accessor: 'memo',
        formatter: (value) => value || '-',
      },
    ],
    [handleDropdownChange]
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

<CmsResponsiveContainer<AdminUser>
  title="통합 관리자 관리"
  data={[]} // 초기값, fetchData가 있으면 무시됨
  columns={columns}
  fetchData={async () => {
    const result = await fetchData({});
    return {
      data: result.data,
      totalItems: result.totalItems,
      allItems: result.allItems || result.totalItems // allItems가 undefined면 totalItems 사용
    };
  }}
  onRowClick={handleRowClick}
  onAdd={handleHeaderButtonClick} // "추가" 버튼 클릭시 동작
  addButtonLabel='관리자 등록'
  themeMode="light"
  compactFieldCount={3} // 모바일 compact 모드에서 보여줄 필드 수
  defaultViewMode="detail" // 모바일 기본 보기 모드
  enableDateFilter={false}
/>

<AdminFormPopup
  isOpen={isPopupOpen}
  onClose={closePopup}
  onSave={handleSave}
  onPwdChangeClick={() => setIsPwdChangeOpen(true)}
  onDeleteClick={() => toast.info('삭제 기능은 추후 구현 예정입니다.')}
  selectedUser={selectedUser}
  userId={userId}
  setUserId={setUserId}
  password={password}
  setPassword={setPassword}
  confirmPassword={confirmPassword}
  setConfirmPassword={setConfirmPassword}
  name={name}
  setName={setName}
  email={email}
  setEmail={setEmail}
  cellphone={cellphone}
  setCellphone={setCellphone}
  emailYn={emailYn}
  setEmailYn={setEmailYn}
  smsYn={smsYn}
  setSmsYn={setSmsYn}
  description={description}
  setDescription={setDescription}
  idError={idError}
  pwdError={pwdError}
  confirmPwdError={confirmPwdError}
  nameError={nameError}
  emailError={emailError}
  cellphoneError={cellphoneError}
/>

<PasswordPopup
  adminId={userId}
  isOpen={isPwdChangeOpen}
  onClose={() => setIsPwdChangeOpen(false)}
/>


    </>
  );
};

export default AdminMngPage;
