import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@contexts/AdminAuthContext';
import { useDevice } from '@contexts/DeviceContext';
import { toast, ToastContainer } from 'react-toastify';
// Import components
import ResponsiveSidebar from '@components/CustomSidebar/ResponsiveSidebar';
import CustomSidebarHeader from '@components/CustomSidebar/CustomSidebarHeader';
// Import icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
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
import ScrollAwareWrapper from '@layout/ScrollAwareWrapper';
export default function CmsLayout() {
    return (_jsx(AdminAuthProvider, { children: _jsx(ProtectedCmsLayout, {}) }));
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
        else if (ready && isLoggedIn && location.pathname === '/cms') {
            // 대시보드로 이동
            navigate('/cms', { replace: true });
        }
    }, [ready, isLoggedIn, isLoginPage, location.pathname, navigate]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsCollapsed((prev) => !prev);
    const handleLogout = () => {
        logout();
        navigate('/cms/login', { replace: true });
        toast.success('로그아웃 되었습니다');
    };
    const effectiveSidebarExpanded = useMemo(() => (device === 'mobile' ? isMobileSidebarOpen : !isCollapsed), [device, isMobileSidebarOpen, isCollapsed]);
    const initialOpenMenus = JSON.parse(localStorage.getItem('openMenus') || '{}');
    const [openMenus, setOpenMenus] = useState({});
    const handleMenuToggle = (menuId) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };
    const menuItems = [
        { id: 'dashboard', icon: _jsx(DashboardIcon, {}), title: '대시보드', path: '/cms' },
        { id: 'super-admin', icon: _jsx(WorkspacePremiumIcon, {}), title: '통합관리자 관리', path: '/cms/super-admin' },
        { id: 'company', icon: _jsx(BusinessIcon, {}), title: '고객사 관리', path: '/cms/company-management' },
        { id: 'admin', icon: _jsx(AdminPanelSettingsIcon, {}), title: '고객사관리자 관리', path: '/cms/admin-management' },
        { id: 'user', icon: _jsx(GroupIcon, {}), title: '고객 회원관리', path: '/cms/user-management' },
        {
            id: 'ai-data',
            icon: _jsx(DatasetIcon, {}),
            title: 'AI 데이터 관리',
            // path: '/cms/ai-data',
            isOpen: openMenus['ai-data'],
            subMenu: [
                { id: 'ai-data-survey', icon: _jsx(AssessmentIcon, {}), title: '기초조사 관리', path: '/cms/ai-data/survey' },
                { id: 'ai-data-prompt', icon: _jsx(TextFieldsIcon, {}), title: 'AI 프롬프트 관리', path: '/cms/ai-data/prompt' },
                { id: 'ai-data-wrong', icon: _jsx(QuestionAnswerIcon, {}), title: 'AI 동문서답 관리', path: '/cms/ai-data/wrong-answer' },
                { id: 'ai-data-conv', icon: _jsx(ChatIcon, {}), title: 'AI 대화이력 관리', path: '/cms/ai-data/conversation-history' },
            ],
        },
        {
            id: 'ai-setting',
            icon: _jsx(SettingsIcon, {}),
            title: 'AI 설정',
            // path: '/cms/ai-setting',
            isOpen: openMenus['ai-setting'],
            subMenu: [
                { id: 'ai-setting-company', icon: _jsx(BusinessIcon, {}), title: '회사정보 관리', path: '/cms/ai-setting/company-info' },
                { id: 'ai-setting-mng', icon: _jsx(TuneIcon, {}), title: 'AI 설정관리', path: '/cms/ai-setting/management' },
            ],
        },
        {
            id: 'user-data',
            icon: _jsx(StorageIcon, {}),
            title: '고객 데이터 관리',
            // path: '/cms/user-data',
            isOpen: openMenus['user-data'],
            subMenu: [
                { id: 'user-data-price', icon: _jsx(RequestQuoteIcon, {}), title: '단가표 관리', path: '/cms/user-data/price' },
                { id: 'user-data-proposal', icon: _jsx(DownloadIcon, {}), title: '견적 다운로드 현황', path: '/cms/user-data/proposal' },
                { id: 'user-data-inquiry', icon: _jsx(ContactSupportIcon, {}), title: '견적 문의 관리', path: '/cms/user-data/inquiry' },
            ],
        },
        { id: 'terms', icon: _jsx(DescriptionIcon, {}), title: '이용 약관', path: '/cms/terms' },
    ];
    if (!ready || (!isLoggedIn && !isLoginPage))
        return null;
    if (isLoginPage)
        return _jsx(Outlet, {});
    return (_jsx(ScrollAwareWrapper, { children: _jsxs(OuterLayoutContainer, { "$themeMode": "light", "$device": device, children: [_jsx(ToastContainer, { position: "top-center", autoClose: 3000 }), _jsx(ResponsiveSidebar, { isCollapsed: isCollapsed, toggleSidebar: toggleSidebar, menuItems: menuItems, footerIcon: _jsx(LogoutIcon, {}), onFooterClick: handleLogout, onMobileSidebarOpenChange: setIsMobileSidebarOpen, onMenuToggle: handleMenuToggle, children: _jsx(CustomSidebarHeader, { isCollapsed: isCollapsed, iconSrc: "/icon.png", showTime: false }) }), _jsx(MainContent, { "$device": device, "$isSidebarExpanded": effectiveSidebarExpanded, children: _jsx(Outlet, {}) })] }) }));
}
// --- Styled Components ---
const OuterLayoutContainer = styled.div `
  min-height: 100vh;
  background-color: #E6E7E9;
  
  @media (min-width: 1024px) {
    min-width: 1200px;
  }
`;
const MainContent = styled.div `
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
