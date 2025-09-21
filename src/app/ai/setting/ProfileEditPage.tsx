'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { IoArrowBack, IoCamera, IoChevronDown } from 'react-icons/io5';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/common/ToastProvider';
import { useHeader } from '@/contexts/HeaderContext';
import { sendAuthCode, validateAuthCode, googleLoginUpdate, uploadFiles } from '@/lib/api/user/userApi';
import { ApiResponse, GoogleLoginResponse } from '@/lib/api/user/userApi.types';

interface ProfileEditPageProps {
  isDarkMode?: boolean;
  onBack?: () => void;
  currentStep?: string;
}

const Container = styled.div<{ $isDarkMode?: boolean }>`
  background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.body : '#ffffff'};
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#000000'};
  padding: 0 16px 60px 16px;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding: 8px 0;
`;

const BackButton = styled.button<{ $isDarkMode?: boolean }>`
  background: none;
  border: none;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#202055'};
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  svg {
    margin-right: 8px;
  }

  &:hover {
    background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.surface1 : '#f5f5f5'};
  }
`;

const Title = styled.h1<{ $isDarkMode?: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#000000'};
  margin-left: 16px;
`;

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

// 프로필 이미지 섹션
const ProfileImageSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const ProfileImage = styled.div<{ $isDarkMode?: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ $isDarkMode, theme }) => $isDarkMode ? theme.border : '#e0e0e0'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.accent : '#202055'};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CameraIcon = styled.div<{ $isDarkMode?: boolean }>`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.accent : '#202055'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  border: 2px solid ${({ $isDarkMode, theme }) => $isDarkMode ? theme.body : '#ffffff'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const DropdownMenu = styled.div<{ $isDarkMode?: boolean; $isOpen: boolean }>`
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.surface1 : '#ffffff'};
  border: 1px solid ${({ $isDarkMode, theme }) => $isDarkMode ? theme.border : '#e0e0e0'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: ${({ $isOpen }) => $isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.div<{ $isDarkMode?: boolean }>`
  padding: 12px 16px;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#333333'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.surface2 : '#f5f5f5'};
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:only-child {
    border-radius: 8px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Section = styled.div`
//   margin-bottom: 40px;
`;

const SectionTitle = styled.h2<{ $isDarkMode?: boolean }>`
  font-size: 18px;
  font-weight: 500;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#333333'};
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ $isDarkMode, theme }) => $isDarkMode ? theme.border : '#e0e0e0'};
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

// PriceEditPopup의 TextField 스타일을 참고한 커스텀 TextField
const TextFieldContainer = styled.div`
  position: relative;
  width: 100%;
`;

const FloatingLabel = styled.label<{ $isDarkMode?: boolean; $hasValue?: boolean; $isFocused?: boolean }>`
  position: absolute;
  top: ${({ $hasValue, $isFocused }) => ($hasValue || $isFocused) ? '-10px' : '16px'};
  left: 12px;
  margin-top: 3px;
  padding: 0 4px;
  font-size: ${({ $hasValue, $isFocused }) => ($hasValue || $isFocused) ? '12px' : '16px'};
  color: ${({ $isDarkMode, theme, $isFocused }) => 
    $isFocused 
      ? ($isDarkMode ? theme.accent : '#202055')
      : ($isDarkMode ? '#ffffff' : '#666666')
  };
  background: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.body : '#ffffff'};
  z-index: 1;
  transition: all 0.2s ease;
  pointer-events: none;
`;

const StyledInput = styled.input<{ $isDarkMode?: boolean; $hasError?: boolean }>`
  width: 100%;
  height: 56px;
  padding: 16px 14px;
  border: 1px solid ${({ $isDarkMode, theme, $hasError }) => 
    $hasError 
      ? '#e53935'
      : ($isDarkMode ? '#ffffff' : '#e0e0e0')
  };
  border-radius: 4px;
  font-size: 14px;
  background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? '#000' : '#ffffff'};
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#000000'};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.accent : '#202055'};
  }

  &:read-only {
    background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.surface2 : '#f5f5f5'};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.subtleText : '#aaaaaa'};
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const ActionButton = styled.button<{ $isDarkMode?: boolean; $variant?: 'primary' | 'secondary' }>`
  height: 56px;
  width: 120px;
  padding: 0 20px;
//   margin-bottom: 22px;
  border: 1px solid ${({ $isDarkMode, theme, $variant }) => 
    $variant === 'primary' 
      ? ($isDarkMode ? '#fff' : '#5799ED')
      : ($isDarkMode ? theme.border : '#cccccc')
  };
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ $isDarkMode, theme, $variant }) => 
    $variant === 'primary' 
      ? ($isDarkMode ? '#1D252D': '#5799ED')
      : ($isDarkMode ? theme.surface1 : '#ffffff')
  };
  color: ${({ $isDarkMode, theme, $variant }) => 
    $variant === 'primary' 
      ? '#ffffff'
      : ($isDarkMode ? theme.text : '#333333')
  };
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ $isDarkMode, theme, $variant }) => 
      $variant === 'primary' 
        ? ($isDarkMode ? theme.accent : '#1a1a45')
        : ($isDarkMode ? theme.surface2 : '#f5f5f5')
    };
    opacity: ${({ $variant }) => $variant === 'primary' ? '0.9' : '1'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p<{ $isDarkMode?: boolean }>`
  color: #e53935;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
`;

const CompleteButton = styled.button<{ $isDarkMode?: boolean }>`
  width: 100%;
  height: 56px;
  padding: 16px;
  background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? '#1D252D' : '#5799ED'};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
//   margin-top: 40px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.accent : '#1a1a45'};
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WithdrawalButton = styled.button<{ $isDarkMode?: boolean }>`
  width: 100%;
  background: none;
  border: none;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? '#888888' : '#999999'};
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  padding: 20px 0;
  margin-top: 150px;
  text-decoration: underline;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ $isDarkMode, theme }) => $isDarkMode ? '#aaaaaa' : '#666666'};
  }
`;

const AuthSection = styled.div<{ $isDarkMode?: boolean }>`
  background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.surface1 : '#f8f9fa'};
  border: 1px solid ${({ $isDarkMode, theme }) => $isDarkMode ? theme.border : '#e9ecef'};
  border-radius: 8px;
  padding: 24px;
  margin-top: 24px;
`;

const AuthTitle = styled.h3<{ $isDarkMode?: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#333333'};
  margin-bottom: 16px;
`;

// 확인 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div<{ $isDarkMode?: boolean }>`
  background-color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.surface1 : '#ffffff'};
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3<{ $isDarkMode?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#333333'};
  margin-bottom: 16px;
  text-align: center;
`;

const ModalMessage = styled.p<{ $isDarkMode?: boolean }>`
  font-size: 16px;
  color: ${({ $isDarkMode, theme }) => $isDarkMode ? theme.text : '#666666'};
  text-align: center;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ModalButton = styled.button<{ $isDarkMode?: boolean; $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;

  ${({ $isDarkMode, theme, $variant }) => $variant === 'primary' ? `
    background: ${$isDarkMode ? '#1D252D' : '#5799ED'};
    color: #ffffff;
    border: none;

    &:hover {
      opacity: 0.9;
    }
  ` : `
    background: ${$isDarkMode ? theme.surface2 : '#ffffff'};
    color: ${$isDarkMode ? theme.text : '#333333'};
    border: 1px solid ${$isDarkMode ? theme.border : '#cccccc'};

    &:hover {
      background: ${$isDarkMode ? theme.surface1 : '#f5f5f5'};
    }
  `}
`;

// 커스텀 TextField 컴포넌트
interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  isDarkMode?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  readOnly = false,
  disabled = false,
  errorMessage,
  isDarkMode = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <TextFieldContainer>
      <FloatingLabel 
        htmlFor={id} 
        $isDarkMode={isDarkMode}
        $hasValue={hasValue}
        $isFocused={isFocused}
      >
        {label}
      </FloatingLabel>
      <StyledInput
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={isFocused ? placeholder : ''}
        readOnly={readOnly}
        disabled={disabled}
        $isDarkMode={isDarkMode}
        $hasError={!!errorMessage}
      />
      {errorMessage && (
        <ErrorMessage $isDarkMode={isDarkMode}>{errorMessage}</ErrorMessage>
      )}
    </TextFieldContainer>
  );
};

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({
  isDarkMode = false,
  onBack,
  currentStep: propCurrentStep = 'profile',
}) => {
  const navigate = useNavigate();
  const { companyCode } = useParams<{ companyCode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, setUser, logout } = useAuthStore();
  const { success, error } = useToast();
  const { setTitle } = useHeader();

  // 페이지 상태 (기본정보, 휴대폰변경) - URL 파라미터 또는 props에서 가져옴
  const [currentStep, setCurrentStep] = useState<'profile' | 'phone'>(
    propCurrentStep === 'phone' ? 'phone' : 'profile'
  );
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // 프로필 이미지 관련 상태
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [verificationError, setVerificationError] = useState('');
  
  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // URL 파라미터 변경 시 currentStep 업데이트
  useEffect(() => {
    setCurrentStep(propCurrentStep === 'phone' ? 'phone' : 'profile');
  }, [propCurrentStep]);

  // 헤더 제목 업데이트
  useEffect(() => {
    const titles = {
      profile: '회원정보 수정',
      phone: '전화번호 변경'
    };
    setTitle(titles[currentStep]);
    
    // 컴포넌트 언마운트 시 제목 복원
    return () => {
      setTitle('설정');
    };
  }, [currentStep, setTitle]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImage(user.profileImage || '');
      setCurrentPhoneNumber(user.cellphone || '');
    }
  }, [user]);

  // 클릭 외부 감지로 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showImageDropdown && !(event.target as Element).closest('.profile-image-container')) {
        setShowImageDropdown(false);
      }
    };
    
    if (showImageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImageDropdown]);

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
      setEmailError('이메일을 입력해주세요.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('유효한 이메일 형식이 아닙니다.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateNewPhone = () => {
    if (!newPhoneNumber.trim()) {
      setPhoneError('새로운 휴대전화 번호를 입력해주세요.');
      return false;
    }
    // 11자리 숫자인지 확인
    const phoneRegex = /^[0-9]{11}$/;
    const cleanPhone = newPhoneNumber.replace(/[^0-9]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError('올바른 휴대전화 번호를 입력해주세요.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // 프로필 이미지 관련 함수들
  const handleImageClick = () => {
    setShowImageDropdown(!showImageDropdown);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
    setShowImageDropdown(false);
  };

  const handleSetDefaultImage = async () => {
    setShowImageDropdown(false);
    setIsUploadingImage(true);
    
    try {
      if (!user?.providerId) {
        error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const response = await googleLoginUpdate({
        providerId: user.providerId,
        name: user.name || '',
        email: user.email || '',
        profileImage: '/ai-estimate/no_profile.png', // 기본 이미지 경로로 설정
        cellphone: user.cellphone || '',
      }) as unknown as ApiResponse<GoogleLoginResponse>;

      if (response && response.data && response.data._id) {
        setUser({
          ...user,
          profileImage: '/ai-estimate/no_profile.png',
        });
        setProfileImage('/ai-estimate/no_profile.png');
        success('기본 이미지로 변경되었습니다.');
      } else {
        error('이미지 변경에 실패했습니다.');
      }
    } catch (err) {
      error('이미지 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('파일 크기는 5MB 이하만 가능합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploadingImage(true);
    
    try {
      // 파일 업로드
      const uploadResponse = await uploadFiles([file]);
      
      if (uploadResponse.statusCode === 200 && uploadResponse.data && uploadResponse.data.length > 0) {
        const uploadedImagePath = uploadResponse.data[0];
        // 환경변수를 사용하여 이미지 경로 설정
        const apiHost = import.meta.env.VITE_API_HOST || '';
        // API 호스트에 이미 /api가 포함되어 있는지 확인
        const hasApiPath = apiHost.includes('/api');
        const displayImagePath = hasApiPath 
          ? `${apiHost}/file/${uploadedImagePath}` 
          : `${apiHost}/api/file/${uploadedImagePath}`;
        
        if (!user?.providerId) {
          error('사용자 정보를 찾을 수 없습니다.');
          return;
        }

        // 프로필 업데이트
        const updateResponse = await googleLoginUpdate({
          providerId: user.providerId,
          name: user.name || '',
          email: user.email || '',
          profileImage: displayImagePath,
          cellphone: user.cellphone || '',
        }) as unknown as ApiResponse<GoogleLoginResponse>;

        if (updateResponse && updateResponse.data && updateResponse.data._id) {
          setUser({
            ...user,
            profileImage: displayImagePath,
          });
          setProfileImage(displayImagePath);
          success('프로필 이미지가 변경되었습니다.');
        } else {
          error('프로필 업데이트에 실패했습니다.');
        }
      } else {
        error('파일 업로드에 실패했습니다.');
      }
    } catch (err) {
      error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingImage(false);
      // 파일 인풋 초기화
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleStartPhoneChange = () => {
    setSearchParams({ edit: 'profile', step: 'phone' }, { replace: true });
    setNewPhoneNumber('');
    setVerificationCode('');
    setVerificationSent(false);
    setIsVerified(false);
    setVerifiedPhoneNumber('');
    setPhoneError('');
    setVerificationError('');
  };

  const handleBackToProfile = () => {
    setSearchParams({ edit: 'profile', step: 'profile' }, { replace: true });
    setNewPhoneNumber('');
    setVerificationCode('');
    setVerificationSent(false);
    setIsVerified(false);
    setVerifiedPhoneNumber('');
    setPhoneError('');
    setVerificationError('');
  };

  const handleSendVerification = async () => {
    if (!validateNewPhone()) return;
    
    // 인증받기 버튼을 누르면 기존 인증 정보 완전 초기화
    setVerifiedPhoneNumber('');
    setIsVerified(false);
    setVerificationCode('');
    setVerificationError('');
    setVerificationSent(false); // 잠시 false로 설정
    setIsSendingVerification(true);
    
    try {
      const cleanPhone = newPhoneNumber.replace(/[^0-9]/g, '');
      const response = await sendAuthCode(cleanPhone);
      if (response.statusCode === 200) {
        setVerificationSent(true);
        success('인증번호가 발송되었습니다.');
      } else {
        setVerificationError(response.error?.customMessage || '인증번호 발송에 실패했습니다.');
      }
    } catch (err) {
      console.error('인증번호 요청 에러:', err);
      setVerificationError('인증번호 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError('6자리 인증번호를 입력해주세요.');
      return;
    }

    setIsVerifyingCode(true);
    try {
      const cleanPhone = newPhoneNumber.replace(/[^0-9]/g, '');
      const response = await validateAuthCode(cleanPhone, verificationCode);
      if (response.statusCode === 200) {
        setIsVerified(true);
        setVerifiedPhoneNumber(cleanPhone);
        success('인증이 완료되었습니다.');
      } else {
        setVerificationError(response.error?.customMessage || '인증번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('인증번호 확인 에러:', error);
      setVerificationError('인증번호 확인 중 오류가 발생했습니다.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleUpdateProfile = async () => {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    
    if (!isNameValid || !isEmailValid) {
      error('입력 내용을 확인해주세요.');
      return;
    }

    // 휴대전화 변경 단계인 경우
    if (currentStep === 'phone') {
      if (!newPhoneNumber.trim()) {
        setPhoneError('새로운 휴대전화 번호를 입력해주세요.');
        return;
      }
      
      // 인증된 번호가 있고, 현재 입력된 번호와 다른 경우 모달 표시
      if (isVerified && verifiedPhoneNumber && newPhoneNumber.replace(/[^0-9]/g, '') !== verifiedPhoneNumber) {
        setShowConfirmModal(true);
        return;
      }
      
      // 인증된 번호가 없는 경우
      if (!isVerified || !verifiedPhoneNumber) {
        setVerificationError('휴대전화 인증을 완료해주세요.');
        return;
      }
    }

    setIsUpdating(true);
    
    try {
      // 휴대전화 변경이 있는 경우는 이미 인증이 완료된 상태
      if (!user?.providerId) {
        error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      if (currentStep === 'phone') {
        // 휴대전화 변경의 경우 인증된 번호로 업데이트
        await performPhoneUpdate(verifiedPhoneNumber);
      } else {
        // 프로필 정보 업데이트
        const response = await googleLoginUpdate({
          providerId: user.providerId,
          name: name,
          email: email,
          profileImage: profileImage,
          cellphone: user.cellphone || '',
        }) as unknown as ApiResponse<GoogleLoginResponse>;

        if (response && response.data && response.data._id) {
          setUser({
            ...user,
            name: name,
            email: email,
          });
          success('프로필이 업데이트되었습니다.');
          onBack?.();
        } else {
          error('프로필 업데이트에 실패했습니다.');
        }
      }
    } catch (err) {
      error('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWithdrawal = () => {
    // 회원탈퇴 확인 알림
    if (window.confirm('정말로 회원탈퇴를 하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      // 여기에 회원탈퇴 API 호출 로직 추가
      // withdrawalUser() 같은 API 함수 호출
      success('회원탈퇴가 완료되었습니다.');
      logout(); // 로그아웃 처리
      onBack?.(); // 이전 페이지로 이동
    }
  };

  // 모달 확인 핸들러 - 인증된 번호로 변경
  const handleConfirmVerifiedNumber = async () => {
    setShowConfirmModal(false);
    await performPhoneUpdate(verifiedPhoneNumber);
  };

  // 모달 취소 핸들러
  const handleCancelModal = () => {
    setShowConfirmModal(false);
  };

  // 실제 전화번호 업데이트 수행
  const performPhoneUpdate = async (phoneNumber: string) => {
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
        profileImage: profileImage,
        cellphone: phoneNumber,
      }) as unknown as ApiResponse<GoogleLoginResponse>;

      if (response && response.data && response.data._id) {
        setUser({
          ...user,
          name: name,
          email: email,
          cellphone: phoneNumber,
        });
        success('프로필이 업데이트되었습니다.');
        
        // 휴대전화 변경 완료 시 프로필 단계로 돌아가기
        setSearchParams({ edit: 'profile', step: 'profile' }, { replace: true });
        setCurrentPhoneNumber(phoneNumber);
        setNewPhoneNumber('');
        setVerificationCode('');
        setVerificationSent(false);
        setIsVerified(false);
        setVerifiedPhoneNumber('');
        
        onBack?.();
      } else {
        error('프로필 업데이트에 실패했습니다.');
      }
    } catch (err) {
      error('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const isFormValid = name.trim() !== '' && email.trim() !== '';

  // 뒤로가기 버튼 핸들러
  const handleBackButton = () => {
    if (currentStep === 'phone') {
      handleBackToProfile();
    } else {
      onBack?.();
    }
  };

  // 현재 경로가 /aiclient/heredot/ai가 아니면 상단에 뒤로가기 버튼 노출
  const locationPath = window.location.pathname;
  const showTopBackButton = !locationPath.includes('/aiclient/heredot/ai');

  return (
    <Container $isDarkMode={isDarkMode}>
      {showTopBackButton ? (
        <Header>
          <BackButton $isDarkMode={isDarkMode} onClick={handleBackButton}>
            <IoArrowBack size={20} />
            뒤로가기
          </BackButton>
          {/* <Title $isDarkMode={isDarkMode}>
            {currentStep === 'phone' ? '전화번호 변경' : '회원정보 수정'}
          </Title> */}
        </Header>
      ): <div style={{ height: '20px' }}></div> /* 헤더 높이만큼 빈 공간 */}
      <FormContainer>
        {currentStep === 'profile' ? (
          <>
            {/* 프로필 이미지 섹션 */}
            <ProfileImageSection>
              <ProfileImageContainer className="profile-image-container">
                <ProfileImage $isDarkMode={isDarkMode} onClick={handleImageClick}>
                  <img 
                    src={profileImage || '/ai-estimate/no_profile.png'} 
                    alt="프로필" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/ai-estimate/no_profile.png';
                    }}
                  />
                </ProfileImage>
                <CameraIcon $isDarkMode={isDarkMode} onClick={handleImageClick}>
                  <IoCamera size={16} />
                </CameraIcon>
                
                <DropdownMenu $isDarkMode={isDarkMode} $isOpen={showImageDropdown}>
                  <DropdownItem $isDarkMode={isDarkMode} onClick={handleImageUpload}>
                    사진 불러오기
                  </DropdownItem>
                  <DropdownItem $isDarkMode={isDarkMode} onClick={handleSetDefaultImage}>
                    기본 이미지로 설정
                  </DropdownItem>
                </DropdownMenu>
              </ProfileImageContainer>
            </ProfileImageSection>

            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            <Section>
              {/* <SectionTitle $isDarkMode={isDarkMode}>기본 정보</SectionTitle> */}
              
              <FormRow>
                <TextField
                  id="name"
                  label="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={validateName}
                  placeholder="이름을 입력하세요"
                  errorMessage={nameError}
                  isDarkMode={isDarkMode}
                />
              </FormRow>

              <FormRow>
                <TextField
                  id="email"
                  label="회사 이메일"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validateEmail}
                  placeholder="이메일을 입력하세요"
                  errorMessage={emailError}
                  isDarkMode={isDarkMode}
                />
              </FormRow>
            </Section>

            <Section>
              {/* <SectionTitle $isDarkMode={isDarkMode}>휴대전화</SectionTitle> */}
              
              <FormRow>
                <InputGroup>
                  <TextField
                    id="currentPhone"
                    label="전화번호"
                    value={currentPhoneNumber || '정보 없음'}
                    onChange={() => {}}
                    readOnly
                    isDarkMode={isDarkMode}
                  />
                  <ActionButton
                    $isDarkMode={isDarkMode}
                    $variant="secondary"
                    onClick={handleStartPhoneChange}
                  >
                    변경하기
                  </ActionButton>
                </InputGroup>
              </FormRow>
            </Section>

            <CompleteButton
              $isDarkMode={isDarkMode}
              onClick={handleUpdateProfile}
              disabled={!isFormValid || isUpdating || isUploadingImage}
            >
              {isUpdating ? '업데이트 중...' : isUploadingImage ? '이미지 업로드 중...' : '저장하기'}
            </CompleteButton>

            <WithdrawalButton
              $isDarkMode={isDarkMode}
              onClick={handleWithdrawal}
            >
              회원탈퇴
            </WithdrawalButton>
          </>
        ) : (
          <>
            {/* 휴대전화 변경 단계 */}
            <Section>
              {/* <SectionTitle $isDarkMode={isDarkMode}>새로운 휴대전화 번호</SectionTitle> */}
              
              <FormRow>
                <InputGroup>
                  <TextField
                    id="newPhone"
                    label="새로운 전화번호"
                    type="tel"
                    value={newPhoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 11) {
                        setNewPhoneNumber(value);
                        // 번호가 변경되어도 인증 상태는 유지 (인증받기 버튼을 눌러야만 리셋)
                      }
                    }}
                    onBlur={validateNewPhone}
                    placeholder="01012345678"
                    errorMessage={phoneError}
                    isDarkMode={isDarkMode}
                  />
                  <ActionButton
                    $isDarkMode={isDarkMode}
                    $variant="primary"
                    onClick={handleSendVerification}
                    disabled={!newPhoneNumber.trim() || newPhoneNumber.length !== 11 || isSendingVerification}
                  >
                    {isSendingVerification 
                      ? '전송 중...' 
                      : (isVerified && newPhoneNumber.replace(/[^0-9]/g, '') === verifiedPhoneNumber)
                        ? '인증완료' 
                        : verificationSent 
                          ? '재전송' 
                          : '인증받기'
                    }
                  </ActionButton>
                </InputGroup>
              </FormRow>

              {verificationSent && !isVerified && (
                <FormRow>
                  <InputGroup>
                    <TextField
                      id="verificationCode"
                      label="인증번호"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 6) {
                          setVerificationCode(value);
                          if (verificationError) setVerificationError('');
                        }
                      }}
                      placeholder="인증번호 6자리를 입력해주세요"
                      errorMessage={verificationError}
                      isDarkMode={isDarkMode}
                    />
                    <ActionButton
                      $isDarkMode={isDarkMode}
                      $variant="primary"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6 || isVerifyingCode}
                    >
                      {isVerifyingCode ? '확인 중...' : '인증하기'}
                    </ActionButton>
                  </InputGroup>
                </FormRow>
              )}
            </Section>

            <CompleteButton
              $isDarkMode={isDarkMode}
              onClick={handleUpdateProfile}
              disabled={!newPhoneNumber.trim() || isUpdating}
            >
              {isUpdating ? '변경 중...' : '휴대전화 변경 완료'}
            </CompleteButton>
          </>
        )}
      </FormContainer>
      
      {/* 확인 모달 */}
      {showConfirmModal && (
        <ModalOverlay onClick={handleCancelModal}>
          <ModalContainer $isDarkMode={isDarkMode} onClick={(e) => e.stopPropagation()}>
            <ModalTitle $isDarkMode={isDarkMode}>휴대전화 번호 확인</ModalTitle>
            <ModalMessage $isDarkMode={isDarkMode}>
              인증받으신 {verifiedPhoneNumber?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}로<br />
              변경하시겠습니까?
            </ModalMessage>
            <ModalButtons>
              <ModalButton
                $isDarkMode={isDarkMode}
                $variant="secondary"
                onClick={handleCancelModal}
              >
                취소
              </ModalButton>
              <ModalButton
                $isDarkMode={isDarkMode}
                $variant="primary"
                onClick={handleConfirmVerifiedNumber}
              >
                변경
              </ModalButton>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ProfileEditPage;
