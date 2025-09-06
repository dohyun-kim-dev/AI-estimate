"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import Icon from './Icon';
import TextareaAutosize from 'react-textarea-autosize';
import { customScrollbar } from '@/styles/commonStyles';
import { useAuthStore } from '@/store/authStore';
import { SocialLoginModal } from './SocialLoginModal';
import FileUploadSection from './FileUploadSection';
import { FileUploadData } from '@/firebase.functions';

// ProjectEstimate 인터페이스 정의
interface ProjectEstimate {
  // 견적 관련 필드들을 여기에 추가
  id?: string;
  // 다른 필요한 필드들...
}
import Modal from '@/components/common/Modal';
import TextField from '@/components/common/TextField';
import { CheckBox } from '@mui/icons-material';
import TermsAgreement from './TermsAgreement';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const InputWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.body};
  border-top: 1px solid ${({ theme }) => theme.border};
  z-index: 1000;
  width: 100%;
  @media (min-width: 1024px) {
    padding: 16px;
    max-width: 100vw;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 16px;
  background-color: ${({ theme }) => theme.body};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  width: 100%;
  min-height: 46px;
  transition: min-height 0.2s ease-in-out;
  @media (min-width: 1024px) {
    max-width: 1024px;
    margin: 0 auto;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    opacity: 0.8;
  }
`;

const AutoSizeInput = styled(TextareaAutosize)`
  flex: 1;
  display:flex;
  justify-content:center;
  align-items:center;
  background-color: transparent;
  font-size: 18px;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text};
  resize: none;
  overflow-y: auto;
  min-height: 21px;
  max-height: 300px;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1.5;
  font-family: inherit;
  &::placeholder {
    color: ${({ theme }) => theme.subtleText};
  }
  &:disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.subtleText};
  }
  ${customScrollbar({
     trackColor: '#262528',
  })}
`;

const RemainingCountText = styled.p`
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.subtleText};
  padding: 4px 16px 0;
`;

const FilePreviewArea = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Form = styled.form`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Disclaimer = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: #666666;
`;

const SubmitButton = styled.button`
  height: 44px;
  border-radius: 8px;
  background: #2D50FF;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  border: none;
  cursor: pointer;
  margin-top: 16px;
  &:hover {
    opacity: 0.9;
  }
`;

interface BottomInputProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  maxSubmissions?: number;
  onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  isProcessing: boolean;
  uploadedFiles: FileUploadData[];
  uploadProgress: number;
  onDeleteFile: (fileUri: string) => void;
  // ⭐️ 수정: onInfoSubmit이 인자를 2개 받도록 타입 변경
  onInfoSubmit: (userInfo: { name: string; email: string; cellphone: string }, estimateData: ProjectEstimate | null, chatSessionId: string) => void;
  // ⭐️ 추가: 견적 데이터와 채팅 세션 ID를 props로 받음
  estimateDataForConsult: ProjectEstimate | null;
  chatSessionId: string;
}

const BottomInput: React.FC<BottomInputProps> = ({
  placeholder = "서비스 종류와 주요 기능, 예상 기간/예산을 입력! \n예시: '온라인 쇼핑몰, 결제/배송/회원가입",
  onSubmit,
  maxSubmissions = 1,
  onFileInput,
  isUploading,
  isProcessing,
  uploadedFiles,
  uploadProgress,
  onDeleteFile,
  onInfoSubmit,
  estimateDataForConsult, // ⭐️ 추가
  chatSessionId, // ⭐️ 추가
}) => {
  const [value, setValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [remainingCount, setRemainingCount] = useState(maxSubmissions);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [loginModalPurpose, setLoginModalPurpose] = useState<'limitReached' | 'limitExceeded' | null>(null);
  const [userInfo, setUserInfo] = useState({ 
    name: '', 
    email: '', 
    cellphone: '',
    privacyAgreed: false,
    termsAgreed: false
  });
  const [hasUsedExtraCount, setHasUsedExtraCount] = useState(false);

  const remainingCountRef = useRef(remainingCount);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = useTheme();
  const isLightTheme = theme.body === '#FFFFFF';
  const { isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    remainingCountRef.current = remainingCount;
  }, [remainingCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      const checkAndResetCount = () => {
        let deviceId = localStorage.getItem('deviceId');
        let lastResetDate = localStorage.getItem('lastResetDate');
        const today = new Date().toDateString();

        if (!deviceId) {
          deviceId = generateUUID();
          localStorage.setItem('deviceId', deviceId);
        }

        if (lastResetDate !== today) {
          localStorage.setItem('lastResetDate', today);
          localStorage.setItem('remainingCount', String(maxSubmissions));
          localStorage.removeItem('hasUsedExtraCount');
          setRemainingCount(maxSubmissions);
          setHasUsedExtraCount(false);
        } else {
          const storedCount = localStorage.getItem('remainingCount');
          if (storedCount) {
            setRemainingCount(Number(storedCount));
          } else {
            localStorage.setItem('remainingCount', String(maxSubmissions));
            setRemainingCount(maxSubmissions);
          }
          const storedHasUsedExtraCount = localStorage.getItem('hasUsedExtraCount');
          setHasUsedExtraCount(storedHasUsedExtraCount === 'true');
        }
      };
      
      checkAndResetCount();
      const intervalId = setInterval(checkAndResetCount, 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [isLoggedIn, maxSubmissions]);

  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement === inputRef.current) {
        const visualViewport = window.visualViewport;
        if (visualViewport) {
          const isKeyboard = visualViewport.height < window.innerHeight;
          setIsKeyboardVisible(isKeyboard);
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      if (isLoggedIn) {
        onSubmit(value.trim());
        setValue('');
        return;
      }

      const storedCount = Number(localStorage.getItem('remainingCount') || maxSubmissions);
      
      if (storedCount > 0) {
        onSubmit(value.trim());
        setValue('');
        
        const newCount = storedCount - 1;
        setRemainingCount(newCount);
        localStorage.setItem('remainingCount', String(newCount));
      } else {
        if (hasUsedExtraCount) {
          setLoginModalPurpose('limitExceeded');
          setIsLoginModalOpen(true);
        } else {
          setLoginModalPurpose('limitReached');
          setIsLoginModalOpen(true);
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        if (e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
      } else {
        if (!e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      }
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const maxSizeMB = 20;
      const exceedsLimit = files.some(file => file.size > maxSizeMB * 1024 * 1024);

      if (exceedsLimit) {
        alert(`파일 크기가 ${maxSizeMB}MB를 초과했습니다.`);
        e.target.value = '';
        return;
      }
      
      if (onFileInput) {
        onFileInput(e);
      }
      e.target.value = '';
    }
  };

  const renderRemainingCountText = () => {
    if (isLoggedIn) {
      return null;
    }

    if (remainingCount > 0) {
      return `오늘 남은 횟수(비회원): ${remainingCount}회`;
    } else {
      return "비회원 사용 한도를 전부 사용하셨습니다";
    }
  };
  
  const handlePrimaryButtonClick = () => {
    setIsLoginModalOpen(false);
    if (loginModalPurpose === 'limitReached') {
      const newCount = 10;
      setRemainingCount(newCount);
      localStorage.setItem('remainingCount', String(newCount));
      localStorage.setItem('hasUsedExtraCount', 'true');
      setHasUsedExtraCount(true);
    } else if (loginModalPurpose === 'limitExceeded') {
      setIsInfoModalOpen(true);
    }
  };
  
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 입력값 및 약관 동의 확인
    if (!userInfo.name || !userInfo.email || !userInfo.cellphone) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }
    
    if (!userInfo.privacyAgreed || !userInfo.termsAgreed) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    if (onInfoSubmit) {
      onInfoSubmit(userInfo, estimateDataForConsult, chatSessionId);
    }
    console.log("정보 입력 후 견적 요청:", userInfo);
    setIsInfoModalOpen(false);
  };

  const handleGoogleLoginSuccess = async (tokenResponse: any) => {
    try {
      // 구글 로그인 성공 후 처리
      console.log('Google login success:', tokenResponse);
      
      // 로그인 성공 시 견적서 모달 표시를 위해 3초 대기
      // setTimeout(() => {
      //   setIsLoginModalOpen(false);
      //   if (loginModalPurpose === 'limitExceeded') {
      //     setIsInfoModalOpen(true);
      //   }
      // }, 3000);
      
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <>
      <InputWrapper style={{ 
        bottom: isKeyboardVisible ? window.visualViewport?.height - window.innerHeight : 0 
      }}>
        <FilePreviewArea>
          <FileUploadSection
            uploadedFiles={uploadedFiles}
            uploadProgress={uploadProgress}
            onDeleteFile={onDeleteFile}
            lang="ko"
          />
        </FilePreviewArea>

        <InputContainer>
        <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.hwp"
            disabled={isUploading || isProcessing}
          />
          <IconButton type="button" onClick={handleFileButtonClick} disabled={isUploading || isProcessing}>
            <Icon 
              src={isLightTheme ? "/ai-estimate/add_image.png" : "/ai-estimate/add_image_dark.png"} 
              width={36}
              height={36} 
            />
          </IconButton>
          <AutoSizeInput
            minRows={1}
            maxRows={12}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isUploading || isProcessing}
          />
          <IconButton type="button" onClick={handleSubmit}>
            <Icon 
              src={isLightTheme ? "/ai-estimate/enter.png" : "/ai-estimate/enter_dark.png"} 
              width={36} 
              height={36} 
            />
          </IconButton>
        </InputContainer>
        <RemainingCountText>
          {renderRemainingCountText()}
        </RemainingCountText>
      </InputWrapper>
      
      <SocialLoginModal
        $isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        purpose={loginModalPurpose || 'limitReached'}
        onPrimaryButtonClick={handlePrimaryButtonClick}
        onGoogleLoginSuccess={handleGoogleLoginSuccess}
      />
      
      <Modal 
        open={isInfoModalOpen} 
        title="발행자 정보 입력" 
        onClose={() => setIsInfoModalOpen(false)} 
        width={520}
      >
        <div style={{ fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
          {/* 더 자세한 견적 요청을 위해 정보를 입력해주세요. */}
          
        </div>
        <Form onSubmit={handleInfoSubmit}>
          <TextField id="name" label="이름" placeholder="이름을 입력해주세요" required value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} />
          <TextField id="email" label="이메일" type="email" placeholder="이메일을 입력해주세요" required value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} />
          <TextField id="phone" label="전화번호" placeholder="전화번호를 입력해주세요" required value={userInfo.cellphone} pattern="[0-9]{10,11}" type="tel" onChange={(e) => setUserInfo({...userInfo, cellphone: e.target.value})} />
          <TermsAgreement 
            onAgreeChange={(privacy, terms) => {
              setUserInfo(prev => ({
                ...prev,
                privacyAgreed: privacy,
                termsAgreed: terms
              }));
            }}
            initialPrivacyAgreed={userInfo.privacyAgreed}
            initialTermsAgreed={userInfo.termsAgreed}
          />
          <SubmitButton 
            type="submit" 
            disabled={!userInfo.privacyAgreed || !userInfo.termsAgreed}
          >
            완료하기
          </SubmitButton>
        </Form>
      </Modal>
    </>
  );
};

export default BottomInput;