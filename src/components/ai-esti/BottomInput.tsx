"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import Icon from './Icon';
import TextareaAutosize from 'react-textarea-autosize';
import { useAuthStore } from '@/store/authStore';
import { SocialLoginModal } from './SocialLoginModal';
import FileUploadSection from './FileUploadSection';
import { FileUploadData } from '@/firebase.functions';
import IssuerInfoModal, { IssuerInfo } from "@/components/ai-esti/IssuerInfoModal";


export interface ProjectEstimate {
    project_name: string;
    total_price: string;
    vat_included_price: string;
    estimated_period: string;
    categories: Category[];
}
export interface Category {
    category_name: string;
    sub_categories: SubCategory[];
}
export interface SubCategory {
    sub_category_name: string;
    items: EstimateItem[];
}
export interface EstimateItem {
    name: string;
    price: string;
    description: string;
    is_deleted?: boolean;
}


const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const InputWrapper = styled.div`
  position: fixed;
  bottom: 200px;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.body};
  border-top: 1px solid ${({ theme }) => theme.border};
    // padding-bottom: env(safe-area-inset-bottom);
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

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.surface1};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.subtleText};
  }
`;

const RemainingCountText = styled.p`
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.subtleText};
  padding: 4px 16px 0;
`;

const FilePreviewContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0;
  max-width: 100%;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.border} transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.subtleText};
  }
`;

interface BottomInputProps {
  placeholder?: string;
  onSubmit?: (value: string, options?: { displayMessage?: string; abortSignal?: AbortSignal }) => Promise<void>;
  onPaste?: (e: React.ClipboardEvent) => Promise<void>; // 🔥 이미지 붙여넣기 prop 추가
  maxSubmissions?: number;
  onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  isProcessing: boolean;
  uploadedFiles: FileUploadData[];
  uploadProgress: number;
  onDeleteFile: (fileUri: string) => void;
  onInfoSubmit: (
    userInfo: { name: string; email: string; cellphone: string },
    estimateData: ProjectEstimate | null,
    chatSessionId: string
  ) => void;
  estimateDataForConsult: ProjectEstimate | null;
  chatSessionId: string;
  onRestoreInput?: (value: string) => void; // 추가: 인풋 복원 콜백
  onStopStreaming?: () => void; // 추가: 정지 버튼 콜백
}


const BottomInput: React.FC<BottomInputProps> = ({
  placeholder = "서비스 종류와 주요 기능, 예상 기간/예산을 입력! \n예시: '온라인 쇼핑몰, 결제/배송/회원가입",
  onSubmit,
  onPaste, // 🔥 이미지 붙여넣기 함수
  maxSubmissions = 10,
  onFileInput,
  isUploading,
  isProcessing,
  uploadedFiles,
  uploadProgress,
  onDeleteFile,
  onInfoSubmit,
  estimateDataForConsult,
  chatSessionId,
  onRestoreInput,
  onStopStreaming
}) => {
  const [value, setValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [remainingCount, setRemainingCount] = useState(maxSubmissions);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [loginModalPurpose, setLoginModalPurpose] = useState<'limitReached' | 'limitExceeded' | null>(null);
  const [hasUsedExtraCount, setHasUsedExtraCount] = useState(false);

  const [abortController, setAbortController] = useState<AbortController | null>(null); // 추가

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
          // 하루가 바뀌면 hasUsedExtraCount도 false로 초기화
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

  // 스트리밍 시작 시 AbortController 생성, onSubmit에 전달 필요
  const lastInputRef = useRef('');
  const handleSubmit = async () => {
    if ((value.trim() || uploadedFiles.length > 0) && onSubmit) {
      lastInputRef.current = value;
      // 전송 버튼 누르자마자 인풋 텍스트와 파일 미리보기 지우기
      setValue('');
      
      // 스트리밍 시작 시 AbortController 새로 생성
      if (abortController) {
        abortController.abort();
      }
      const newAbort = new AbortController();
      setAbortController(newAbort);

      if (isLoggedIn) {
        await onSubmit(lastInputRef.current.trim(), { abortSignal: newAbort.signal });
        return;
      }

      const storedCount = Number(localStorage.getItem('remainingCount') || maxSubmissions);
      if (storedCount > 0) {
        await onSubmit(lastInputRef.current.trim(), { abortSignal: newAbort.signal });
        const newCount = storedCount - 1;
        setRemainingCount(newCount);
        localStorage.setItem('remainingCount', String(newCount));
      } else {
        // 횟수가 부족해서 전송하지 못한 경우 텍스트 복원
        setValue(lastInputRef.current);
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

  // 정지 버튼 클릭 시 abort
  const handleStopStreaming = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      // 인풋 복원 콜백이 있으면 실행
      if (onRestoreInput) {
        onRestoreInput(lastInputRef.current);
      } else {
        setValue(lastInputRef.current);
      }
    }
    if (onStopStreaming) {
      onStopStreaming();
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
    // 아이폰 등 모바일에서 키보드 내리기
    if (inputRef.current) {
      inputRef.current.blur();
    }
    // 약간의 딜레이 후 파일 입력 클릭 (키보드가 완전히 내려간 후)
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
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
  
  const handleIssuerInfoSubmit = (info: IssuerInfo) => {
    onInfoSubmit(info, estimateDataForConsult, chatSessionId);
    console.log("정보 입력 후 견적 요청:", info);
    setIsInfoModalOpen(false);
  };

  const handleGoogleLoginSuccess = async (tokenResponse: any) => {
    try {
      console.log('Google login success:', tokenResponse);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <>
      <InputWrapper style={{ 
        bottom: isKeyboardVisible ? window.visualViewport?.height - window.innerHeight : 0 
      }}>
        {uploadedFiles.length > 0 && (
          <FilePreviewContainer>
            <FileUploadSection
              uploadedFiles={uploadedFiles}
              uploadProgress={uploadProgress}
              onDeleteFile={onDeleteFile}
              lang="ko"
            />
          </FilePreviewContainer>
        )}
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
            onPaste={onPaste} // 🔥 이미지 붙여넣기 이벤트 연결
            disabled={isUploading || isProcessing}
          />
          {/* isProcessing이 아닐 때만 서밋(엔터) 아이콘 노출 */}
          {!isProcessing && (
            <IconButton type="button" onClick={handleSubmit}>
              <Icon 
                src={isLightTheme ? "/ai-estimate/enter.png" : "/ai-estimate/enter_dark.png"} 
                width={36} 
                height={36} 
              />
            </IconButton>
          )}
          {/* 스트리밍 중일 때만 정지 버튼 노출 */}
          {isProcessing && (
            <IconButton type="button" onClick={handleStopStreaming}>
              <Icon src={isLightTheme ? "/ai-estimate/stop.png" : "/ai-estimate/stop_dark.png"}  width={36} height={36} />
            </IconButton>
          )}
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
      
      <IssuerInfoModal
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSubmit={handleIssuerInfoSubmit}
      />
    </>
  );
};

export default BottomInput;
