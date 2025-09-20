'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { IoClose } from 'react-icons/io5';
import { useAuthStore } from '@/store/authStore';
import { IoChevronDown, IoChevronUp, IoArrowBack } from 'react-icons/io5';
import { useToast } from '@/components/common/ToastProvider';
import { sendAuthCode, validateAuthCode, googleLoginUpdate } from '@/lib/api/user/userApi';
import { ApiResponse, GoogleLoginResponse } from '@/lib/api/user/userApi.types';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContentWrapper = styled.div`
  background-color: #f5f5f5;
  color: black;
  padding: 40px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 450px;
  min-height: 500px;
  max-height: 560px;
  position: relative;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const ModalViewsContainer = styled.div<{ $viewMode: 'info' | 'phoneAuth' }>`
  display: flex;
  width: 200%;
  height: 100%;
  gap: 70px;
  transition: transform 0.5s ease-in-out;
  transform: ${(props) =>
    props.$viewMode === 'info' ? 'translateX(0%)' : 'translateX(-52%)'};
`;

const View = styled.div`
  width: 50%;
  max-height: 490px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const ScrollableContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;

  &.info-view-scroll {
    padding: 0 10px 0 20px;
  }
  &.auth-view-scroll {
    padding: 0 20px 0 20px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 3px;
  }
  scrollbar-width: thin;
  scrollbar-color: #cccccc transparent;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;
  text-align: start;
  flex-shrink: 0;
  padding: 0 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  flex-grow: 1;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
`;

const PhoneInput = styled.input`
  flex-grow: 1;
  padding: 12px 16px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: ${props => props.readOnly ? '#e9ecef' : 'white'};
  color: black;
  &:focus {
    outline: none;
    border-color: #666;
  }
  &:read-only {
    cursor: default;
  }
`;

const ChangeButton = styled.button`
  padding: 12px 16px;
  background-color: #5a5a5a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background-color: #404040;
  }
`;

const VerifyButton = styled.button`
  padding: 12px 16px;
  background-color: #202055;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background-color: #2f2f7d;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const VerificationInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cccccc;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 24px;
  background-color: white;
  color: black;
  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const ButtonContainer = styled.div`
  margin-top: auto;
  padding-top: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CompleteButton = styled.button`
  width: 90%;
  padding: 12px 16px;
  background-color: #202055;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background-color: #2f2f7d;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StyledCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  z-index: 1;
  
  &:hover {
    color: black;
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 16px;
  background-color: white;
  color: black;
  &:focus {
    outline: none;
    border-color: #666;
  }
  &::placeholder {
    color: #aaaaaa;
  }
  &:read-only {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e53935;
  font-size: 14px;
  margin-top: -12px;
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #202055;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 8px 0;
  flex-shrink: 0;

  svg {
    margin-right: 6px;
  }

  &:hover {
    color: #2f2f7d;
  }
`;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, setUser } = useAuthStore();
  const { success, error } = useToast();

  const [viewMode, setViewMode] = useState<'info' | 'phoneAuth'>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const isInfoFormValid = name.trim() !== '' && email.trim() !== '';

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCurrentPhoneNumber(user.cellphone || '');
      setNewPhoneNumber('');
      setVerificationSent(false);
      setVerificationCode('');
      setViewMode('info');
      setNameError('');
      setPhoneError('');
      setVerificationError('');
    } else if (!isOpen) {
      setViewMode('info');
      setNewPhoneNumber('');
      setVerificationCode('');
      setVerificationSent(false);
      setNameError('');
      setPhoneError('');
      setVerificationError('');
    }
  }, [isOpen, user]);

  const handleCloseModal = () => {
    onClose();
  };

  const validateName = () => {
    if (!name.trim()) {
      setNameError('이름을 입력해주세요.');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = () => {
    if (!email.trim()) {
      error('이메일을 입력해주세요.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error('유효한 이메일 형식이 아닙니다.');
      return false;
    }
    return true;
  };

  const validateNewPhone = () => {
    if (!newPhoneNumber.trim()) {
      setPhoneError('새로운 휴대전화 번호를 입력해주세요.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleChangePhoneClick = () => {
    setViewMode('phoneAuth');
  };

  const handleBackToInfoClick = () => {
    setViewMode('info');
    setPhoneError('');
  };

  const handleSendVerification = async () => {
    if (!validateNewPhone()) return;
    setVerificationError('');
    setIsSendingVerification(true);
    
    try {
      const response = await sendAuthCode(newPhoneNumber);
      if (response && response.statusCode === 200) {
        setVerificationSent(true);
        success('인증번호가 발송되었습니다.');
      } else {
        setVerificationError('인증번호 발송에 실패했습니다.');
      }
    } catch (err) {
      setVerificationError('인증번호 발송에 실패했습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateName() || !validateEmail()) {
      error('이름과 이메일을 확인해주세요.');
      return;
    }
    setVerificationError('');
    setIsUpdating(true);

    try {
      if (!user?.providerId) {
        error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const response = await googleLoginUpdate({
        providerId: user.providerId,
        name: name,
        email: email,
        profileImage: user.profileImage || '',
        cellphone: user.cellphone || '',
      }) as unknown as ApiResponse<GoogleLoginResponse>;

      // API 응답이 성공했는지 확인
      if (response && response.data && response.data._id) {
        setUser({
          ...user,
          name: name,
          email: email,
        });
        success('프로필이 업데이트되었습니다.');
        onClose();
      } else {
        error('프로필 업데이트에 실패했습니다.');
      }
    } catch (err) {
      error('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompletePhoneAuthAndUpdate = async () => {
    if (!validateName() || !validateEmail()) {
      error('이름과 이메일 정보를 확인해주세요.');
      setViewMode('info');
      return;
    }
    if (!newPhoneNumber.trim()) {
      error('새로운 휴대전화 번호를 입력해주세요.');
      return;
    }
    setVerificationError('');
    setIsUpdating(true);

    try {
      // 먼저 인증번호 검증
      const validationResponse = await validateAuthCode(newPhoneNumber, verificationCode);
      if (!validationResponse || validationResponse.statusCode !== 200) {
        setVerificationError('인증번호가 올바르지 않습니다.');
        setIsUpdating(false);
        return;
      }

      // 인증 성공 시 프로필 업데이트
      if (!user?.providerId) {
        error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const response = await googleLoginUpdate({
        providerId: user.providerId,
        name: name,
        email: email,
        profileImage: user.profileImage || '',
        cellphone: newPhoneNumber,
      }) as unknown as ApiResponse<GoogleLoginResponse>;

      if (response && response.data && response.data._id) {
        setUser({
          ...user,
          name: name,
          email: email,
          cellphone: newPhoneNumber,
        });
        success('프로필이 업데이트되었습니다.');
        onClose();
      } else {
        error('프로필 업데이트에 실패했습니다.');
      }
    } catch (err) {
      setVerificationError('인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleCloseModal}>
      <ModalContentWrapper onClick={(e) => e.stopPropagation()}>
        <StyledCloseButton onClick={handleCloseModal}>
          <IoClose size={28} />
        </StyledCloseButton>

        <ModalViewsContainer $viewMode={viewMode}>
          <View>
            <ModalTitle>회원정보 수정</ModalTitle>
            <ScrollableContent className="info-view-scroll">
              <FormGroup>
                <Label>이름</Label>
                <TextInput
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={validateName}
                />
                {nameError && <ErrorMessage>{nameError}</ErrorMessage>}

                <Label>회사 이메일</Label>
                <TextInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                />

                <Label>휴대전화</Label>
                <InputGroup>
                  <PhoneInput
                    type="tel"
                    value={currentPhoneNumber || '정보 없음'}
                    readOnly
                  />
                  <ChangeButton onClick={handleChangePhoneClick}>
                    변경하기
                  </ChangeButton>
                </InputGroup>
              </FormGroup>
            </ScrollableContent>
            <ButtonContainer>
              <CompleteButton
                onClick={handleUpdateProfile}
                disabled={!isInfoFormValid || isUpdating}
              >
                {isUpdating ? '처리 중...' : '수정 완료'}
              </CompleteButton>
            </ButtonContainer>
          </View>

          <View>
            <BackButton onClick={handleBackToInfoClick}>
              <IoArrowBack />
              뒤로가기
            </BackButton>
            <ModalTitle>휴대전화 번호 변경</ModalTitle>
            <ScrollableContent className="auth-view-scroll">
              <FormGroup>
                <Label style={{ marginTop: '14px' }}>
                  새로운 휴대전화 번호
                </Label>
                <InputGroup>
                  <PhoneInput
                    type="tel"
                    placeholder="010-1234-5678"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    disabled={verificationSent}
                    onBlur={validateNewPhone}
                  />
                  <VerifyButton
                    onClick={handleSendVerification}
                    disabled={
                      !newPhoneNumber.trim() ||
                      verificationSent ||
                      isSendingVerification
                    }
                  >
                    {verificationSent
                      ? isSendingVerification
                        ? '전송 중...'
                        : '재전송'
                      : isSendingVerification
                      ? '전송 중...'
                      : '인증번호 받기'}
                  </VerifyButton>
                </InputGroup>
                {phoneError && <ErrorMessage>{phoneError}</ErrorMessage>}

                {verificationSent && (
                  <>
                    <VerificationInput
                      type="text"
                      placeholder="인증번호를 입력하세요"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        if (verificationError) setVerificationError('');
                      }}
                    />
                    {verificationError && (
                      <ErrorMessage
                        style={{ marginTop: '-12px', marginBottom: '12px' }}
                      >
                        {verificationError}
                      </ErrorMessage>
                    )}
                  </>
                )}
              </FormGroup>
            </ScrollableContent>
            <ButtonContainer>
              <CompleteButton
                onClick={handleCompletePhoneAuthAndUpdate}
                disabled={
                  !newPhoneNumber.trim() ||
                  !verificationCode.trim() ||
                  isUpdating
                }
              >
                {isUpdating ? '처리 중...' : '수정 완료'}
              </CompleteButton>
            </ButtonContainer>
          </View>
        </ModalViewsContainer>
      </ModalContentWrapper>
    </ModalOverlay>
  );
};

export default EditProfileModal;
