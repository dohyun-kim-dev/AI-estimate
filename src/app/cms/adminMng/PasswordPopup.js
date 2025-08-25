'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { Validators } from '@/lib/utils/validators';
import { toast } from 'react-toastify';
import { adminPasswordUpdate } from '@/lib/api/admin';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
const PasswordPopup = ({ adminId, isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwdError, setPwdError] = useState(null);
    const [confirmPwdError, setConfirmPwdError] = useState(null);
    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setConfirmPassword('');
            setPwdError(null); // ✅ 추가
            setConfirmPwdError(null); // ✅ 추가
        }
    }, [isOpen]);
    const handleSubmit = async () => {
        // ✅ 에러 상태 초기화
        setPwdError(null);
        setConfirmPwdError(null);
        let valid = true;
        if (!Validators.password(password)) {
            setPwdError('비밀번호는 숫자, 영문, 특수문자를 포함하여 8자리 이상이어야 합니다.');
            valid = false;
        }
        if (password !== confirmPassword) {
            setConfirmPwdError('비밀번호가 일치하지 않습니다.');
            valid = false;
        }
        if (!valid)
            return;
        try {
            const res = await adminPasswordUpdate({
                targetAdminId: adminId,
                password,
            });
            if (res?.[0]?.message === 'success') {
                toast.success('비밀번호가 성공적으로 변경되었습니다.');
                onClose();
            }
            else {
                toast.error(res?.[0]?.error?.customMessage || '비밀번호 변경에 실패했습니다.');
            }
        }
        catch (err) {
            toast.error(err?.message || '비밀번호 변경 중 오류가 발생했습니다.');
        }
    };
    return (_jsx(CmsPopup, { title: "", isOpen: isOpen, onClose: onClose, backgroundColor: "#fff", isWide: false, height: "480px", children: _jsxs(FormWrapper, { children: [_jsx(TitleText, { children: "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD" }), _jsxs(DescriptionText, { children: ["\uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694. ", _jsx("br", {}), "\uACC4\uC815 \uBCF4\uC548\uC744 \uC704\uD574 \uC815\uAE30\uC801\uC778 \uBCC0\uACBD\uC744 \uAD8C\uC7A5\uD569\uB2C8\uB2E4."] }), _jsxs(InputRow, { children: [_jsx(Label, { children: "\uC0C8 \uBE44\uBC00\uBC88\uD638" }), _jsx(TextField, { radius: "0", value: password, autoComplete: "new-password", labelColor: "black", showSuffixIcon: true, onChange: (e) => setPassword(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638 (\uC22B\uC790+\uC601\uBB38+\uD2B9\uC218\uBB38\uC790 8\uC790\uB9AC \uC774\uC0C1)", isPasswordField: true, errorMessage: pwdError ?? undefined })] }), _jsxs(InputRow, { children: [_jsx(Label, { children: "\uC0C8 \uBE44\uBC00\uBC88\uD638 \uD655\uC778" }), _jsx(TextField, { radius: "0", value: confirmPassword, autoComplete: "new-password", labelColor: "black", showSuffixIcon: true, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638 \uD655\uC778 (\uBE44\uBC00\uBC88\uD638\uC640 \uB3D9\uC77C\uD558\uAC8C \uC791\uC131)", isPasswordField: true, errorMessage: confirmPwdError ?? undefined })] }), _jsxs(ButtonRow, { children: [_jsx(SaveButton, { onClick: handleSubmit, children: "\uC800\uC7A5" }), _jsx(CancelButton, { onClick: onClose, children: "\uB2EB\uAE30" })] })] }) }));
};
export default PasswordPopup;
const FormWrapper = styled.div `
  display: flex;
  flex-direction: column;
  gap: 32px;
  /* padding: 24px 32px; */
  flex-grow: 1;
`;
const DescriptionText = styled.p `
  font-size: 16px;
  color: ${AppColors.onBackgroundGray};
  margin: 0;
  line-height: 1.5;
`;
const TitleText = styled.p `
  font-size: 26px;
  color: ${AppColors.onPrimaryBlack};
  font-weight: 500;
  margin: 0;
`;
const InputRow = styled.div `
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;
const Label = styled.label `
  min-width: 120px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  color: ${AppColors.onSurface};
`;
const ButtonRow = styled.div `
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
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
