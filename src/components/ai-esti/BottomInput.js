import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import Icon from './Icon';
import TextareaAutosize from 'react-textarea-autosize';
import { customScrollbar } from '@/styles/commonStyles';
import { useAuthStore } from '@/store/authStore'; // AuthStore import
import { SocialLoginModal } from './SocialLoginModal'; // SocialLoginModal import
// UUID 생성 함수 (v4)
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
const InputWrapper = styled.div `
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
const InputContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.body};
  border-radius: 50px;
  border: 1px solid ${({ theme }) => theme.border};
  width: 100%;
  min-height: 56px;
  transition: min-height 0.2s ease-in-out;
  @media (min-width: 1024px) {
    max-width: 1024px;
    margin: 0 auto;
  }
`;
const IconButton = styled.button `
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
const AutoSizeInput = styled(TextareaAutosize) `
  flex: 1;
  display:flex;
  justify-content:center;
  align-items:center;
  background-color: transparent;
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
const RemainingCountText = styled.p `
  ${({ theme }) => theme.body2};
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.subtleText};
  padding: 4px 16px 0;
`;
const BottomInput = ({ placeholder = "서비스 종류와 주요 기능, 예상 기간/예산을 입력! \n예시: '온라인 쇼핑몰, 결제/배송/회원가입", onSubmit, maxSubmissions = 5 }) => {
    const [value, setValue] = useState('');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [remainingCount, setRemainingCount] = useState(maxSubmissions);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 👈 로그인 모달 상태 추가
    const remainingCountRef = useRef(remainingCount);
    const inputRef = useRef(null);
    const theme = useTheme();
    const isLightTheme = theme.body === '#FFFFFF';
    // useAuthStore를 사용하여 로그인 상태 가져오기
    const { isAuthenticated } = useAuthStore();
    const isLoggedIn = isAuthenticated();
    useEffect(() => {
        remainingCountRef.current = remainingCount;
    }, [remainingCount]);
    useEffect(() => {
        // 로그인 상태가 아닐 때만 횟수 로직 실행
        if (!isLoggedIn) {
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
            }
            else {
                const storedCount = localStorage.getItem('remainingCount');
                if (storedCount) {
                    setRemainingCount(Number(storedCount));
                }
                else {
                    localStorage.setItem('remainingCount', String(maxSubmissions));
                    setRemainingCount(maxSubmissions);
                }
            }
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
            // 로그인 상태인 경우, 횟수 제한 없이 바로 제출
            if (isLoggedIn) {
                onSubmit(value.trim());
                setValue('');
                return;
            }
            // 비회원이고 횟수가 남아있는 경우
            if (remainingCountRef.current > 0) {
                onSubmit(value.trim());
                setValue('');
                const newCount = remainingCountRef.current - 1;
                setRemainingCount(newCount);
                localStorage.setItem('remainingCount', String(newCount));
            }
            else {
                // 비회원이고 횟수가 0인 경우, 로그인 모달 열기
                setIsLoginModalOpen(true);
            }
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    const renderRemainingCountText = () => {
        if (isLoggedIn) {
            return null; // 로그인 상태일 때 텍스트 숨김
        }
        if (remainingCount > 0) {
            return `오늘 남은 횟수(비회원): ${remainingCount}회`;
        }
        else {
            return "비회원 사용 한도를 전부 사용하셨습니다. 간편 구글 로그인으로 즐겨보세요";
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs(InputWrapper, { style: {
                    bottom: isKeyboardVisible ? window.visualViewport?.height - window.innerHeight : 0
                }, children: [_jsxs(InputContainer, { children: [_jsx(IconButton, { type: "button", children: _jsx(Icon, { src: isLightTheme ? "/ai-estimate/add_image.png" : "/ai-estimate/add_image_dark.png", width: 36, height: 36 }) }), _jsx(AutoSizeInput, { minRows: 1, maxRows: 12, placeholder: placeholder, value: value, onChange: (e) => setValue(e.target.value), onKeyDown: handleKeyPress }), _jsx(IconButton, { type: "button", onClick: handleSubmit, children: _jsx(Icon, { src: isLightTheme ? "/ai-estimate/enter.png" : "/ai-estimate/enter_dark.png", width: 36, height: 36 }) })] }), _jsx(RemainingCountText, { children: renderRemainingCountText() })] }), _jsx(SocialLoginModal, { "$isOpen": isLoginModalOpen, onClose: () => setIsLoginModalOpen(false) })] }));
};
export default BottomInput;
