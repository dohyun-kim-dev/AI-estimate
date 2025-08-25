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
import React from 'react';
interface PageLoaderProps {
    isOpen: boolean;
    customUI?: React.ReactNode;
}
declare const PageLoader: ({ isOpen, customUI }: PageLoaderProps) => React.ReactPortal | null;
export default PageLoader;
