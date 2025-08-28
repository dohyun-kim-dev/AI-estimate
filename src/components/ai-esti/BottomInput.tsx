'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import Icon from './Icon';
import TextareaAutosize from 'react-textarea-autosize';
import { customScrollbar } from '@/styles/commonStyles';
import { useAuthStore } from '@/store/authStore';
import { SocialLoginModal } from './SocialLoginModal';
import FileUploadSection from './FileUploadSection'; // ⭐️ 추가: 파일 업로드 섹션 컴포넌트 임포트
import { FileUploadData } from '@/lib/firebase/firebase.functions'; // ⭐️ 추가: 파일 업로드 데이터 타입 임포트

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
  // height: 46px;
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

// ⭐️ 추가: 파일 미리보기가 나타날 영역을 위한 스타일
const FilePreviewArea = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 16px;
`;


interface BottomInputProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  maxSubmissions?: number;
  onFilesChange: (files: File[]) => void;
  isUploading: boolean;
  isProcessing: boolean;
}

const BottomInput: React.FC<BottomInputProps> = ({
  placeholder = "서비스 종류와 주요 기능, 예상 기간/예산을 입력! \n예시: '온라인 쇼핑몰, 결제/배송/회원가입",
  onSubmit,
  maxSubmissions = 30,
  onFilesChange,
  isUploading,
  isProcessing,
}) => {
  const [value, setValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [remainingCount, setRemainingCount] = useState(maxSubmissions);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const remainingCountRef = useRef(remainingCount);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ⭐️ 추가: 파일 업로드 상태 관리
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadData[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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
          setRemainingCount(maxSubmissions);
        } else {
          const storedCount = localStorage.getItem('remainingCount');
          if (storedCount) {
            setRemainingCount(Number(storedCount));
          } else {
            localStorage.setItem('remainingCount', String(maxSubmissions));
            setRemainingCount(maxSubmissions);
          }
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

      if (remainingCountRef.current > 0) {
        onSubmit(value.trim());
        setValue('');
        
        const newCount = remainingCountRef.current - 1;
        setRemainingCount(newCount);
        localStorage.setItem('remainingCount', String(newCount));
      } else {
        setIsLoginModalOpen(true);
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
      
      // ⭐️ 변경: 부모 컴포넌트로 파일을 전달하고, 이곳에서 미리보기 상태를 관리합니다.
      const newFilesData = files.map(file => ({
        fileUri: URL.createObjectURL(file), // 임시 URL 생성
        name: file.name,
        size: file.size,
        mimeType: file.type,
      }));
      setUploadedFiles(prev => [...prev, ...newFilesData]);
      onFilesChange(files);

      e.target.value = '';
    }
  };

  const handleDeleteFile = (fileUriToDelete: string) => {
    setUploadedFiles(prev => prev.filter(file => file.fileUri !== fileUriToDelete));
    // ⭐️ TODO: 실제 업로드된 파일의 경우, Firebase Storage에서 삭제하는 로직을 추가해야 합니다.
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

  return (
    <>
      <InputWrapper style={{ 
        bottom: isKeyboardVisible ? window.visualViewport?.height - window.innerHeight : 0 
      }}>
        {/* ⭐️ 추가: 파일 미리보기 및 진행률 섹션 */}
        <FilePreviewArea>
          <FileUploadSection
            uploadedFiles={uploadedFiles}
            uploadProgress={uploadProgress}
            onDeleteFile={handleDeleteFile}
            lang="ko" // 필요에 따라 언어 설정
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
      />
    </>
  );
};

export default BottomInput;