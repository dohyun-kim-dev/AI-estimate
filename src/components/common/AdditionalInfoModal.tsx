
import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import Modal from '@components/common/Modal'
import TextField from '@components/common/TextField'
import styled from 'styled-components'
import { Validators } from '@/lib/utils/validators'
import { googleLoginUpdate } from '@/lib/api/user/userApi'
import TermsAgreement from '@/components/ai-esti/TermsAgreement'

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
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const { user, closeAdditionalInfoModal } = useAuthStore()
    const navigate = useNavigate();

  const [isFormValid, setIsFormValid] = useState(false)

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setCellphone('')
      setVerificationCode('')
      setShowVerification(false)
      setIsVerified(false)
      setPrivacyAgreed(false)
      setTermsAgreed(false)
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

  const handleRequestVerification = () => {
    if (!Validators.phone(cellphone)) {
      toast.error('올바른 휴대폰 번호를 입력해주세요')
      return
    }
    // TODO: 실제 인증번호 요청 API 호출
    toast.success('인증번호가 발송되었습니다')
    setShowVerification(true)
  }

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast.error('6자리 인증번호를 입력해주세요')
      return
    }
    // TODO: 실제 인증번호 확인 API 호출
    setIsVerified(true)
    toast.success('인증이 완료되었습니다')
  }

  const handleAgreeChange = (privacy: boolean, terms: boolean) => {
    setPrivacyAgreed(privacy);
    setTermsAgreed(terms);
  };

  const handleViewTermsDetails = (type: 'terms' | 'privacy') => {
    // TODO: 약관 상세 보기 모달 표시
    toast.info(`${type === 'terms' ? '이용약관' : '개인정보 처리방침'} 상세 내용 표시 예정`);
  };

  const getErrorMessage = () => {
    if (!Validators.required(name)) return '이름을 입력해주세요';
    if (!Validators.email(email)) return '올바른 이메일 주소를 입력해주세요';
    if (!Validators.phone(cellphone)) return '올바른 휴대폰 번호를 입력해주세요';
    if (!isVerified) return '휴대폰 인증을 완료해주세요';
    if (!privacyAgreed || !termsAgreed) return '필수 약관에 동의해주세요';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      toast.error(getErrorMessage())
      return
    }

    try {
      const response = await googleLoginUpdate({
        providerId: user?.providerId || '',
        name,
        email,
        cellphone: cellphone.replace(/[^0-9]/g, ''), // 숫자만 추출하여 전송
        profileImage: user?.profileImage || '',
      })

      if (response.statusCode === 200) {
        closeAdditionalInfoModal()
        toast.success('회원가입이 완료되었습니다!')
      } else {
        toast.error(response.error?.message || '회원가입 중 오류가 발생했습니다')
      }
    } catch (error) {
      console.error('회원가입 에러:', error)
      toast.error('회원가입 중 오류가 발생했습니다')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="추가 정보 입력" width={520} centerTitle>
      <div style={{ fontSize: 14, textAlign: 'center' }}>정확한 서비스 이용을 위해 추가 정보를 입력해주세요</div>
      <Form onSubmit={handleSubmit}>
        <TextField
          id="name"
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력해주세요"
          required
        />
        <TextField
          id="email"
          label="회사 이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="회사 이메일을 입력해주세요"
          required
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
                placeholder="휴대폰 번호를 입력해주세요"
                required
              />
            </InputContainer>
            <ButtonContainer>
              <VerifyButton
                type="button"
                onClick={handleRequestVerification}
                disabled={!Validators.phone(cellphone) || isVerified}
              >
                {isVerified ? '인증완료' : '인증번호 받기'}
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
                  disabled={verificationCode.length !== 6}
                >
                  인증하기
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
  )
}