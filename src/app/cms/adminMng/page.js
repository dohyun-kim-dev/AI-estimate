'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from 'react'; // useRef 추가
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
import { adminCreate, adminUpdate } from '@/lib/api/admin';
import Switch from '@/components/Switch';
import { SwitchInput } from '@/components/SwitchInput';
import PasswordPopup from './PasswordPopup';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
const SwitchRow = styled.div `
  display: flex;
  align-items: center;
  justify-content: start;
  /* margin: 12px 0; */
`;
const SwitchLabel = styled.label `
  font-size: 16px;
  /* font-weight: 500; */
  margin-left: 10px;
  margin-right: 33px;
  color: white;
`;
const PopupFooter = styled.div `
  display: flex;
  justify-content: space-between; /* 좌우로 분리 */
  align-items: center;
  width: 100%;
  gap: 12px;
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
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
`;
const PwdChangeButton = styled(FooterButton) `
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
  height: 48px;
  width: 160px !important; /* !important를 추가하여 강제로 덮어쓰기 */
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
const AdminMngPage = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cellphone, setCellphone] = useState('');
    const [emailYn, setEmailYn] = useState('Y');
    const [smsYn, setSmsYn] = useState('Y');
    const [description, setDescription] = useState('');
    const [idError, setIdError] = useState(null);
    const [pwdError, setPwdError] = useState(null);
    const [confirmPwdError, setConfirmPwdError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [cellphoneError, setCellphoneError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPwdChangeOpen, setIsPwdChangeOpen] = useState(false);
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
        setDescription(initial?.description ?? '');
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
        if (!selectedUser && !Validators.password(password)) {
            setPwdError('비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.');
            valid = false;
        }
        else
            setPwdError(null);
        if (!selectedUser && password !== confirmPassword) {
            setConfirmPwdError('비밀번호가 일치하지 않습니다.');
            valid = false;
        }
        else
            setConfirmPwdError(null);
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
                const response = await adminUpdate(updatePayload);
                if (response.statusCode === 200 && response.message === 'success') {
                    toast.success('관리자 정보가 수정되었습니다.');
                    setIsPopupOpen(false);
                    listRef.current?.refetch();
                }
                else {
                    const errorMessage = response.error?.customMessage || response.message || '수정에 실패했습니다.';
                    toast.error(errorMessage);
                }
            }
            else {
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
                const response = await adminCreate(createPayload);
                if (response.statusCode === 200 && response.message === 'success') {
                    toast.success('관리자가 성공적으로 등록되었습니다.');
                    setIsPopupOpen(false);
                    listRef.current?.refetch();
                }
                else {
                    const errorMessage = response.error?.customMessage || response.message || '등록에 실패했습니다.';
                    toast.error(errorMessage);
                }
            }
        }
        catch (error) {
            const err = error;
            const errorMessage = 'customMessage' in err
                ? err.customMessage
                : err instanceof Error
                    ? err.message
                    : '처리에 실패했습니다.';
            toast.error(errorMessage);
        }
    };
    const fetchData = useCallback(async (params) => {
        const response = await adminGetList({
            keyword: params.keyword || '',
            fromDate: params.fromDate,
            toDate: params.toDate
        });
        return {
            data: response.data || [],
            totalItems: response.metadata.totalCnt,
            allItems: response.metadata.allCnt
        };
    }, []);
    const handleDropdownChange = useCallback(async (adminId, type, newValue) => {
        try {
            console.log('handleDropdownChange', adminId, type, newValue);
            const response = await adminUpdate({
                targetAdminId: adminId, [type]: newValue,
            }); // 강제로 캐스팅 (type-safe 방식은 별도 타입 유틸 필요)
            const isSuccess = response?.[0]?.message === 'success';
            if (isSuccess) {
                toast.success(`${type === 'emailYn' ? '메일' : 'SMS'} 수신 설정이 변경되었습니다.`);
                listRef.current?.refetch();
            }
            else {
                toast.error('변경에 실패했습니다.');
            }
        }
        catch (error) {
            const err = error;
            toast.error(err?.message || '변경에 실패했습니다.');
        }
    }, []);
    const columns = useMemo(() => [
        { header: 'No', accessor: 'no' },
        {
            header: '가입일',
            accessor: 'createAt',
            sortable: true,
            formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
        },
        { header: '이름', accessor: 'name' },
        { header: '아이디', accessor: 'adminId' },
        { header: '이메일', accessor: 'email' },
        { header: '전화번호', accessor: 'cellphone' },
        {
            header: 'SMS 수신',
            accessor: 'smsYn',
            noPopup: true,
            formatter: (_value, row) => (_jsx(Switch, { checked: row.smsYn === 'Y', onToggle: () => handleDropdownChange(row.adminId, 'smsYn', row.smsYn === 'Y' ? 'N' : 'Y') })),
        },
        {
            header: '메일 수신',
            accessor: 'emailYn',
            noPopup: true,
            formatter: (_value, row) => (_jsx(Switch, { checked: row.emailYn === 'Y', onToggle: () => handleDropdownChange(row.adminId, 'emailYn', row.emailYn === 'Y' ? 'N' : 'Y') })),
        },
        { header: '비고', accessor: 'description' },
    ], [handleDropdownChange]);
    return (_jsxs(_Fragment, { children: [_jsx(ToastContainer, { position: "top-center", autoClose: 3000, newestOnTop: false, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true, theme: "light", style: { zIndex: 10000 } }), _jsx(CmsResponsiveContainer, { title: "\uAD00\uB9AC\uC790 \uD68C\uC6D0\uAD00\uB9AC", data: [], columns: columns, fetchData: () => fetchData({}), onRowClick: handleRowClick, onAdd: handleHeaderButtonClick, addButtonLabel: '\uAD00\uB9AC\uC790 \uB4F1\uB85D', themeMode: "light", compactFieldCount: 3, defaultViewMode: "detail" // 모바일 기본 보기 모드
                , enableDateFilter: true, enableCompanySearch: true, onCompanySelect: (company) => {
                    console.log('Selected company:', company);
                    // 선택된 고객사 처리
                } }), _jsx(CmsPopup, { title: "\uAD00\uB9AC\uC790\uB4F1\uB85D", isOpen: isPopupOpen, onClose: closePopup, isWide: false, showRequiredMark: true, bottomFloating: _jsxs(PopupFooter, { children: [selectedUser ? (_jsx(CancelButton, { style: { backgroundColor: 'eeeeee', color: '#333333' }, onClick: () => toast.info('삭제 기능은 추후 구현 예정입니다.'), children: "\uC0AD\uC81C" })) : (_jsx("div", {}) // 빈 영역 유지
                        ), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx(SaveButton, { onClick: handleSave, children: "\uC800\uC7A5" }), _jsx(CancelButton, { onClick: closePopup, children: "\uB2EB\uAE30" })] })] }), children: _jsxs(FormContainer, { children: [_jsx(TextField, { radius: "0", value: userId, label: "* \uC544\uC774\uB514", autoComplete: "off", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setUserId(e.target.value), placeholder: "\uC601\uBB38\uC790\uC640 \uC22B\uC790\uB97C \uD3EC\uD568\uD55C 6~20\uC790", errorMessage: idError ?? undefined, readOnly: !!selectedUser }), !selectedUser && (_jsx(TextField, { radius: "0", value: password, showSuffixIcon: true, label: "* \uBE44\uBC00\uBC88\uD638", autoComplete: "new-password", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setPassword(e.target.value), placeholder: "\uC601\uBB38 + \uC22B\uC790 + \uD2B9\uC218\uBB38\uC790 1\uAC1C \uD3EC\uD568 8\uC790\uB9AC \uC774\uC0C1", isPasswordField: true, errorMessage: pwdError ?? undefined })), !selectedUser && (_jsx(TextField, { radius: "0", value: confirmPassword, showSuffixIcon: true, label: "* \uBE44\uBC00\uBC88\uD638 \uD655\uC778", autoComplete: "new-password", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setConfirmPassword(e.target.value), placeholder: "\uC601\uBB38 + \uC22B\uC790 + \uD2B9\uC218\uBB38\uC790 1\uAC1C \uD3EC\uD568 8\uC790\uB9AC \uC774\uC0C1", isPasswordField: true, errorMessage: confirmPwdError ?? undefined })), _jsx(TextField, { radius: "0", value: name, label: "* \uC774\uB984", "$labelPosition": "outlined", labelColor: "white", onChange: (e) => setName(e.target.value), placeholder: "\uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694", errorMessage: nameError ?? undefined }), _jsx(TextField, { radius: "0", value: email, label: "* \uC774\uBA54\uC77C", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setEmail(e.target.value), placeholder: "\uC774\uBA54\uC77C \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD558\uC138\uC694", errorMessage: emailError ?? undefined }), _jsx(TextField, { radius: "0", value: cellphone, label: "* \uC5F0\uB77D\uCC98", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => {
                                const input = e.target.value;
                                if (/^\d*$/.test(input)) {
                                    setCellphone(input);
                                }
                            }, placeholder: "- \uC81C\uC678 \uD558\uACE0 \uC785\uB825\uD558\uC138\uC694", errorMessage: cellphoneError ?? undefined }), selectedUser && (_jsxs(SwitchRow, { children: [_jsx(SwitchLabel, { children: "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD" }), _jsx(PwdChangeButton, { style: { width: 'auto', padding: '0 16px', fontSize: '14px' }, onClick: () => setIsPwdChangeOpen(true), children: "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD" })] })), _jsx(SwitchInput, { label: "\uC774\uBA54\uC77C \uC218\uC2E0", value: emailYn, onChange: setEmailYn, "$labelPosition": "horizontal", labelColor: "white" }), _jsx(SwitchInput, { label: "SMS \uC218\uC2E0", value: smsYn, onChange: setSmsYn, "$labelPosition": "horizontal", labelColor: "white" }), _jsx(TextField, { radius: "0", multiline: true, minLines: 4, maxLines: 10, height: "200px", value: description, label: "\uBE44\uACE0", "$labelPosition": "horizontal", labelColor: "white", onChange: (e) => setDescription(e.target.value), placeholder: "\uBE44\uACE0\uB97C \uC785\uB825\uD558\uC138\uC694" })] }) }), _jsx(PasswordPopup, { adminId: userId, isOpen: isPwdChangeOpen, onClose: () => setIsPwdChangeOpen(false) })] }));
};
export default AdminMngPage;
