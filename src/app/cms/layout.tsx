import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@contexts/AdminAuthContext';
import { useDevice } from '@contexts/DeviceContext';
import { THEME_COLORS } from '@styles/theme_colors';
import { toast, ToastContainer } from 'react-toastify';

// Import components
import ResponsiveSidebar from '@components/CustomSidebar/ResponsiveSidebar';
import CustomSidebarHeader from '@components/CustomSidebar/CustomSidebarHeader';

// Import icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import DatasetIcon from '@mui/icons-material/Dataset';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ChatIcon from '@mui/icons-material/Chat';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import StorageIcon from '@mui/icons-material/Storage';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupIcon from '@mui/icons-material/Group';

import type { MenuItemConfig } from '@components/CustomSidebar/CustomSidebar';
import ScrollAwareWrapper from '@layout/ScrollAwareWrapper';

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
  const device = useDevice();
  const isLoginPage = location.pathname === '/cms/login';

  useEffect(() => {
    if (ready && !isLoggedIn && !isLoginPage) {
      navigate('/cms/login', { replace: true });
    }
  }, [ready, isLoggedIn, isLoginPage, navigate]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate('/cms/login', { replace: true });
    toast.success('로그아웃 되었습니다');
  };

  const effectiveSidebarExpanded = useMemo(
    () => (device === 'mobile' ? isMobileSidebarOpen : !isCollapsed),
    [device, isMobileSidebarOpen, isCollapsed]
  );

  const menuItems: MenuItemConfig[] = [
    { icon: <DashboardIcon />, title: '대시보드', path: '/cms' },
    { icon: <WorkspacePremiumIcon />, title: '통합관리자', path: '/cms/superAdminMng' },
    { icon: <BusinessIcon />, title: '고객사관리', path: '/cms/companyMng' },
    { icon: <AdminPanelSettingsIcon />, title: '관리자 회원관리', path: '/cms/adminMng' },
    { icon: <GroupIcon />, title: '사용자 회원관리', path: '/cms/userMng' },
    {
      icon: <DatasetIcon />,
      title: 'AI 데이터 관리',
      path: '/cms/aiData',
      subMenu: [
        { icon: <AssessmentIcon />, title: '기초조사 관리', path: '/cms/aiData/survey' },
        { icon: <TextFieldsIcon />, title: 'AI 프롬프트 관리', path: '/cms/aiData/prompt' },
        { icon: <QuestionAnswerIcon />, title: 'AI 동문서답 관리', path: '/cms/aiData/wrongAnswer' },
        { icon: <ChatIcon />, title: 'AI 대화이력 관리', path: '/cms/aiData/conversationHistory' },
      ],
    },
    {
      icon: <SettingsIcon />,
      title: 'AI 설정',
      path: '/cms/aiSetting',
      subMenu: [
        { icon: <BusinessIcon />, title: '회사정보 관리', path: '/cms/aiSetting/companyInfo' },
        { icon: <TuneIcon />, title: 'AI 설정관리', path: '/cms/aiSetting/mng' },
      ],
    },
    {
      icon: <StorageIcon />,
      title: '고객 데이터 관리',
      path: '/cms/userData',
      subMenu: [
        { icon: <RequestQuoteIcon />, title: '단가표 관리', path: '/cms/userData/price' },
        { icon: <DownloadIcon />, title: '견적 다운로드 현황', path: '/cms/userData/proposal' },
        { icon: <ContactSupportIcon />, title: '견적 문의 관리', path: '/cms/userData/inquiry' },
      ],
    },
    { icon: <DescriptionIcon />, title: '이용 약관 관리', path: '/cms/terms' },
  ];

  if (!ready || (!isLoggedIn && !isLoginPage)) return null;
  if (isLoginPage) return <Outlet />;

  return (
    <ScrollAwareWrapper>
      <OuterLayoutContainer $themeMode="light" $device={device}>
        <ToastContainer position="top-center" autoClose={3000} />
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
          <Outlet />
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
  min-height: 100vh;
  background-color: #E6E7E9;
  
  ${({ $device }) => $device !== 'mobile' && `
    min-width: 1200px;
  `}
`;

const MainContent = styled.div<{
  $device: "mobile" | "tablet" | "desktop";
  $isSidebarExpanded: boolean;
}>`
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #E6E7E9;

  ${({ $device, $isSidebarExpanded }) => {
    if ($device === "mobile") {
      return `
        margin-top: 56px;
        margin-left: ${$isSidebarExpanded ? "250px" : "0"};
        width: ${$isSidebarExpanded ? "calc(100% - 250px)" : "100%"};
        max-width: 100%;
        overflow-x: auto;
      `;
    } else {
      return `
        margin-left: ${$isSidebarExpanded ? "250px" : "80px"};
        min-width: 1200px;
        min-height: 100vh;
      `;
    }
  }}
`;