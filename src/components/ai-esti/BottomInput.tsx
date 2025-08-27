import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import Icon from './Icon';
import TextareaAutosize from 'react-textarea-autosize';
import { customScrollbar } from '@/styles/commonStyles';
import { useAuthStore } from '@/store/authStore';
import { SocialLoginModal } from './SocialLoginModal';

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
  ${({ theme }) => theme.body2};
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.subtleText};
  padding: 4px 16px 0;
`;

interface BottomInputProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  maxSubmissions?: number;
}
const BottomInput: React.FC<BottomInputProps> = ({
  placeholder = "서비스 종류와 주요 기능, 예상 기간/예산을 입력! \n예시: '온라인 쇼핑몰, 결제/배송/회원가입",
  onSubmit,
  maxSubmissions = 30
}) => {
  const [value, setValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [remainingCount, setRemainingCount] = useState(maxSubmissions);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const remainingCountRef = useRef(remainingCount);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isLightTheme = theme.body === '#FFFFFF';
  const { isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    remainingCountRef.current = remainingCount;
  }, [remainingCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      // ⭐️ 비회원 횟수 초기화 로직을 함수로 분리
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

      checkAndResetCount(); // 컴포넌트 마운트 시 한 번 실행

      // ⭐️ 1시간마다 초기화 함수를 실행하는 인터벌 설정
      const intervalId = setInterval(checkAndResetCount, 60 * 60 * 1000); // 1시간 = 60분 * 60초 * 1000밀리초

      return () => clearInterval(intervalId); // 클린업 함수
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
        // 모바일 환경
        if (e.shiftKey) {
            // 모바일에서 Shift+Enter는 제출
            e.preventDefault();
            handleSubmit();
        } else {
            // 모바일에서 Enter는 줄바꿈 (기본 동작)
        }
      } else {
        // PC 환경
        if (e.shiftKey) {
          // PC에서 Shift + Enter는 줄바꿈 (기본 동작)
        } else {
          // PC에서 Enter만 누르면 제출
          e.preventDefault();
          handleSubmit();
        }
      }
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

  return (
    <>
      <InputWrapper style={{ 
        bottom: isKeyboardVisible ? window.visualViewport?.height - window.innerHeight : 0 
      }}>
        <InputContainer>
          <IconButton type="button">
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