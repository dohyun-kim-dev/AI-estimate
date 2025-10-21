import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@contexts/AdminAuthContext';
import { useDevice } from '@contexts/DeviceContext';
import { THEME_COLORS } from '@styles/theme_colors';
import { useToast } from '@/components/common/ToastProvider';

// Import components
import ResponsiveSidebar from '@components/CustomSidebar/ResponsiveSidebar';
import CustomSidebarHeader from '@components/CustomSidebar/CustomSidebarHeader';
import type { MenuItemConfig } from '@components/CustomSidebar/CustomSidebar';
import {
  DashboardIcon,
  SuperAdminIcon,
  CompanyIcon,
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

export default function CmsLayout() {
  return (
    <AdminAuthProvider>
      <ProtectedCmsLayout />
    </AdminAuthProvider>
  );
}

function ProtectedCmsLayout() {
  const { isLoggedIn, ready, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { companyCode } = useParams(); // URL 파라미터 가져오기
  const device = useDevice();
  const isLoginPage = location.pathname.includes('/superadmin/login');
  const isPdfPreviewPage = location.pathname.includes('/superadmin/pdf-preview');
  const isExcelPreviewPage = location.pathname.includes('/superadmin/excel-preview');
  const isPromptDetailPage = location.pathname.includes('/superadmin/prompt-detail');
  const { show: showToast } = useToast(); // 토스트 훅 추가

  useEffect(() => {
    
    if (ready && !isLoggedIn && !isLoginPage && !isPdfPreviewPage && !isExcelPreviewPage && !isPromptDetailPage) {
      console.log('Redirecting to /superadmin/login from CmsLayout',ready, isLoggedIn, isLoginPage, isPdfPreviewPage, isExcelPreviewPage, isPromptDetailPage);
      navigate(`/superadmin/login`, { replace: true });
    } else if (ready && isLoggedIn && location.pathname === `/superadmin`) {
      // 대시보드로 이동
      navigate(`/superadmin/admin-management`, { replace: true });
    }
  }, [ready, isLoggedIn, isLoginPage, isPdfPreviewPage, isExcelPreviewPage, isPromptDetailPage, location.pathname, navigate, companyCode]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate(`/superadmin/login`, { replace: true });
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


  const menuItems: MenuItemConfig[] = [
    { id: 'dashboard', icon: <DashboardIcon />, title: '대시보드', path: `/superadmin` },
    { id: 'super-admin', icon: <SuperAdminIcon />, title: '통합관리자 관리', path: `/superadmin/super-admin` },
    { id: 'company', icon: <CompanyIcon />, title: '고객사 관리', path: `/superadmin/company-management` },
    { id: 'admin', icon: <AdminIcon />, title: '관리자 관리', path: `/superadmin/admin-management` },
    { id: 'user', icon: <UserIcon />, title: '사용자 관리', path: `/superadmin/user-management` },
    {
      id: 'ai-data',
      icon: <AIDataIcon />,
      title: 'AI 데이터 관리',
      path: `/superadmin/ai-data`,
      subMenu: [
        // { id: 'ai-data-survey', title: '기초조사 관리', path: `/superadmin/ai-data/survey` },
        { id: 'ai-data-prompt', title: 'AI 프롬프트 관리', path: `/superadmin/ai-data/prompt` },
        // { id: 'ai-data-wrong', title: 'AI 동문서답 관리', path: `/superadmin/ai-data/wrong-answer` },
        { id: 'ai-data-conv', title: 'AI 대화이력 관리', path: `/superadmin/ai-data/conversation-history` },
      ],
    },
    // {
    //   id: 'ai-setting',
    //   icon: <SettingsIcon />,
    //   title: 'AI 설정',
    //   path: `/superadmin/ai-setting`,
    //   subMenu: [
    //     { id: 'ai-setting-company', title: '회사정보 관리', path: `/superadmin/ai-setting/company-info` },
    //     { id: 'ai-setting-mng', title: 'AI 설정관리', path: `/superadmin/ai-setting/management` },
    //   ],
    // },
    {
      id: 'user-data',
      icon: <CustomerDataIcon />,
      title: '고객 데이터 관리',
      path: `/superadmin/user-data`,
      subMenu: [
        { id: 'user-data-price', title: '단가표 관리', path: `/superadmin/user-data/price` },
        { id: 'user-data-proposal', title: '견적 발행 이력', path: `/superadmin/user-data/proposal` },
        { id: 'user-data-inquiry', title: '상담 요청 관리', path: `/superadmin/user-data/inquiry` },
      ],
    },
    { id: 'faq', icon: <FAQIcon />, title: 'FAQ', path: `/superadmin/faq` },
    { id: 'terms', icon: <TermsIcon />, title: '이용 약관', path: `/superadmin/terms` },
  ];

  // 현재 경로에 매칭되는 메뉴 찾기
  const matchedMenu = useMemo(() => {
    // 하위 메뉴에서 먼저 매치되는 메뉴 찾기 (우선순위)
    for (const item of menuItems) {
      if (item.subMenu) {
        const subMatch = item.subMenu.find((subItem) => subItem.path === location.pathname);
        if (subMatch) return subMatch; // 하위 메뉴의 타이틀 반환
      }
    }
    
    // 하위 메뉴에서 매치되지 않으면 직접 매치되는 메뉴 찾기
    const directMatch = menuItems.find((item) => item.path === location.pathname);
    if (directMatch) return directMatch;
    
    return undefined;
  }, [location.pathname, menuItems]);

  const pageTitle = matchedMenu?.title ?? '';

  // 서브메뉴가 있는 메뉴에서 첫 번째 서브메뉴로 리다이렉트 처리
  useEffect(() => {
    if (ready && isLoggedIn) {
      const currentPath = location.pathname;
      const menuItem = menuItems.find(item => 
        item.subMenu && currentPath === item.path
      );
      
      if (menuItem && menuItem.subMenu && menuItem.subMenu.length > 0) {
        navigate(menuItem.subMenu[0].path, { replace: true });
      }
    }
  }, [location.pathname, ready, isLoggedIn, navigate]);

  if (!ready || (!isLoggedIn && !isLoginPage && !isPdfPreviewPage && !isExcelPreviewPage && !isPromptDetailPage)) return null;
  if (isLoginPage || isPdfPreviewPage || isExcelPreviewPage || isPromptDetailPage) return <Outlet />;

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
            iconSrc="/icon.png"
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

// --- Styled Components ---

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
