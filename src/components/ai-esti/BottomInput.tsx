"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import Icon from './Icon';
import TextareaAutosize from 'react-textarea-autosize';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore'; // 추가: chatStore import
import { useUsageStore } from '@/store/usageStore';
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
    fe: string; // 프론트엔드 개발 여부
    be: string; // 백엔드 개발 여부
    page_count: number; // 페이지 수
    is_deleted?: boolean;
}

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
  transition: bottom 0.3s ease;
  
  @media (min-width: 1024px) {
    padding: 16px;
    max-width: 100vw;
    left: 50%;
    transform: translateX(-50%);
  }

  /* iOS 전용 스타일 */
  @supports (-webkit-touch-callout: none) {
    /* iOS에서만 적용되는 스타일 */
    -webkit-overflow-scrolling: touch;
  }
`;

const InputContainer = styled.div<{ $isIOS?: boolean }>`
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
  
  /* iOS 전용 텍스트 선택 활성화 */
  ${({ $isIOS }) => $isIOS && `
    -webkit-user-select: text;
    -webkit-touch-callout: default;
    user-select: text;
  `}
  
  /* 안드로이드 및 기타 플랫폼용 기본 설정 */
  ${({ $isIOS }) => !$isIOS && `
    -webkit-user-select: text;
    user-select: text;
  `}
  
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

const AutoSizeInput = styled(TextareaAutosize)<{ $isIOS?: boolean }>`
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

  /* iOS 전용 텍스트 선택 활성화 */
  ${({ $isIOS }) => $isIOS && `
    -webkit-user-select: text !important;
    -webkit-touch-callout: default !important;
    -webkit-appearance: none;
    transform: translateZ(0);
    user-select: text;
    touch-action: manipulation;
  `}

  /* 안드로이드 및 기타 플랫폼용 기본 설정 */
  ${({ $isIOS }) => !$isIOS && `
    -webkit-user-select: text;
    user-select: text;
    touch-action: auto;
  `}

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
  onSubmit?: (value: string, options?: { displayMessage?: string; abortSignal?: AbortSignal; chatHistory?: Array<{role: 'user' | 'model'; content: string}> }) => Promise<void>;
  onPaste?: (e: React.ClipboardEvent) => Promise<void>; // 🔥 이미지 붙여넣기 prop 추가
  maxSubmissions?: number;
  onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  // isProcessing: boolean; // 제거: store에서 가져올 예정
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
  onUsageCheck?: () => { canProceed: boolean; showModal: boolean; modalPurpose: 'limitReached' | 'limitExceeded' }; // 추가: 사용량 체크
}


const BottomInput: React.FC<BottomInputProps> = ({
  placeholder = "서비스 종류와 주요 기능, 예상 기간/예산을 입력! \n예시: '온라인 쇼핑몰, 결제/배송/회원가입",
  onSubmit,
  onPaste, // 🔥 이미지 붙여넣기 함수
  maxSubmissions = 10,
  onFileInput,
  isUploading,
  // isProcessing 제거: store에서 가져올 예정
  uploadedFiles,
  uploadProgress,
  onDeleteFile,
  onInfoSubmit,
  estimateDataForConsult,
  chatSessionId,
  onRestoreInput,
  onStopStreaming,
  onUsageCheck
}) => {
  const [value, setValue] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [loginModalPurpose, setLoginModalPurpose] = useState<'limitReached' | 'limitExceeded' | null>(null);

  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const remainingCountRef = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = useTheme();
  const isLightTheme = theme.body === '#FFFFFF';
  const { isAuthenticated } = useAuthStore();
  const { isProcessing, updateLastMessage, clearAllLoadingMessages, removeIncompleteEstimateMessages, setIsCrawlingUrl } = useChatStore(); // 추가: store에서 isProcessing과 setIsCrawlingUrl 가져오기
  const {
    remainingCount,
    hasUsedExtraCount,
    decreaseCount,
    addExtraCount,
    checkAndResetIfNewDay 
  } = useUsageStore();
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    remainingCountRef.current = remainingCount;
  }, [remainingCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      checkAndResetIfNewDay();
    }
  }, [isLoggedIn, checkAndResetIfNewDay]);

  // 스트리밍 시작 시 AbortController 생성, onSubmit에 전달 필요
  const lastInputRef = useRef('');

  const handleSubmit = async () => {
  // value가 null일 경우 빈 문자열로 처리
  const safeValue = value === null ? '' : value;
  if ((safeValue.trim() || uploadedFiles.length > 0) && onSubmit) {
    lastInputRef.current = safeValue;
    setValue('');
    if (abortController) abortController.abort();
    const newAbort = new AbortController();
    setAbortController(newAbort);

    // chatStore에서 현재 메시지 배열 가져오기
    const { messages } = useChatStore.getState();

    // 항상 스토어의 히스토리를 사용하여 액션 버튼과 바텀 인풋이 동일하게 처리됨
    console.log("현재 메시지 개수:", messages.length);

    try {
      if (isLoggedIn) {
        await onSubmit(
          lastInputRef.current.trim(),
          {
            abortSignal: newAbort.signal
          }
        );
        return;
      }

      if (remainingCount > 0) {
        // 🔥 사용량을 먼저 차감하고 오류 시 복구하도록 변경
        decreaseCount();
        try {
          await onSubmit(
            lastInputRef.current.trim(),
            {
              abortSignal: newAbort.signal
            }
          );
        } catch (submitError) {
          // onSubmit에서 오류 발생 시 재throw하여 외부 catch에서 처리
          throw submitError;
        }
      } else {
        setValue(lastInputRef.current);
        if (hasUsedExtraCount) {
          setLoginModalPurpose('limitExceeded');
          setIsLoginModalOpen(true);
        } else {
          setLoginModalPurpose('limitReached');
          setIsLoginModalOpen(true);
        }
      }
    } catch (error: any) {
      // 🔥 AI 오류 발생 시 입력값 복원 처리
      if (error?.shouldRestoreInput && error?.originalInput) {
        console.log('🔄 AI 오류로 인한 입력값 복원:', error.originalInput);
        setValue(error.originalInput);
        
        // 비회원인 경우 차감된 사용량은 이미 useChatActions에서 복구됨
        console.log('🔄 사용량은 자동으로 복구되었습니다.');
      } else {
        // 일반적인 에러의 경우 입력값 복원
        console.log('🔄 일반 오류로 인한 입력값 복원:', lastInputRef.current);
        setValue(lastInputRef.current);
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
    
    // URL 크롤링 상태 해제
    setIsCrawlingUrl(false);
    
    // 🔥 AI 스트리밍 중단 신호 전송
    if (abortController) {
      console.log('🛑 AI 스트리밍 중단 신호 전송');
      abortController.abort();
      setAbortController(null);
    }
    
    if (onStopStreaming) {
      onStopStreaming();
    }
    clearAllLoadingMessages(); // 모든 로딩 메시지 꺼줌
    removeIncompleteEstimateMessages(); 
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
    
    // iOS에서 키보드가 완전히 내려갈 때까지 대기 후 파일 선택 실행
    if (isIOS && window.visualViewport) {
      // visualViewport를 지원하는 경우 실제 뷰포트 변화 감지
      const initialHeight = window.visualViewport.height;
      
      const checkKeyboardClosed = () => {
        if (window.visualViewport && window.visualViewport.height >= initialHeight) {
          // 키보드가 완전히 내려갔을 때
          setTimeout(() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }, 100);
        } else {
          // 아직 키보드가 내려가는 중이면 다시 체크
          setTimeout(checkKeyboardClosed, 50);
        }
      };
      
      // 50ms 후에 체크 시작 (blur 이벤트 처리 후)
      setTimeout(checkKeyboardClosed, 50);
    } else {
      // visualViewport를 지원하지 않거나 iOS가 아닌 경우 기존 방식 사용
      const delay = isIOS ? 1000 : 100;
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, delay);
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
      addExtraCount();
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

  // 사용량 체크 함수 (외부에서 호출 가능)
  const checkUsage = () => {
    if (isLoggedIn) {
      return { canProceed: true, showModal: false, modalPurpose: 'limitReached' };
    }
    
    if (remainingCount > 0) {
      return { canProceed: true, showModal: false, modalPurpose: 'limitReached' };
    } else {
      const purpose = hasUsedExtraCount ? 'limitExceeded' : 'limitReached';
      return { canProceed: false, showModal: true, modalPurpose: purpose };
    }
  };

  // onUsageCheck prop으로 전달될 수 있도록 useEffect로 설정
  useEffect(() => {
    if (onUsageCheck) {
      // onUsageCheck 함수를 외부에서 호출할 수 있도록 설정하는 로직이 필요하다면 여기에 구현
    }
  }, [onUsageCheck]);

  // iOS 감지
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
      <InputWrapper>
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
        <InputContainer $isIOS={isIOS}>
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
            ref={inputRef}
            minRows={1}
            maxRows={12}
            placeholder={placeholder}
            value={value === null ? '' : value}
            onChange={(e) => setValue(e.target.value === null ? '' : e.target.value)}
            onKeyDown={handleKeyPress}
            onPaste={onPaste} // 🔥 이미지 붙여넣기 이벤트 연결
            disabled={isUploading || isProcessing}
            $isIOS={isIOS} // iOS 감지 prop 전달
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
