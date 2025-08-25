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
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import SelectionField from '@/components/selectionField';
import { AppColors } from '@/styles/colors';
import { Validators } from '@/lib/utils/validators';
import { toast, ToastContainer } from 'react-toastify';
import { adminCreate,adminUpdate } from '@/lib/api/admin';
import Switch from '@/components/Switch';
import { SwitchInput } from '@/components/SwitchInput';
import { devLog } from '@/lib/utils/devLogger';
import PasswordPopup from './PasswordPopup';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  /* margin: 12px 0; */
`;



const SwitchLabel = styled.label`
  font-size: 16px;
  /* font-weight: 500; */
  margin-left: 10px;
  margin-right: 33px;
  color: white;
`;

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
  no: number;
  emailYn?: 'Y' | 'N';
  smsYn?: 'Y' | 'N';
  description?: string;
};

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between; /* 좌우로 분리 */
  align-items: center;
  width: 100%;
  gap: 12px;
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
`;

const SaveButton = styled(FooterButton)`
  background-color: ${AppColors.primary};
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
`;


const PwdChangeButton = styled(FooterButton)`
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
  height: 48px;
  width: 160px !important; /* !important를 추가하여 강제로 덮어쓰기 */
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
  
    if (!Validators.required(userId) || !Validators.id(userId)) {
      setIdError('아이디는 영문자와 숫자를 포함한 6~20자여야 합니다.');
      valid = false;
    } else setIdError(null);
  
    if (!selectedUser && !Validators.password(password)) {
      setPwdError('비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.');
      valid = false;
    } else setPwdError(null);

    if (!selectedUser && password !== confirmPassword) {
      setConfirmPwdError('비밀번호가 일치하지 않습니다.');
      valid = false;
    } else setConfirmPwdError(null);
  
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
      if (selectedUser) {
        const updatePayload = {
          targetAdminId: userId,
          name,
          cellphone,
          description,
          email,
          emailYn,
          smsYn,
        };
  
        const response = await adminUpdate(updatePayload) as ApiResponse<AdminUser>;
        if (response.statusCode === 200 && response.message === 'success') {
          toast.success('관리자 정보가 수정되었습니다.');
          setIsPopupOpen(false);
          listRef.current?.refetch();
        } else {
          const errorMessage = response.error?.customMessage || response.message || '수정에 실패했습니다.';
          toast.error(errorMessage);
        }
      } else {
        const createPayload = {
          adminId: userId,
          password,
          name,
          cellphone,
          description,
          email,
          emailYn,
          smsYn,
        };
  
        const response = await adminCreate(createPayload) as ApiResponse<AdminUser>;
        if (response.statusCode === 200 && response.message === 'success') {
          toast.success('관리자가 성공적으로 등록되었습니다.');
          setIsPopupOpen(false);
          listRef.current?.refetch();
        } else {
          const errorMessage = response.error?.customMessage || response.message || '등록에 실패했습니다.';
          toast.error(errorMessage);
        }
      }
    } catch (error) {
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
      const response = await adminGetList({ 
        keyword: params.keyword || '',
        fromDate: params.fromDate,
        toDate: params.toDate
      }) as ApiResponse<AdminUser>;

      return {
        data: response.data || [],
        totalItems: response.metadata.totalCnt,
        allItems: response.metadata.allCnt
      };
    },
    []
  );

  const handleDropdownChange = useCallback(
    async (adminId: string, type: 'emailYn' | 'smsYn', newValue: 'Y' | 'N') => {
      try {

        console.log('handleDropdownChange', adminId, type, newValue);

        const response = await adminUpdate({
          targetAdminId: adminId,
          [type]: newValue,
        }) as ApiResponse<AdminUser>;
  
        if (response.statusCode === 200 && response.message === 'success') {
          toast.success(`${type === 'emailYn' ? '메일' : 'SMS'} 수신 설정이 변경되었습니다.`);
          listRef.current?.refetch();
        } else {
          const errorMessage = response.error?.customMessage || response.message || '변경에 실패했습니다.';
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
      { header: 'No', accessor: 'no' },
      {
        header: '가입일',
        accessor: 'createAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      {
        header: '최근 접속',
        accessor: 'lastLoginTime',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      { header: '이름', accessor: 'name' },
      { header: '아이디', accessor: 'adminId' },
      { header: '이메일', accessor: 'email' },
      { header: '전화번호', accessor: 'cellphone' },
      { header: '비고', accessor: 'description' },
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
  title="통합 관리자"
  data={[]} // 초기값, fetchData가 있으면 무시됨
  columns={columns}
  fetchData={() => fetchData({})} // Promise<{ data, totalItems, allItems }>
  onRowClick={handleRowClick}
  onAdd={handleHeaderButtonClick} // "추가" 버튼 클릭시 동작
  addButtonLabel='관리자 등록'
  themeMode="light"
  compactFieldCount={3} // 모바일 compact 모드에서 보여줄 필드 수
  defaultViewMode="detail" // 모바일 기본 보기 모드
  enableDateFilter={false}
/>
<CmsPopup
  title="관리자등록"
  isOpen={isPopupOpen}
  onClose={closePopup}
  isWide={false}
  showRequiredMark={true}
  bottomFloating={
<PopupFooter>
  {/* 왼쪽 영역: 삭제 버튼 */}
  {selectedUser ? (
    <CancelButton
      style={{ backgroundColor: 'eeeeee', color: '#333333' }}
      onClick={() => toast.info('삭제 기능은 추후 구현 예정입니다.')}
    >
      삭제
    </CancelButton>
  ) : (
    <div /> // 빈 영역 유지
  )}

  {/* 오른쪽 영역: 저장/닫기 */}
  <div style={{ display: 'flex', gap: '12px' }}>
    <SaveButton onClick={handleSave}>저장</SaveButton>
    <CancelButton onClick={closePopup}>닫기</CancelButton>
  </div>
</PopupFooter>

  }
  
>
  <FormContainer>
  <TextField
  radius="0"
  value={userId}
  label="* 아이디"
  autoComplete="off"
  $labelPosition="horizontal"
  labelColor="white"
  onChange={(e) => setUserId(e.target.value)}
  placeholder="영문자와 숫자를 포함한 6~20자"
  errorMessage={idError ?? undefined}
  readOnly={!!selectedUser} // ✅ 조건부 readOnly
/>

  {/* 신규 등록 시: 아이디 아래에 비밀번호 입력 */}
  {!selectedUser && (
    <TextField
      radius="0"
      value={password}
      showSuffixIcon={true}
      label="* 비밀번호"
      autoComplete="new-password"
      $labelPosition="horizontal"
      labelColor="white"
      onChange={(e) => setPassword(e.target.value)}
      placeholder="영문 + 숫자 + 특수문자 1개 포함 8자리 이상"
      isPasswordField={true}
      errorMessage={pwdError ?? undefined}
    />
  )}
  {/* // 비밀번호 확인 필드 */}
  {!selectedUser && (
    <TextField
      radius="0"
      value={confirmPassword}
      showSuffixIcon={true}
      label="* 비밀번호 확인"
      autoComplete="new-password"
      $labelPosition="horizontal"
      labelColor="white"
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="영문 + 숫자 + 특수문자 1개 포함 8자리 이상"
      isPasswordField={true}
      errorMessage={confirmPwdError ?? undefined}
    />
  )}


    <TextField
      radius="0"
      value={name}
      label="* 이름"
      $labelPosition="horizontal"
      labelColor="white"
      onChange={(e) => setName(e.target.value)}
      placeholder="이름을 입력하세요"
      errorMessage={nameError ?? undefined}
    />
    <TextField
      radius="0"
      value={email}
      label="* 이메일"
      $labelPosition="horizontal"
      labelColor="white"
      onChange={(e) => setEmail(e.target.value)}
      placeholder="이메일 형식으로 입력하세요"
      errorMessage={emailError ?? undefined}
    />
    <TextField
      radius="0"
      value={cellphone}
      label="* 연락처"
      $labelPosition="horizontal"
      labelColor="white"
      onChange={(e) => {
        const input = e.target.value;
        if (/^\d*$/.test(input)) {
          setCellphone(input);
        }
      }}
      placeholder="- 제외 하고 입력하세요"
      errorMessage={cellphoneError ?? undefined}
    />


  {/* 수정 모드일 때: 이메일 수신 Switch 위에 비밀번호 변경 버튼 */}
  {selectedUser && (
    <SwitchRow>
      <SwitchLabel>비밀번호 변경</SwitchLabel>
      <PwdChangeButton
  style={{ width: 'auto', padding: '0 16px', fontSize: '14px' }}
  onClick={() => setIsPwdChangeOpen(true)}
>
  비밀번호 변경
</PwdChangeButton>

    </SwitchRow>
  )}


    <SwitchInput
      label="이메일 수신"
      value={emailYn}
      onChange={setEmailYn}
      $labelPosition="horizontal"
      labelColor="white"
    />

    <SwitchInput
      label="SMS 수신"
      value={smsYn}
      onChange={setSmsYn}
      $labelPosition="horizontal"
      labelColor="white"
    />

    <TextField
      radius="0"
      multiline
      minLines={4}
      maxLines={10}
      height="200px"
      value={description}
      label="비고"
      $labelPosition="horizontal"
      labelColor="white"
      onChange={(e) => setDescription(e.target.value)}
      placeholder="비고를 입력하세요"
    />
  </FormContainer>
</CmsPopup>

<PasswordPopup
  adminId={userId}
  isOpen={isPwdChangeOpen}
  onClose={() => setIsPwdChangeOpen(false)}
/>


    </>
  );
};

export default AdminMngPage;
