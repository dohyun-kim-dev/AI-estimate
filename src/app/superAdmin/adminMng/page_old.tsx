'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react'; // useRef 추가
import { useThemeStore } from '@store/themeStore';
import { ThemeMode } from '@/styles/theme_colors';

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
import { adminCreate,adminUpdate,adminDelete } from '@/lib/api/admin';
import { AdminUpdateParams } from '@/lib/api/admin/adminApi.types';
import { devLog } from '@/lib/utils/devLogger';
import PasswordPopup from './PasswordPopup';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import AdminFormPopup from './AdminFormPopup';


const PrimaryButton = styled(ActionButton)<{ $themeMode: ThemeMode }>`
  width: 110px;
  height: 40px;
  background: ${({ $themeMode }) =>
    $themeMode === 'light'
      ? THEME_COLORS.light.primary
      : THEME_COLORS.dark.buttonText};
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.primary};
  border: none;
`;

  const [selectedUser, setSelectedUser] = useState<Partial<AdminUser> | null>(
    null
  );
  
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');

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

  const genericListRef = useRef<{ refetch: () => void }>(null); // 통합관리자와 동일한 변수명 사용

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
    setConfirmPwdError(null); // confirmPwdError 추가
  }, []);

  const resetForm = useCallback(
    (initial?: Partial<AdminUser>) => {
      setSelectedUser(initial ?? null);
      setUserId(initial?.adminId ?? '');
      setPassword('');
      setConfirmPassword(''); // confirmPassword 추가
      setName(initial?.name ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      setEmailYn(initial?.emailYn ?? 'Y');
      setSmsYn(initial?.smsYn ?? 'Y');
      setDescription(initial?.description ?? '');
      if (initial?._id) {
        setSelectedUser({ ...initial, _id: initial._id });
      }
      clearFormErrors();
    },
    [clearFormErrors]
  );
  const handleHeaderButtonClick = () => {
    resetForm();
    setIsPopupOpen(true);
  };

  const handleRowClick = (item: AdminUser) => {
    resetForm(item);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSave = async () => {
    let valid = true;

    // 아이디 유효성 검사
    if (!Validators.required(userId) || !Validators.id(userId)) {
      setIdError('아이디는 영문자와 숫자를 포함한 6~20자여야 합니다.');
      valid = false;
    } else {
      setIdError(null);
    }
    
    // 신규 등록 시 비밀번호 유효성 검사
    if (!selectedUser) {
      if (!Validators.password(password)) {
        setPwdError('비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.');
        valid = false;
      } else {
        setPwdError(null);
      }
      if (password !== confirmPassword) {
        setConfirmPwdError('비밀번호가 일치하지 않습니다.');
        valid = false;
      } else {
        setConfirmPwdError(null);
      }
    }

    // 이름 유효성 검사
    if (!Validators.required(name)) {
      setNameError('이름을 입력해주세요.');
      valid = false;
    } else {
      setNameError(null);
    }

    // 이메일 유효성 검사
    if (!Validators.email(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      valid = false;
    } else {
      setEmailError(null);
    }

    // 연락처 유효성 검사
    if (!Validators.phone(cellphone)) {
      setCellphoneError('연락처는 숫자 11자리여야 합니다.');
      valid = false;
    } else {
      setCellphoneError(null);
    }

    if (!valid) return;

    try {
      if (selectedUser) {
          // 수정 모드
          const updatePayload = {
              targetAdminId: selectedUser._id, // _id를 targetAdminId로 전달
              name,
              cellphone,
              description,
              email,
              emailYn,
              smsYn,
          };
          
          const response = await adminUpdate(updatePayload) as unknown as ApiResponse<AdminUser>[];
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse && (apiResponse.statusCode === 200 || apiResponse.statusCode === '200') && apiResponse.message === 'success') {
              toast.success('관리자 정보가 수정되었습니다.');
              listRef.current?.refetch();
              setIsPopupOpen(false);
          } else {
              const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '수정에 실패했습니다.';
              toast.error(errorMessage);
          }
      } else {
          // 신규 등록 로직은 그대로 유지
          const createPayload = {
              adminId: userId,
              password,
              name,
              cellphone,
              memo: description,
              email,
              emailYn,
              smsYn,
              companyCode: selectedCompanyCode
          };
          const response = await adminCreate(createPayload) as unknown as ApiResponse<AdminUser>;
          
          if (response.statusCode === 200 && response.message === 'success') {
              toast.success('관리자가 성공적으로 등록되었습니다.');
              setIsPopupOpen(false);
              listRef.current?.refetch();
          } else {
              const errorMessage = response?.error?.customMessage || response?.message || '등록에 실패했습니다.';
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
        const fromDate = params.fromDate || '2000-01-01';
        const toDate = params.toDate || dayjs().format('YYYY-MM-DD');

        const apiParams: any = {
          isRoot: false,
          keyword: params.keyword || '',
          fromDate: fromDate,
          toDate: toDate,
        };

        // companyCode가 있으면 추가 (타입 확장)
        if ((params as any).companyCode) {
          apiParams.companyCode = (params as any).companyCode;
        }

        const response = await adminGetList(apiParams) as unknown as ApiResponse<AdminUser>[];

        const apiResponse = Array.isArray(response) && response.length > 0 ? response[0] : response;

        if (apiResponse && (apiResponse.statusCode === 200 || apiResponse.statusCode === '200') && apiResponse.message === 'success') {
          const mappedData = (apiResponse.data || []).map((item: any, index: number) => ({
            ...item,
            no: index + 1,
            lastLoginAt: item.lastLoginAt || null,
            description: item.memo || '-',
          }));
          return {
            data: mappedData,
            totalItems: parseInt(apiResponse.metadata?.totalCnt) || 0,
            allItems: parseInt(apiResponse.metadata?.allCnt) || 0,
          };
        } else {
          console.error('API Error:', apiResponse);
          return { data: [], totalItems: 0, allItems: 0 };
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        return { data: [], totalItems: 0, allItems: 0 };
      }
    },
    []
  );

  const handleDropdownChange = useCallback(
    async (adminId: string, type: 'emailYn' | 'smsYn', newValue: 'Y' | 'N') => {
      try {
        const response = await adminUpdate({
          targetAdminId: adminId,
          [type]: newValue,
        } as any) as unknown as ApiResponse<AdminUser>;

        if (response?.statusCode === 200 && response?.message === 'success') {
          toast.success(`${type === 'emailYn' ? '메일' : 'SMS'} 수신 설정이 변경되었습니다.`);
          listRef.current?.refetch();
        } else {
          const errorMessage = response?.error?.customMessage || response?.message || '변경에 실패했습니다.';
          toast.error(errorMessage);
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err?.message || '변경에 실패했습니다.');
      }
    },
    []
  );

  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    setSelectedCompanyCode(company.id);
  }, []);

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
        header: '최근접속',
        accessor: 'lastLoginAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      { header: '이름', accessor: 'name' },
      { header: '고객사명', accessor: 'companyCode' },
      { header: '아이디', accessor: 'adminId' },
      { header: '이메일', accessor: 'email' },
      { header: '전화번호', accessor: 'cellphone' },
      {
        header: 'SMS 수신',
        accessor: 'smsYn',
        noPopup: true,
        formatter: (_value, row) => (
          <Switch
            checked={row.smsYn === 'Y'}
            onToggle={() =>
              handleDropdownChange(
                row.adminId,
                'smsYn',
                row.smsYn === 'Y' ? 'N' : 'Y'
              )
            }
          />
        ),
      },
      {
        header: '메일 수신',
        accessor: 'emailYn',
        noPopup: true,
        formatter: (_value, row) => (
          <Switch
            checked={row.emailYn === 'Y'}
            onToggle={() =>
              handleDropdownChange(
                row.adminId,
                'emailYn',
                row.emailYn === 'Y' ? 'N' : 'Y'
              )
            }
          />
        ),
      },
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
        title="고객사 관리자 관리"
        data={[]}
        columns={columns}
        fetchData={() => fetchData({})}
        onRowClick={handleRowClick}
        onAdd={handleHeaderButtonClick}
        addButtonLabel='관리자 등록'
        themeMode="light"
        compactFieldCount={3}
        defaultViewMode="detail"
        enableDateFilter={true}
        enableCompanySearch={true}
        onCompanySelect={handleCompanySelect}
        ref={listRef}
      />
      <CmsPopup
        title={selectedUser ? "관리자 수정" : "관리자 등록"}
        isOpen={isPopupOpen}
        onClose={closePopup}
        isWide={false}
        showRequiredMark={true}
        bottomFloating={
          <PopupFooter>
            {selectedUser ? (
              <CancelButton
                style={{ backgroundColor: '#eeeeee', color: '#333333' }}
                onClick={() => toast.info('삭제 기능은 추후 구현 예정입니다.')}
              >
                삭제
              </CancelButton>
            ) : (
              <div />
            )}
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
            readOnly={!!selectedUser}
          />
          {!selectedUser && (
            <>
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
            </>
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
              if (/^\d*$/.test(input) && input.length <= 11) {
                setCellphone(input);
              }
            }}
            placeholder="- 제외 하고 입력하세요"
            errorMessage={cellphoneError ?? undefined}
          />
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