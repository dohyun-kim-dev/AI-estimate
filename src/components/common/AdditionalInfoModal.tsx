import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import Modal from '@components/common/Modal'
import TextField from '@components/common/TextField'
import styled from 'styled-components'
import { Validators } from '@/lib/utils/validators'
import { googleLoginUpdate, companyRegister, sendAuthCode, validateAuthCode } from '@/lib/api/user/userApi'
import TermsAgreement from '@/components/ai-esti/TermsAgreement'
import { useToast } from '@/components/common/ToastProvider';

const Form = styled.form`
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

const Disclaimer = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: #666666;
`;

const ErrorMessage = styled.div`
  color: #FF4444;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
`;

const SubmitButton = styled.button`
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

const VerifyButton = styled.button`
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

const PhoneContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  margin-bottom: 20px;
`;

const InputContainer = styled.div`
  flex: 3;
`;

const ButtonContainer = styled.div`
  flex: 1;
`;

const ConfirmModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`;

const ConfirmMessage = styled.div`
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
  color: #333;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
`;

const ConfirmButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  min-width: 80px;

  ${({ variant }) => variant === 'primary' ? `
    background: #2E2E48;
    color: #fff;
    border: none;

    &:hover {
      opacity: 0.9;
    }
  ` : `
    background: #fff;
    color: #2E2E48;
    border: 1px solid #2E2E48;

    &:hover {
      background: #f5f5f5;
    }
  `}
`;

interface AdditionalInfoModalProps {
  open: boolean
  onClose: () => void
}

export default function AdditionalInfoModal({ open, onClose }: AdditionalInfoModalProps) {
    const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cellphone, setCellphone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('')
  const [previousPhoneNumber, setPreviousPhoneNumber] = useState('')
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const { user, closeAdditionalInfoModal, additionalInfoUser, persistUser } = useAuthStore()
    const navigate = useNavigate();
  const { success, error: showError } = useToast(); // useToast 훅 사용

  const [isFormValid, setIsFormValid] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (open) {
      // 모달이 열릴 때마다 모든 상태를 초기화
      setName('');
      setEmail('');
      setCellphone('')
      setVerificationCode('')
      setShowVerification(false)
      setIsVerified(false)
      setVerifiedPhoneNumber('')
      setPreviousPhoneNumber('')
      setPrivacyAgreed(false)
      setTermsAgreed(false)
      setShowConfirmModal(false)
      setIsFormValid(false)
    }
  }, [open])
useEffect(() => {
    const isValid = Validators.required(name) &&
      Validators.email(email) &&
      Validators.phone(cellphone) &&
      isVerified &&
      privacyAgreed &&
      termsAgreed;
    setIsFormValid(isValid);
  }, [name, email, cellphone, isVerified, privacyAgreed, termsAgreed]);

  const handleRequestVerification = async () => {
    if (!Validators.phone(cellphone)) {
      showError('올바른 휴대폰 번호를 입력해주세요'); // toast.error 대신 showError 사용
      return;
    }

    // 인증받기 버튼을 누르면 이전 인증 정보 초기화
    setVerifiedPhoneNumber('')
    setIsVerified(false)
    setVerificationCode('')
    setShowVerification(true)

    setIsSendingCode(true);
    try {
      const response = await sendAuthCode(cellphone.replace(/[^0-9]/g, ''));
      if (response.statusCode === 200) {
        success('인증번호가 발송되었습니다'); // toast.success 대신 success 사용
        setShowVerification(true);
      } else {
        showError(response.error?.customMessage || '인증번호 발송에 실패했습니다'); // toast.error 대신 showError 사용
      }
    } catch (error) {
      console.error('인증번호 요청 에러:', error);
      showError('인증번호 발송 중 오류가 발생했습니다'); // toast.error 대신 showError 사용
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      showError('6자리 인증번호를 입력해주세요'); // toast.error 대신 showError 사용
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await validateAuthCode(cellphone.replace(/[^0-9]/g, ''), verificationCode);
      if (response.statusCode === 200) {
        setIsVerified(true);
        setVerifiedPhoneNumber(cellphone.replace(/[^0-9]/g, ''));
        success('인증이 완료되었습니다'); // toast.success 대신 success 사용
      } else {
        showError(response.error?.customMessage || '인증번호가 일치하지 않습니다'); // toast.error 대신 showError 사용
      }
    } catch (error) {
      console.error('인증번호 확인 에러:', error);
      showError('인증번호 확인 중 오류가 발생했습니다'); // toast.error 대신 showError 사용
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleAgreeChange = (privacy, terms) => {
    setPrivacyAgreed(privacy);
    setTermsAgreed(terms);
  };

  const handleViewTermsDetails = (type) => {
    // TODO: 약관 상세 보기 모달 표시
  };

  const getErrorMessage = () => {
    if (!Validators.required(name)) return '이름을 입력해주세요';
    if (!Validators.email(email)) return '올바른 이메일 주소를 입력해주세요';
    if (!Validators.phone(cellphone)) return '올바른 휴대폰 번호를 입력해주세요';
    if (!isVerified) return '휴대폰 인증을 완료해주세요';
    if (!privacyAgreed || !termsAgreed) return '필수 약관에 동의해주세요';
    return '';
  };

  const performRegistration = async () => {
    try {
      const response = await googleLoginUpdate({
        providerId: additionalInfoUser?.providerId || user?.providerId || '',
        name,
        email,
        cellphone: verifiedPhoneNumber || cellphone.replace(/[^0-9]/g, ''),
        profileImage: additionalInfoUser?.profileImage || user?.profileImage || '',
      });

      if (response.statusCode === 200) {
        const updatedUser = response.data;
        try {
          const pathParts = window.location.pathname.split('/');
          const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
          const currentCompanyCode = (companyCodeIndex > 0 && pathParts.length > companyCodeIndex)
            ? pathParts[companyCodeIndex]
            : 'heredot';

          const userServices = updatedUser.usingService || [];
          const needsCompanyRegistration = !userServices.includes(currentCompanyCode);
          if (needsCompanyRegistration) {
            await companyRegister();
            console.log(`고객사 등록 완료: ${currentCompanyCode}`);
          } else {
            console.log(`이미 고객사 등록됨: ${currentCompanyCode}`);
          }
        } catch (err) {
          console.error('고객사 등록 중 오류:', err);
        }

        try {
          if (persistUser) persistUser(updatedUser);
        } catch (err) {
          console.warn('퍼시스트 중 오류:', err);
        }

        closeAdditionalInfoModal();
        setName('');
        setEmail('');
        setCellphone('');
        setPrivacyAgreed(false);
        setTermsAgreed(false);
        success('회원가입이 완료되었습니다!'); // toast.success 대신 success 사용
      } else {
        showError(response.error?.customMessage || '회원가입 중 오류가 발생했습니다'); // toast.error 대신 showError 사용
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      showError('회원가입 중 오류가 발생했습니다'); // toast.error 대신 showError 사용
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      showError(getErrorMessage()); // toast.error 대신 showError 사용
      return;
    }

    // 인증 완료된 번호와 현재 입력된 번호가 다른 경우 컨펌 모달 표시
    if (isVerified && verifiedPhoneNumber && verifiedPhoneNumber !== cellphone.replace(/[^0-9]/g, '')) {
      setShowConfirmModal(true);
      return;
    }

    await performRegistration();
  };

  const handleConfirmYes = async () => {
    setShowConfirmModal(false);
    await performRegistration();
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setCellphone('');
      setPrivacyAgreed(false);
      setTermsAgreed(false);
      setVerificationCode('');
      setShowVerification(false);
      setIsVerified(false);
      setVerifiedPhoneNumber('');
      setPreviousPhoneNumber('');
      setShowConfirmModal(false);
      setIsFormValid(false);
    }
  }, [open]);

  return (
    <>
    <Modal open={open} onClose={onClose} title="추가 정보 입력" width={520} centerTitle ={true} closeOnOverlayClick={false}>
      <div style={{ fontSize: 14, textAlign: 'center' }}>정확한 서비스 이용을 위해 <br></br>추가 정보를 입력해주세요</div>
      <Form onSubmit={handleSubmit}>
        <TextField
          id="name"
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력해주세요"
          autoComplete="off" 
        />
        <TextField
          id="email"
          label="회사 이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="회사 이메일을 입력해주세요"
          autoComplete="off" 
        />
        <div>
          <PhoneContainer>
            <InputContainer>
              <TextField
                id="phone"
                label="휴대전화"
                value={cellphone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 11) {
                    setCellphone(value)
                  }
                }}
                onBlur={() => {
                  // 포커스가 벗어날 때 번호가 변경되었으면 인증 상태 리셋
                  if (previousPhoneNumber && previousPhoneNumber !== cellphone) {
                    // setIsVerified(false)
                    // setShowVerification(false)
                    setVerificationCode('')
                  }
                  setPreviousPhoneNumber(cellphone)
                }}
                autoComplete="off" 
                placeholder="휴대번호 입력해주세요"
              />
            </InputContainer>
            <ButtonContainer>
              <VerifyButton
                type="button"
                onClick={handleRequestVerification}
                disabled={!Validators.phone(cellphone)|| isSendingCode }
              >
                {isSendingCode ? '전송 중...' : isVerified ? '인증완료' : '인증받기'}
              </VerifyButton>
            </ButtonContainer>
          </PhoneContainer>
          {showVerification && !isVerified && (
            <PhoneContainer style={{ marginTop: '8px' }}>
              <InputContainer>
                <TextField
                  id="verificationCode"
                  label="인증번호"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    if (value.length <= 6) {
                      setVerificationCode(value)
                    }
                  }}
                  placeholder="인증번호 6자리를 입력해주세요"
                />
              </InputContainer>
              <ButtonContainer>
                <VerifyButton
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || isVerifyingCode}
                >
                  {isVerifyingCode ? '확인 중...' : '인증하기'}
                </VerifyButton>
              </ButtonContainer>
            </PhoneContainer>
          )}
        </div>
        <TermsAgreement
          onAgreeChange={handleAgreeChange}
          initialPrivacyAgreed={privacyAgreed}
          initialTermsAgreed={termsAgreed}
          onViewDetails={handleViewTermsDetails}
        />
        {!isFormValid && <ErrorMessage>{getErrorMessage()}</ErrorMessage>}
        <SubmitButton type="submit">
          완료
        </SubmitButton>
      </Form>
    </Modal>
    <Modal open={showConfirmModal} onClose={handleConfirmNo} title="휴대폰 번호 확인" width={400} centerTitle={true}>
      <ConfirmModalContainer>
        <ConfirmMessage>
          인증하신 {verifiedPhoneNumber?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}로<br />
          가입을 진행하시겠습니까?
        </ConfirmMessage>
        <ConfirmButtons>
          <ConfirmButton variant="secondary" onClick={handleConfirmNo}>
            아니오
          </ConfirmButton>
          <ConfirmButton variant="primary" onClick={handleConfirmYes}>
            예
          </ConfirmButton>
        </ConfirmButtons>
      </ConfirmModalContainer>
    </Modal>    </>
  )
}
