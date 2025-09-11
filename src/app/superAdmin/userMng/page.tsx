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
import { adminCreate } from '@/lib/api/admin';
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
  adminId: string;
  name: string;
  email: string;
  cellphone: string;
  lastLoginTime: string | null;
  createdTime: string | null;
  emailYn: 'Y' | 'N';
  smsYn: 'Y' | 'N';
  profileImageUrl?: string;
};

const PopupFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
  color: ${AppColors.onPrimary};
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
  gap: 16px;
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
      setUserId(initial?.adminId ?? '');
      setPassword('');
      setName(initial?.name ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      setEmailYn(initial?.emailYn ?? 'Y');
      setSmsYn(initial?.smsYn ?? 'Y');
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
        description,
        email,
        emailYn,
        smsYn,
      });

      devLog('사용자 등록 응답', response);

      if (response?.[0]?.message === 'success') {
        toast.success('사용자가 성공적으로 등록되었습니다.');
        setIsPopupOpen(false);
        listRef.current?.refetch();
      } else {
        const errorMessage =
          response?.[0]?.error?.customMessage || response?.[0]?.message || '사용자 등록에 실패했습니다.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.customMessage || error?.message || '사용자 등록에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<User>> => {
      const raw = await adminGetList({ keyword: params.keyword ?? '' });
      const wrapper = raw?.[0];
      const data = wrapper?.data ?? [];
      const totalItems = wrapper?.metadata?.totalCnt ?? data.length;
      const allItems = wrapper?.metadata?.allCnt ?? totalItems;
      return { data, totalItems, allItems };
    },
    []
  );

  const handleDropdownChange = useCallback(
    (adminId: string, type: 'emailYn' | 'smsYn', newValue: 'Y' | 'N') => {
      console.log(`Changed ${type} for ${adminId} to ${newValue}`);
    },
    []
  );

  const columns: ColumnDefinition<User>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no' },
      {
        header: '가입일',
        accessor: 'createdTime',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      {
        header: '최근접속',
        accessor: 'lastLoginTime',
        sortable: true,
        formatter: (value) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        header: '프로필',
        accessor: 'profile',
        formatter: (row) => (
          <ProfileWrapper>
            {/* <ProfileHeader $imageUrl={row.profileImageUrl} /> */}
          </ProfileWrapper>
        ),
      },
      {
        header: '이름',accessor: 'name',
      },
      { header: '아이디', accessor: 'adminId' },
      { header: '이메일', accessor: 'email' },
      { header: '전화번호', accessor: 'cellphone' },
      { header: '비고', accessor: 'description' },
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
        excelFileName="UserList"
        columns={columns}
        fetchData={() => fetchData({})}
        enableSearch={true}
        enableDateFilter={true}
        searchPlaceholder="이름, 이메일, 아이디 검색"
        onRowClick={handleRowClick}
        themeMode="light"
      />

<CmsPopup
      title="회원 정보 수정"
      isOpen={isPopupOpen}
      onClose={closePopup}
      bottomFloating={
        <PopupFooter>
        <CancelButton onClick={closePopup}>닫기</CancelButton>
        
        <ConfirmButton
          title="회원 정보를 저장하시겠습니까?"
          content={
            <>
              입력하신 내용으로 회원 정보를 저장합니다.<br />
              저장 후에는 이전 정보로 되돌릴 수 없습니다.
            </>
          }          
          onConfirm={handleSave} // 확인 눌렀을 때만 handleSave 실행
        >
        </ConfirmButton>
      </PopupFooter>
      }
    >
      {/* 팝업 내용 시작 */}
      <UserInfoSection>
        <ProfileImage src={selectedUser?.profileImageUrl || "/default-profile.png"} alt="Profile" />
        <UserDetails>
          <DetailItem>
            <DetailIcon><PersonIcon /></DetailIcon>
            <NameText>{selectedUser?.name} (KRW)</NameText>
          </DetailItem>
          <DetailItem>
            <DetailIcon><BadgeIcon /></DetailIcon>
            <span>{selectedUser?.adminId}</span>
          </DetailItem>
          <DetailItem>
            <DetailIcon><PhoneIcon /></DetailIcon>
            <span>{selectedUser?.cellphone}</span>
          </DetailItem>
          <DetailItem>
            <DetailIcon><EmailIcon /></DetailIcon>
            <span>{selectedUser?.email}</span>
          </DetailItem>
        </UserDetails>
      </UserInfoSection>

      <FormSection>
        <TextField
          radius="0"
          value={email}
          label="회사메일"
          $labelPosition="vertical"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 형식으로 입력하세요"
          errorMessage={emailError ?? undefined}
        />
        <TextField
          radius="0"
          value={cellphone}
          label="전화번호"
          $labelPosition="vertical"
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d*$/.test(input)) {
              setCellphone(input);
            }
          }}
          placeholder="- 제외하고 입력하세요"
          maxLength={11}
          errorMessage={cellphoneError ?? undefined}
        />
        <MemoField
          radius="0"
          multiline
          minLines={5} // 이미지에 맞춰 minLines 조정
          height="150px"
          value={description}
          label="메모"
          $labelPosition="horizontal"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="메모를 입력하세요"
        />
      </FormSection>
    </CmsPopup>
    </>
  );
};

export default UserMngPage;