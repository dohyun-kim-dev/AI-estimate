'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@contexts/AdminAuthContext';
import { useDevice } from '@contexts/DeviceContext';
import { THEME_COLORS } from '@styles/theme_colors';
import { useToast } from '../../components/common/ToastProvider';
// Import components
import ResponsiveSidebar from '@components/CustomSidebar/ResponsiveSidebar';
import CustomSidebarHeader from '@components/CustomSidebar/CustomSidebarHeader';
import type { MenuItemConfig } from '@components/CustomSidebar/CustomSidebar';
import {
  AdminIcon,
  UserIcon,
  AIDataIcon,
  CustomerDataIcon,
  FAQIcon, 
  TermsIcon,
  LogoutIcon,
} from '@/components/icons/AdminMenuIcons';
import ScrollAwareWrapper from '@layout/ScrollAwareWrapper';
import PageWrapper from '@components/PageWrapper';
import { devLog } from '@/utils/devLogger';
import { useThemeStore } from '@/store/themeStore';

export default function CompanyCMSLayout() {
  return (
    <AdminAuthProvider>
      <ProtectedCompanyCMSLayout />
    </AdminAuthProvider>
  );
}

function ProtectedCompanyCMSLayout() {
  const { isLoggedIn, ready, logout, isRoot } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { show: showToast } = useToast(); // 토스트 훅 추가

  const { companyCode } = useParams<{ companyCode: string }>();
  const device = useDevice();
  const isLoginPage = location.pathname.includes(`/cms/login`);
  const isPdfPreviewPage = location.pathname.includes('/cms/pdf-preview');
  const isExcelPreviewPage = location.pathname.includes('/cms/excel-preview');
  const isPromptDetailPage = location.pathname.includes('/cms/prompt-detail');

  // 🔥 고객사 CMS는 항상 라이트 모드 강제
  useEffect(() => {
    useThemeStore.setState({ isDarkMode: false });
  }, []);

  useEffect(() => {
    if (ready && !isLoggedIn && !isLoginPage && !isPdfPreviewPage && !isExcelPreviewPage && !isPromptDetailPage) {
      navigate(`/${companyCode}/cms/login`, { replace: true });
    } else if (ready && isLoggedIn && location.pathname === `/${companyCode}/cms`) {
      // 대시보드 대신 관리자 관리로 이동
      navigate(`/${companyCode}/cms/admin-management`, { replace: true });
    }
  }, [ready, isLoggedIn, isLoginPage, isPdfPreviewPage, isExcelPreviewPage, isPromptDetailPage, location.pathname, navigate, companyCode]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate(`/${companyCode}/cms/login`, { replace: true });
    console.log('handleLogout LayoutPage 로그아웃 되었습니다');
    showToast('로그아웃 되었습니다','success');
  };

  const effectiveSidebarExpanded = useMemo(
    () => (device === 'mobile' ? isMobileSidebarOpen : !isCollapsed),
    [device, isMobileSidebarOpen, isCollapsed]
  );
  
  const initialOpenMenus = JSON.parse(localStorage.getItem('openMenus') || '{}');
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>(initialOpenMenus);

  const handleMenuToggle = (menuId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  useEffect(() => {
    localStorage.setItem('openMenus', JSON.stringify(openMenus));
  }, [openMenus]);

  React.useEffect(() => {
    devLog('🏢 [CompanyCMSLayout] 고객사 CMS 레이아웃 로드됨:', {
      companyCode,
      currentPath: window.location.pathname,
      isRoot,
      isLoggedIn
    });
  }, [companyCode, isRoot, isLoggedIn]);

  // 고객사 CMS 전용 메뉴 구성 (대시보드 제외)
  const menuItems: MenuItemConfig[] = [
    // 대시보드는 주석 처리
    // { id: 'dashboard', icon: <DashboardIcon />, title: '대시보드', path: `/${companyCode}/cms` },
    { id: 'admin', icon: <AdminIcon />, title: '관리자 관리', path: `/${companyCode}/cms/admin-management` },
    { id: 'user', icon: <UserIcon />, title: '사용자 관리', path: `/${companyCode}/cms/user-management` },
    {
      id: 'ai-data',
      icon: <AIDataIcon />,
      title: 'AI 데이터',
      path: `/${companyCode}/cms/ai-data`,
      subMenu: [
        // { id: 'survey', title: '설문조사', path: `/${companyCode}/cms/ai-data/survey` },
        { id: 'prompt', title: 'AI 프롬프트 관리', path: `/${companyCode}/cms/ai-data/prompt` },
        // { id: 'wrong-answer', title: '오답관리', path: `/${companyCode}/cms/ai-data/wrong-answer` },
        { id: 'conversation-history', title: 'AI 대화이력 관리', path: `/${companyCode}/cms/ai-data/conversation-history` },
      ],
    },
    // {
    //   id: 'ai-setting',
    //   icon: <AIDataIcon />,
    //   title: 'AI 설정',
    //   path: `/${companyCode}/cms/ai-setting`,
    //   subMenu: [
    //     { id: 'company-info', title: '회사정보', path: `/${companyCode}/cms/ai-setting/company-info` },
    //     { id: 'management', title: '관리', path: `/${companyCode}/cms/ai-setting/management` },
    //   ],
    // },
    {
      id: 'user-data',
      icon: <CustomerDataIcon />,
      title: '고객 데이터 관리',
      path: `/${companyCode}/cms/user-data`,
      subMenu: [
        { id: 'price', title: '단가표 관리', path: `/${companyCode}/cms/user-data/price` },
        { id: 'proposal', title: '견적 발행 이력', path: `/${companyCode}/cms/user-data/proposal` },
        { id: 'inquiry', title: '상담 요청 관리', path: `/${companyCode}/cms/user-data/inquiry` },
      ],
    },
    // { id: 'faq', icon: <FAQIcon />, title: 'FAQ', path: `/${companyCode}/cms/faq` },
    // { id: 'terms', icon: <TermsIcon />, title: '이용 약관', path: `/${companyCode}/cms/terms` },
  ];

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    
    if (path.includes('/admin-management')) return '관리자 관리';
    if (path.includes('/user-management')) return '사용자 관리';
    if (path.includes('/ai-data/survey')) return '설문조사';
    if (path.includes('/ai-data/prompt')) return '프롬프트';
    if (path.includes('/ai-data/wrong-answer')) return '오답관리';
    if (path.includes('/ai-data/conversation-history')) return '대화이력';
    if (path.includes('/ai-setting/company-info')) return '회사정보';
    if (path.includes('/ai-setting/management')) return 'AI 설정 관리';
    if (path.includes('/user-data/price')) return '단가관리';
    if (path.includes('/user-data/proposal')) return '제안서 다운로드';
    if (path.includes('/user-data/inquiry')) return '견적문의';
    if (path.includes('/faq')) return 'FAQ';
    if (path.includes('/terms')) return '약관관리';
    
    return '고객사 CMS';
  }, [location.pathname]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn && !isLoginPage && !isPdfPreviewPage && !isExcelPreviewPage && !isPromptDetailPage) {
    return null;
  }

  // 로그인, PDF, Excel, 프롬프트 디테일 페이지는 레이아웃 없이 렌더링
  if (isLoginPage || isPdfPreviewPage || isExcelPreviewPage || isPromptDetailPage) {
    return <Outlet />;
  }

  return (
    <ScrollAwareWrapper>
      <OuterLayoutContainer $themeMode="light" $device={device}>
        <ResponsiveSidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          menuItems={menuItems}
          footerIcon={<LogoutIcon />}
          onFooterClick={handleLogout}
          onMobileSidebarOpenChange={setIsMobileSidebarOpen}
        >
          <CustomSidebarHeader
            isCollapsed={isCollapsed}
            iconSrc='/icon.png' // 고객사별 로고
            showTime={false}
          />
        </ResponsiveSidebar>
        <MainContent
          $device={device}
          $isSidebarExpanded={effectiveSidebarExpanded}
        >
          <Container>
            <TopHeader>
              <h1>{pageTitle}</h1>
            </TopHeader>
            <PageWrapper>
              <Outlet />
            </PageWrapper>
          </Container>
        </MainContent>
      </OuterLayoutContainer>
    </ScrollAwareWrapper>
  );
}

// --- Styled Components (SuperAdmin과 동일) ---

const OuterLayoutContainer = styled.div<{
  $themeMode: "light" | "dark";
  $device: "mobile" | "tablet" | "desktop";
}>`
  height: 100vh;
  background-color: ${({ $themeMode }) =>
    $themeMode === 'light'
      ? THEME_COLORS.light.background
      : THEME_COLORS.dark.background};
  display: flex;
  overflow: hidden;
`;

const MainContent = styled.div<{
  $device: 'mobile' | 'tablet' | 'desktop';
  $isSidebarExpanded: boolean;
}>`
  transition: all 0.3s ease;
  flex: 1;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  overflow-x: auto;
  background-color: #e6e7e9;

  ${({ $device, $isSidebarExpanded }) => {
    if ($device === 'mobile') {
      return `
        margin-top: 0px;
        margin-left: 0;
      `;
    } else if ($device === 'tablet') {
      return `
        padding-top: 0px;
        margin-left: ${$isSidebarExpanded ? '250px' : '0'};
      `;
    } else {
      return `
        padding-top: 0px;
        margin-left: ${$isSidebarExpanded ? '250px' : '80px'};
      `;
    }
  }}
`;

const Container = styled.div`
  padding: 0px;
  margin: 0 auto;
  max-width: none;
  background-color: #e6e7e9;
`;

const TopHeader = styled.div`
  text-align: left;
  padding: 20px 0px 10px 0px;
  
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
`;
