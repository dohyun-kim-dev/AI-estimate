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
import { useToast } from '@/components/common/ToastProvider'
import { adminCreate, adminUpdate, adminDelete } from '@/lib/api/admin';
import { AdminUpdateParams } from '@/lib/api/admin/adminApi.types';
import { devLog } from '@/lib/utils/devLogger';
import PasswordPopup from './PasswordPopup';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import AdminFormPopup from './AdminFormPopup';
import Switch from '@/components/Switch';
import 'dayjs/locale/ko';

dayjs.locale('ko');

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
  no: number;
  _id: string;
  adminId: string;
  name: string;
  email: string;
  cellphone: string;
  createAt: string;
  memo?: string;
  receiveEmail?: boolean;
  receiveAlimtalk?: boolean;
  description?: string;
  lastLoginAt?: string;
  companyCode?: string;
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

// 중복 아이디 에러 메시지 처리 헬퍼 함수
const getDuplicateKeyErrorMessage = (errorMessage: string): string => {
  if (errorMessage.includes('E11000') && errorMessage.includes('duplicate key')) {
    return '중복된 아이디입니다.';
  }
  return errorMessage;
};

const AdminMngPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<Partial<AdminUser> | null>(null);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const { show: showToast } = useToast(); // 토스트 훅 추가

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [receiveEmail, setReceiveEmail] = useState<boolean>(true);
  const [receiveAlimtalk, setReceiveAlimtalk] = useState<boolean>(true);
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

  const clearFormErrors = useCallback(() => {
    setIdError(null);
    setPwdError(null);
    setNameError(null);
    setEmailError(null);
    setCellphoneError(null);
    setConfirmPwdError(null);
  }, []);

  const resetForm = useCallback(
    (initial?: Partial<AdminUser>) => {
      setSelectedUser(initial ?? null);
      setUserId(initial?.adminId ?? '');
      setPassword('');
      setConfirmPassword('');
      setName(initial?.name ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      setReceiveEmail(initial?.receiveEmail ?? false);
      setReceiveAlimtalk(initial?.receiveAlimtalk ?? false);
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
      setCellphoneError('숫자11자리와 연락처 형식을 준수해야 합니다.');
      valid = false;
    } else setCellphoneError(null);

    if (!valid) return;

    try {
      if (selectedUser) {
        // 수정 모드
        // 변경된 필드만 포함하는 payload 생성
        const updatePayload: AdminUpdateParams = {
          _id: selectedUser._id || '',
          targetAdminId: userId,
          companyCode: selectedCompanyCode || '', // 고객사 코드 추가
        };

        // 각 필드가 기존 값과 다른 경우에만 포함
        if (name !== selectedUser.name) {
          updatePayload.name = name;
        }
        if (cellphone !== selectedUser.cellphone) {
          updatePayload.cellphone = cellphone;
        }
        if (email !== selectedUser.email) {
          updatePayload.email = email;
        }
        if (description !== selectedUser.description) {
          updatePayload.description = description;
        }
        if (receiveEmail !== selectedUser.receiveEmail) {
          updatePayload.receiveEmail = receiveEmail;
        }
        if (receiveAlimtalk !== selectedUser.receiveAlimtalk) {
          updatePayload.receiveAlimtalk = receiveAlimtalk;
        }

        devLog('💾 [수정 요청 데이터 - 변경된 필드만]', {
          originalValues: {
            name: selectedUser.name,
            cellphone: selectedUser.cellphone,
            email: selectedUser.email,
            description: selectedUser.description,
            receiveEmail: selectedUser.receiveEmail,
            receiveAlimtalk: selectedUser.receiveAlimtalk,
          },
          newValues: {
            name,
            cellphone,
            email,
            description,
            receiveEmail,
            receiveAlimtalk,
          },
          payloadToSend: updatePayload
        });

        const response = await adminUpdate(updatePayload);

        devLog('adminUpdate response:', response);

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;

        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          showToast('관리자 정보가 수정되었습니다.','success');
          setIsPopupOpen(false);

          // 리스트 새로고침
          setTimeout(() => {
            genericListRef.current?.refetch();
          }, 100);
        } else {
          const errorMessage = getDuplicateKeyErrorMessage(
            apiResponse?.error?.customMessage || apiResponse?.message || '수정에 실패했습니다.'
          );
          showToast(errorMessage, 'error');
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
          receiveEmail: receiveEmail,
          receiveAlimtalk: receiveAlimtalk,
          companyCode: selectedCompanyCode, // 고객사 코드 추가
        };

        devLog('✨ [생성 요청 데이터]', {
          receiveEmail,
          receiveAlimtalk,
          createPayload
        });
        const response = await adminCreate(createPayload);

        devLog('Create response:', response);

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;

        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          showToast('관리자가 성공적으로 등록되었습니다.','success');
          setIsPopupOpen(false);

          // 리스트 새로고침
          setTimeout(() => {
            genericListRef.current?.refetch();
          }, 100);
        } else {
          const errorMessage = getDuplicateKeyErrorMessage(
            apiResponse?.error?.customMessage || apiResponse?.message || '등록에 실패했습니다.'
          );
          showToast(errorMessage, 'error');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      const err = error as Error | { customMessage?: string };
      let errorMessage = 'customMessage' in err
        ? err.customMessage
        : err instanceof Error
          ? err.message
          : '처리에 실패했습니다.';
      errorMessage = getDuplicateKeyErrorMessage(errorMessage || '처리에 실패했습니다.');
      showToast(errorMessage, 'error');
    }
  };

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<AdminUser>> => {
      try {
        const fromDate = '2000-01-01';
        const toDate = dayjs().format('YYYY-MM-DD');

        const response = await adminGetList({
          isRoot: false, // 고객사 관리자 조회
          keyword: params.keyword || '',
          fromDate: fromDate,
          toDate: toDate,
          companyCode: selectedCompanyCode || '', // 선택된 고객사 코드
        });

        devLog('response', response);

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        devLog('actualResponse', actualResponse);

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;
        devLog('apiResponse', apiResponse);

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
            receiveEmail: item.receiveEmail, // 올바른 필드명 사용
            receiveAlimtalk: item.receiveAlimtalk, // 올바른 필드명 사용
            description: item.memo, // memo를 description으로 매핑
            lastLoginAt: item.lastLoginAt,
            companyCode: item.companyCode,
            no: item.no, // 번호는 나중에 설정
          }));

          devLog('Mapped data:', mappedData);

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
    [selectedCompanyCode]
  );

  // 관리자 삭제 함수
  const adminDeleteClick = useCallback(
    async (_id: string) => {
      try {
        devLog('adminDelete 호출 - _id:', _id);
        const response = await adminDelete(_id);

        devLog('adminDelete response:', response);

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;

        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          showToast('관리자가 성공적으로 삭제되었습니다.','success');

          // 모달 닫기
          setIsPopupOpen(false);

          // 리스트 새로고침 (기존 키워드 유지)
          setTimeout(() => {
            genericListRef.current?.refetch();
          }, 100);

        } else {
          // 응답이 성공이 아닐 경우 오류 메시지를 표시
          const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '삭제에 실패했습니다.';
          showToast(errorMessage, 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        const err = error as Error | { customMessage?: string };
        const errorMessage = 'customMessage' in err
          ? err.customMessage
          : err instanceof Error
            ? err.message
            : '삭제에 실패했습니다.';
        showToast(errorMessage, 'error');
      }
    },
    [genericListRef]
  );

  const handleDropdownChange = useCallback(
    async (_id: string, type: 'receiveEmail' | 'receiveAlimtalk', newValue: boolean) => {
      try {
        devLog('handleDropdownChange', _id, type, newValue);

        const updateParams: AdminUpdateParams = {
          _id: _id,
          targetAdminId: _id,
          [type]: newValue, // 변경하려는 필드만 포함
          companyCode: selectedCompanyCode || '', // 고객사 코드 추가
        };

        const response = await adminUpdate(updateParams);

        devLog('adminUpdate response:', response);

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<AdminUser>;

        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          showToast(`${type === 'receiveEmail' ? '메일' : 'SMS'} 수신 설정이 변경되었습니다.`, 'success');
          // 성공 시 리스트 새로고침
          genericListRef.current?.refetch();
        } else {
          const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '변경에 실패했습니다.';
          showToast(errorMessage, 'error');
          // 실패 시 에러 발생시켜 롤백 처리
          throw new Error(errorMessage);
        }
      } catch (error) {
        const err = error as Error;
        showToast(err?.message || '변경에 실패했습니다.', 'error');
        // 에러를 다시 throw해서 optimistic UI 롤백 처리
        throw error;
      }
    },
    [selectedCompanyCode]
  );

  const handleCompanySelect = useCallback((company: { id: string; name: string }) => {
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    // 고객사 변경 시 리스트 새로고침
    setTimeout(() => {
      genericListRef.current?.refetch();
    }, 100);
  }, []);

  const columns: ColumnDefinition<AdminUser>[] = useMemo(
    () => [
      {
        header: 'No',
        accessor: 'no',
        width: 60,
        // formatter: (value, item, index) => index + 1,
      },
      {
        header: '가입일',
        accessor: 'createAt',
        width: 120,
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YY.MM.DD(ddd)') : '-'),
      },
      {
        header: '최근 접속',
        accessor: 'lastLoginAt',
        width: 120,
        formatter: (value) => (value ? dayjs(value).format('YY.MM.DD(ddd)') : '-'),
      },
      { header: '고객사명', accessor: 'companyCode', flex: 1 },
      { header: '이름', accessor: 'name', flex: 1 },
      { header: '이메일', accessor: 'email', flex: 1,
        allowWrap: true, },
      { header: '전화번호', accessor: 'cellphone', flex: 1 },
      { header: '아이디', accessor: 'adminId', flex: 1 },
      // {
      //   header: '알림톡 수신',
      //   accessor: 'receiveAlimtalk',
      //   noPopup: true,
      //   sortable: false,
      //   flex: 1,
      //   formatter: (_value, row) => (
      //     <Switch
      //       checked={Boolean(row.receiveAlimtalk)}
      //       onToggle={() => {
      //         const newValue = !Boolean(row.receiveAlimtalk);
      //         handleDropdownChange(row._id, 'receiveAlimtalk', newValue);
      //       }}
      //     />
      //   ),
      // },
      {
        header: '메일 수신',
        accessor: 'receiveEmail',
        noPopup: true,
        sortable: false,
        width: 120,
        flex: 1,
        formatter: (_value, row) => (
          <Switch
            checked={Boolean(row.receiveEmail)}
            onToggle={() => {
              const newValue = !Boolean(row.receiveEmail);
              handleDropdownChange(row._id, 'receiveEmail', newValue);
            }}
          />
        ),
      },
      {
        header: '비고',
        accessor: 'memo',
        flex: 1,
        formatter: (value) => value || '-',
      },
    ],
    [handleDropdownChange]
  );

  return (
    <>
      <CmsResponsiveContainer<AdminUser>
        ref={genericListRef}
        title="관리자 관리"
        data={[]} // 초기값, fetchData가 있으면 무시됨
        columns={columns}
        fetchData={fetchData}
        onRowClick={handleRowClick}
        themeMode="light"
        compactFieldCount={3} // 모바일 compact 모드에서 보여줄 필드 수
        defaultViewMode="detail" // 모바일 기본 보기 모드
        enableDateFilter={false}
        enableCompanySearch={false}
        onCompanySelect={handleCompanySelect}
        renderMiddleContent={() => (
          <div style={{ flex: 1, textAlign: 'end', fontWeight: 'bold' }}>
            <PrimaryButton $themeMode="light" onClick={handleHeaderButtonClick}>
              관리자 등록
            </PrimaryButton>
          </div>
        )}
      />

      <AdminFormPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        onSave={handleSave}
        onPwdChangeClick={() => {
          setIsPwdChangeOpen(true);
        }}
        onDeleteClick={adminDeleteClick}
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
        receiveEmail={receiveEmail}
        setReceiveEmail={setReceiveEmail}
        receiveAlimtalk={receiveAlimtalk}
        setReceiveAlimtalk={setReceiveAlimtalk}
        description={description}
        setDescription={setDescription}
        idError={idError}
        pwdError={pwdError}
        confirmPwdError={confirmPwdError}
        nameError={nameError}
        emailError={emailError}
        cellphoneError={cellphoneError}
        selectedCompanyCode={selectedCompanyCode}
        selectedCompanyName={selectedCompanyName}
        onCompanySelect={handleCompanySelect}
        isRoot={false}
      />

      <PasswordPopup
        selectedUser={selectedUser}
        isOpen={isPwdChangeOpen}
        onClose={() => setIsPwdChangeOpen(false)}
        onSuccess={() => genericListRef.current?.refetch()}
      />
    </>
  );
};

export default AdminMngPage;
