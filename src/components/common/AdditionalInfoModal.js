import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Modal from '@components/common/Modal';
import TextField from '@components/common/TextField';
import styled from 'styled-components';
import { Validators } from '@/lib/utils/validators';
import { googleLoginUpdate } from '@/lib/api/user/userApi';
import TermsAgreement from '@/components/ai-esti/TermsAgreement';
const Form = styled.form `
  margin-top: 32px; 
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 95%;
    margin-left: auto;
    margin-right: auto;
  

  @media (min-width: 1024px) {
    width: 85%;
    margin-left: auto;
    margin-right: auto;
  }
`;
const Disclaimer = styled.p `
  margin-top: 4px;
  font-size: 12px;
  color: #666666;
`;
const ErrorMessage = styled.div `
  color: #FF4444;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
`;
const SubmitButton = styled.button `
  height: 44px;
  border-radius: 8px;
  background: #2E2E48;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  align-self: center;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;
const VerifyButton = styled.button `
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border-radius: 4px;
  background: #2E2E48;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    background: #E5E5E5;
    cursor: not-allowed;
  }
`;
const PhoneContainer = styled.div `
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  margin-bottom: 20px;
`;
const InputContainer = styled.div `
  flex: 3;
`;
const ButtonContainer = styled.div `
  flex: 1;
`;
export default function AdditionalInfoModal({ open, onClose }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cellphone, setCellphone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const { user, closeAdditionalInfoModal } = useAuthStore();
    const navigate = useNavigate();
    const [isFormValid, setIsFormValid] = useState(false);
    // 모달이 열릴 때마다 상태 초기화
    useEffect(() => {
        if (open) {
            setName('');
            setEmail('');
            setCellphone('');
            setVerificationCode('');
            setShowVerification(false);
            setIsVerified(false);
            setPrivacyAgreed(false);
            setTermsAgreed(false);
            setIsFormValid(false);
        }
    }, [open]);
    useEffect(() => {
        const isValid = Validators.required(name) &&
            Validators.email(email) &&
            Validators.phone(cellphone) &&
            isVerified &&
            privacyAgreed &&
            termsAgreed;
        setIsFormValid(isValid);
    }, [name, email, cellphone, isVerified, privacyAgreed, termsAgreed]);
    const handleRequestVerification = () => {
        if (!Validators.phone(cellphone)) {
            toast.error('올바른 휴대폰 번호를 입력해주세요');
            return;
        }
        // TODO: 실제 인증번호 요청 API 호출
        toast.success('인증번호가 발송되었습니다');
        setShowVerification(true);
    };
    const handleVerifyCode = () => {
        if (verificationCode.length !== 6) {
            toast.error('6자리 인증번호를 입력해주세요');
            return;
        }
        // TODO: 실제 인증번호 확인 API 호출
        setIsVerified(true);
        toast.success('인증이 완료되었습니다');
    };
    const handleAgreeChange = (privacy, terms) => {
        setPrivacyAgreed(privacy);
        setTermsAgreed(terms);
    };
    const handleViewTermsDetails = (type) => {
        // TODO: 약관 상세 보기 모달 표시
        toast.info(`${type === 'terms' ? '이용약관' : '개인정보 처리방침'} 상세 내용 표시 예정`);
    };
    const getErrorMessage = () => {
        if (!Validators.required(name))
            return '이름을 입력해주세요';
        if (!Validators.email(email))
            return '올바른 이메일 주소를 입력해주세요';
        if (!Validators.phone(cellphone))
            return '올바른 휴대폰 번호를 입력해주세요';
        if (!isVerified)
            return '휴대폰 인증을 완료해주세요';
        if (!privacyAgreed || !termsAgreed)
            return '필수 약관에 동의해주세요';
        return '';
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error(getErrorMessage());
            return;
        }
        try {
            const response = await googleLoginUpdate({
                providerId: user?.providerId || '',
                name,
                email,
                cellphone: cellphone.replace(/[^0-9]/g, ''), // 숫자만 추출하여 전송
                profileImage: user?.profileImage || '',
            });
            if (response.statusCode === 200) {
                closeAdditionalInfoModal();
                toast.success('회원가입이 완료되었습니다!');
            }
            else {
                toast.error(response.error?.message || '회원가입 중 오류가 발생했습니다');
            }
        }
        catch (error) {
            console.error('회원가입 에러:', error);
            toast.error('회원가입 중 오류가 발생했습니다');
        }
    };
    return (_jsxs(Modal, { open: open, onClose: onClose, title: "\uCD94\uAC00 \uC815\uBCF4 \uC785\uB825", width: 520, centerTitle: true, children: [_jsx("div", { style: { fontSize: 14, textAlign: 'center' }, children: "\uC815\uD655\uD55C \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC744 \uC704\uD574 \uCD94\uAC00 \uC815\uBCF4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694" }), _jsxs(Form, { onSubmit: handleSubmit, children: [_jsx(TextField, { id: "name", label: "\uC774\uB984", value: name, onChange: (e) => setName(e.target.value), placeholder: "\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", required: true }), _jsx(TextField, { id: "email", label: "\uD68C\uC0AC \uC774\uBA54\uC77C", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "\uD68C\uC0AC \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", required: true }), _jsxs("div", { children: [_jsxs(PhoneContainer, { children: [_jsx(InputContainer, { children: _jsx(TextField, { id: "phone", label: "\uD734\uB300\uC804\uD654", value: cellphone, onChange: (e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                if (value.length <= 11) {
                                                    setCellphone(value);
                                                }
                                            }, placeholder: "\uD734\uB300\uD3F0 \uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694", required: true }) }), _jsx(ButtonContainer, { children: _jsx(VerifyButton, { type: "button", onClick: handleRequestVerification, disabled: !Validators.phone(cellphone) || isVerified, children: isVerified ? '인증완료' : '인증번호 받기' }) })] }), showVerification && !isVerified && (_jsxs(PhoneContainer, { style: { marginTop: '8px' }, children: [_jsx(InputContainer, { children: _jsx(TextField, { id: "verificationCode", label: "\uC778\uC99D\uBC88\uD638", value: verificationCode, onChange: (e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                if (value.length <= 6) {
                                                    setVerificationCode(value);
                                                }
                                            }, placeholder: "\uC778\uC99D\uBC88\uD638 6\uC790\uB9AC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694" }) }), _jsx(ButtonContainer, { children: _jsx(VerifyButton, { type: "button", onClick: handleVerifyCode, disabled: verificationCode.length !== 6, children: "\uC778\uC99D\uD558\uAE30" }) })] }))] }), _jsx(TermsAgreement, { onAgreeChange: handleAgreeChange, initialPrivacyAgreed: privacyAgreed, initialTermsAgreed: termsAgreed, onViewDetails: handleViewTermsDetails }), !isFormValid && _jsx(ErrorMessage, { children: getErrorMessage() }), _jsx(SubmitButton, { type: "submit", children: "\uC644\uB8CC" })] })] }));
}
