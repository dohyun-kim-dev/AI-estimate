import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, Outlet, useParams } from 'react-router-dom';
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

interface MenuItemConfig {
  icon: React.ReactElement;
  title: string;
  path?: string;
  subMenu?: MenuItemConfig[];
  isOpen?: boolean;
  id: string;
}
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
  const { companyCode } = useParams(); // URL 파라미터 가져오기
  const device = useDevice();
  const isLoginPage = location.pathname.includes('/superadmin/login');

  useEffect(() => {
    if (ready && !isLoggedIn && !isLoginPage) {
      navigate(`/superadmin/login`, { replace: true });
    } else if (ready && isLoggedIn && location.pathname === `/superadmin`) {
      // 대시보드로 이동
      navigate(`/superadmin`, { replace: true });
    }
  }, [ready, isLoggedIn, isLoginPage, location.pathname, navigate, companyCode]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate(`/superadmin/login`, { replace: true });
    toast.success('로그아웃 되었습니다');
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
    { id: 'super-admin', icon: <WorkspacePremiumIcon />, title: '통합관리자 관리', path: `/superadmin/super-admin` },
    { id: 'company', icon: <BusinessIcon />, title: '고객사 관리', path: `/superadmin/company-management` },
    { id: 'admin', icon: <AdminPanelSettingsIcon />, title: '고객사 관리자 관리', path: `/superadmin/admin-management` },
    { id: 'user', icon: <GroupIcon />, title: '고객 회원관리', path: `/superadmin/user-management` },
    {
      id: 'ai-data',
      icon: <DatasetIcon />,
      title: 'AI 데이터 관리',
      isOpen: openMenus['ai-data'],
      subMenu: [
        { id: 'ai-data-survey', icon: <AssessmentIcon />, title: '기초조사 관리', path: `/superadmin/ai-data/survey` },
        { id: 'ai-data-prompt', icon: <TextFieldsIcon />, title: 'AI 프롬프트 관리', path: `/superadmin/ai-data/prompt` },
        { id: 'ai-data-wrong', icon: <QuestionAnswerIcon />, title: 'AI 동문서답 관리', path: `/superadmin/ai-data/wrong-answer` },
        { id: 'ai-data-conv', icon: <ChatIcon />, title: 'AI 대화이력 관리', path: `/superadmin/ai-data/conversation-history` },
      ],
    },
    {
      id: 'ai-setting',
      icon: <SettingsIcon />,
      title: 'AI 설정',
      isOpen: openMenus['ai-setting'],
      subMenu: [
        { id: 'ai-setting-company', icon: <BusinessIcon />, title: '회사정보 관리', path: `/superadmin/ai-setting/company-info` },
        { id: 'ai-setting-mng', icon: <TuneIcon />, title: 'AI 설정관리', path: `/superadmin/ai-setting/management` },
      ],
    },
    {
      id: 'user-data',
      icon: <StorageIcon />,
      title: '고객 데이터 관리',
      isOpen: openMenus['user-data'],
      subMenu: [
        { id: 'user-data-price', icon: <RequestQuoteIcon />, title: '단가표 관리', path: `/superadmin/user-data/price` },
        { id: 'user-data-proposal', icon: <DownloadIcon />, title: '견적 다운로드 현황', path: `/superadmin/user-data/proposal` },
        { id: 'user-data-inquiry', icon: <ContactSupportIcon />, title: '견적 문의 관리', path: `/superadmin/user-data/inquiry` },
      ],
    },
    { id: 'terms', icon: <DescriptionIcon />, title: '이용 약관', path: `/superadmin/terms` },
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
          onMenuToggle={handleMenuToggle}
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
  
  @media (min-width: 1024px) {
    min-width: 1200px;
    overflow-x: auto;
  }
`;

const MainContent = styled.div<{
  $device: "mobile" | "tablet" | "desktop";
  $isSidebarExpanded: boolean;
}>`
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #E6E7E9;
  margin-top: 56px;
  margin-left: ${({ $isSidebarExpanded }) => $isSidebarExpanded ? "250px" : "0"};
  width: ${({ $isSidebarExpanded }) => $isSidebarExpanded ? "calc(100% - 250px)" : "100%"};
  max-width: 100%;
  overflow-x: auto;

  @media (min-width: 1024px) {
    margin-top: 0;
    margin-left: ${({ $isSidebarExpanded }) => $isSidebarExpanded ? "250px" : "80px"};
    min-width: 1200px;
    min-height: 100vh;
  }
`;
