'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from 'react';
import { Person as PersonIcon, Badge as BadgeIcon, Phone as PhoneIcon, Email as EmailIcon, } from '@mui/icons-material';
import { adminGetList } from '@/lib/api/admin/adminApi';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { THEME_COLORS } from '@/styles/theme_colors';
import ActionButton from '@/components/ActionButton';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { AppColors } from '@/styles/colors';
import { Validators } from '@/lib/utils/validators';
import { toast, ToastContainer } from 'react-toastify';
import { adminCreate } from '@/lib/api/admin';
import { devLog } from '@/lib/utils/devLogger';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import ConfirmButton from '@/components/ConfirmButton';
const SwitchRow = styled.div `
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
`;
const SwitchLabel = styled.label `
  font-size: 16px;
  font-weight: 500;
  color: black;
`;
const ProfileWrapper = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
`;
const ProfileHeader = styled.div `
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
const PopupFooter = styled.div `
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;
const FooterButton = styled.button `
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
`;
const CancelButton = styled(FooterButton) `
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};
`;
const SaveButton = styled(FooterButton) `

  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
`;
const FormContainer = styled.div `
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 22px;
  justify-content: space-evenly;
`;
const RegisterButton = styled(ActionButton) `
  background: ${({ $themeMode }) => $themeMode === 'light'
    ? THEME_COLORS.light.primary
    : THEME_COLORS.dark.buttonText};
  color: ${({ $themeMode }) => $themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.primary};
  border: none;
  &:hover:not(:disabled) {
    background-color: ${({ $themeMode }) => $themeMode === 'light' ? '#e8e8e8' : '#424451'};
  }
`;
const UserInfoSection = styled.div `
  display: flex;
  align-items: flex-start;
  padding: 24px;
  background-color: #2C2E3C; // 이미지 배경색에 맞춰 조정
  border-radius: 8px;
  margin-bottom: 24px;
`;
const ProfileImage = styled.img `
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 100px;
`;
const UserDetails = styled.div `
  display: flex;
  flex-direction: column;
  color: white;
  font-size: 16px;
  flex-grow: 1;
`;
const DetailItem = styled.div `
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;
const DetailIcon = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #fff;
`;
const NameText = styled.div `
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 8px;
`;
const MemoField = styled(TextField) `
  .MuiInputBase-root {
    min-height: 150px;
    align-items: flex-start;
  }
`;
const FormSection = styled.div `
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const UserMngPage = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cellphone, setCellphone] = useState('');
    const [emailYn, setEmailYn] = useState('Y');
    const [smsYn, setSmsYn] = useState('Y');
    const [description, setDescription] = useState('');
    const [idError, setIdError] = useState(null);
    const [pwdError, setPwdError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [cellphoneError, setCellphoneError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const listRef = useRef(null);
    const clearFormErrors = useCallback(() => {
        setIdError(null);
        setPwdError(null);
        setNameError(null);
        setEmailError(null);
        setCellphoneError(null);
    }, []);
    const resetForm = useCallback((initial) => {
        setSelectedUser(initial ?? null);
        setUserId(initial?.adminId ?? '');
        setPassword('');
        setName(initial?.name ?? '');
        setEmail(initial?.email ?? '');
        setCellphone(initial?.cellphone ?? '');
        setEmailYn(initial?.emailYn ?? 'Y');
        setSmsYn(initial?.smsYn ?? 'Y');
        clearFormErrors();
    }, [clearFormErrors]);
    const handleHeaderButtonClick = () => {
        resetForm(); // 신규 등록
        setIsPopupOpen(true);
    };
    const handleRowClick = (item) => {
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
        }
        else
            setIdError(null);
        if (!Validators.password(password)) {
            setPwdError('비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.');
            valid = false;
        }
        else
            setPwdError(null);
        if (!Validators.required(name)) {
            setNameError('이름을 입력해주세요.');
            valid = false;
        }
        else
            setNameError(null);
        if (!Validators.email(email)) {
            setEmailError('올바른 이메일 형식이 아닙니다.');
            valid = false;
        }
        else
            setEmailError(null);
        if (!Validators.phone(cellphone)) {
            setCellphoneError('연락처는 숫자 11자리여야 합니다.');
            valid = false;
        }
        else
            setCellphoneError(null);
        if (!valid)
            return;
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
            }
            else {
                const errorMessage = response?.[0]?.error?.customMessage || response?.[0]?.message || '사용자 등록에 실패했습니다.';
                toast.error(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = error?.customMessage || error?.message || '사용자 등록에 실패했습니다.';
            toast.error(errorMessage);
        }
    };
    const fetchData = useCallback(async (params) => {
        const raw = await adminGetList({ keyword: params.keyword ?? '' });
        const wrapper = raw?.[0];
        const data = wrapper?.data ?? [];
        const totalItems = wrapper?.metadata?.totalCnt ?? data.length;
        const allItems = wrapper?.metadata?.allCnt ?? totalItems;
        return { data, totalItems, allItems };
    }, []);
    const handleDropdownChange = useCallback((adminId, type, newValue) => {
        console.log(`Changed ${type} for ${adminId} to ${newValue}`);
    }, []);
    const columns = useMemo(() => [
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
            formatter: (value) => value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
        },
        {
            header: '프로필',
            accessor: 'profile',
            formatter: (row) => (_jsx(ProfileWrapper, {})),
        },
        {
            header: '이름', accessor: 'name',
        },
        { header: '아이디', accessor: 'adminId' },
        { header: '이메일', accessor: 'email' },
        { header: '전화번호', accessor: 'cellphone' },
        { header: '비고', accessor: 'description' },
    ], []);
    return (_jsxs(_Fragment, { children: [_jsx(ToastContainer, { position: "top-center", autoClose: 3000, newestOnTop: false, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true, theme: "light", style: { zIndex: 10000 } }), _jsx(CmsResponsiveContainer, { ref: listRef, title: "\uACE0\uAC1D \uD68C\uC6D0\uAD00\uB9AC", excelFileName: "UserList", columns: columns, fetchData: () => fetchData({}), enableSearch: true, enableDateFilter: true, searchPlaceholder: "\uC774\uB984, \uC774\uBA54\uC77C, \uC544\uC774\uB514 \uAC80\uC0C9", onRowClick: handleRowClick, themeMode: "light" }), _jsxs(CmsPopup, { title: "\uD68C\uC6D0 \uC815\uBCF4 \uC218\uC815", isOpen: isPopupOpen, onClose: closePopup, bottomFloating: _jsxs(PopupFooter, { children: [_jsx(CancelButton, { onClick: closePopup, children: "\uB2EB\uAE30" }), _jsx(ConfirmButton, { title: "\uD68C\uC6D0 \uC815\uBCF4\uB97C \uC800\uC7A5\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?", content: _jsxs(_Fragment, { children: ["\uC785\uB825\uD558\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uD68C\uC6D0 \uC815\uBCF4\uB97C \uC800\uC7A5\uD569\uB2C8\uB2E4.", _jsx("br", {}), "\uC800\uC7A5 \uD6C4\uC5D0\uB294 \uC774\uC804 \uC815\uBCF4\uB85C \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."] }), onConfirm: handleSave })] }), children: [_jsxs(UserInfoSection, { children: [_jsx(ProfileImage, { src: selectedUser?.profileImageUrl || "/default-profile.png", alt: "Profile" }), _jsxs(UserDetails, { children: [_jsxs(DetailItem, { children: [_jsx(DetailIcon, { children: _jsx(PersonIcon, {}) }), _jsxs(NameText, { children: [selectedUser?.name, " (KRW)"] })] }), _jsxs(DetailItem, { children: [_jsx(DetailIcon, { children: _jsx(BadgeIcon, {}) }), _jsx("span", { children: selectedUser?.adminId })] }), _jsxs(DetailItem, { children: [_jsx(DetailIcon, { children: _jsx(PhoneIcon, {}) }), _jsx("span", { children: selectedUser?.cellphone })] }), _jsxs(DetailItem, { children: [_jsx(DetailIcon, { children: _jsx(EmailIcon, {}) }), _jsx("span", { children: selectedUser?.email })] })] })] }), _jsxs(FormSection, { children: [_jsx(TextField, { radius: "0", value: email, label: "\uD68C\uC0AC\uBA54\uC77C", "$labelPosition": "vertical", onChange: (e) => setEmail(e.target.value), placeholder: "\uC774\uBA54\uC77C \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD558\uC138\uC694", errorMessage: emailError ?? undefined }), _jsx(TextField, { radius: "0", value: cellphone, label: "\uC804\uD654\uBC88\uD638", "$labelPosition": "vertical", onChange: (e) => {
                                    const input = e.target.value;
                                    if (/^\d*$/.test(input)) {
                                        setCellphone(input);
                                    }
                                }, placeholder: "- \uC81C\uC678\uD558\uACE0 \uC785\uB825\uD558\uC138\uC694", errorMessage: cellphoneError ?? undefined }), _jsx(MemoField, { radius: "0", multiline: true, minLines: 5, height: "150px", value: description, label: "\uBA54\uBAA8", "$labelPosition": "horizontal", onChange: (e) => setDescription(e.target.value), placeholder: "\uBA54\uBAA8\uB97C \uC785\uB825\uD558\uC138\uC694" })] })] })] }));
};
export default UserMngPage;
