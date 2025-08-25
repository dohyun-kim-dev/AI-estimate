import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PageLoader.tsx
 *
 * 페이지 전체를 덮는 로딩 컴포넌트로, 비동기 처리 중 사용자 입력(버튼 클릭, 입력 등)을 차단합니다.
 * 포털(Portal)을 이용해 DOM의 최상단(body)에 렌더링되며, 기본 스피너 또는 커스텀 UI를 지원합니다.
 * 기본적으로 Api 호출 시 open, close를 통해 로딩 상태를 관리합니다.
 *
 * PageLoader is a full-screen loading component designed to block all user interaction
 * (e.g., button clicks, typing) during asynchronous operations such as API calls.
 * It renders into the document body using a React Portal, and supports both default and custom UIs.
 * By default, it manages the loading state through open and close methods.
 */
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
// 기본 스피너 UI 구성 | Default loading spinner
const DefaultLoader = () => (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: `4px solid ${AppColors.primary}`,
                borderTop: `4px solid transparent`,
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
            } }), _jsx("p", { style: { ...AppTextStyles.body2, color: AppColors.onBackground }, children: "\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694... " }), _jsx("style", { children: `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    ` })] }));
// 메인 로딩 컴포넌트 | Main loading overlay component
const PageLoader = ({ isOpen, customUI }) => {
    // 로딩 상태일 때 스크롤 차단 | Prevent body scroll while loading
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = ''; // 컴포넌트 언마운트 시 초기화
        };
    }, [isOpen]);
    // 클라이언트에서만 렌더링되도록 | Only render on client
    if (!isOpen || typeof window === 'undefined')
        return null;
    return ReactDOM.createPortal(_jsx("div", { style: {
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.2)', // 반투명 오버레이 | translucent overlay
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'auto', // ✅ 이벤트 차단의 핵심 | This blocks interaction underneath
        }, children: _jsx("div", { style: { pointerEvents: 'none' }, children: customUI || _jsx(DefaultLoader, {}) }) }), document.body // ✅ 포털로 body 최상단에 렌더링 | Render on top layer using portal
    );
};
export default PageLoader;
