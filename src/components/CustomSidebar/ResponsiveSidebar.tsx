import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import ResponsiveView from '@layout/ResponsiveView';
import CustomSidebar, { MenuItemConfig } from './CustomSidebar';
import { MenuIcon } from 'lucide-react';
import { AppColors } from '@styles/colors';
import { useNavigate } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';

const recentNotices = [
  '서버 점검 안내: 8월 20일 00:00 ~ 02:00',
  '신규 기능 업데이트: 사용자 프로필 편집 기능 추가',
  '휴가 일정 관련 안내: 8월 말까지 연차 사용 권장'
];

interface ResponsiveSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  menuItems: MenuItemConfig[];
  footerIcon: React.ReactElement;
  onFooterClick: () => void;
  children: React.ReactNode;
  onMobileSidebarOpenChange?: (isOpen: boolean) => void;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  isCollapsed,
  toggleSidebar,
  menuItems,
  footerIcon,
  onFooterClick,
  children,
  onMobileSidebarOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY.MM.DD. HH:mm:ss'));
  const navigate = useNavigate();

  // 매초마다 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY.MM.DD. HH:mm:ss'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleMobileSidebar = (next: boolean) => {
    setIsOpen(next);
    onMobileSidebarOpenChange?.(next);
  };

  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowSettingsMenu(false);
  };

  return (
    <ResponsiveView
      desktopView={
        <CustomSidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          menuItems={menuItems}
          footerIcon={footerIcon}
          onFooterClick={onFooterClick}
        >
          <AppBar $sidebarWidth={isCollapsed ? 80 : 250}>
            <LeftLogo src="/favicon.png" alt="logo" />
            <CenterNotice>
              {/* {recentNotices.length > 0 ? recentNotices[0] : '최근 공지가 없습니다.'} */}
            </CenterNotice>
            <RightInfo>
              <DateText>{currentTime}</DateText>
              <SettingsContainer>
                <SettingsButton onClick={handleSettingsClick}>
                  {/* <SettingsIcon /> */}
                  <img src="/cms/AI_setting.png" alt="setting" width='32' height='32' />
                </SettingsButton>
                <SettingsMenu $isvisible={showSettingsMenu}>
                  <MenuItem onClick={() => handleNavigate('/superadmin/company-settings')}>회사정보 설정</MenuItem>
                  <MenuItem onClick={() => handleNavigate('/superadmin/aigo-settings')}>AIGO 설정</MenuItem>
                </SettingsMenu>
              </SettingsContainer>
            </RightInfo>
          </AppBar>
          {children}
        </CustomSidebar>
      }
      mobileView={
        <>
          <MobileToggleButton onClick={() => toggleMobileSidebar(true)}>
            <MenuIcon size={24} />
            <LogoImage src="/logo.png" alt="company logo" />
          </MobileToggleButton>

          {isOpen && (
            <>
              <SidebarOverlay onClick={() => toggleMobileSidebar(false)} />
              <MobileSidebarContainer>
                <CustomSidebar
                  isCollapsed={false}
                  toggleSidebar={() => toggleMobileSidebar(false)}
                  menuItems={menuItems}
                  footerIcon={footerIcon}
                  onFooterClick={onFooterClick}
                >
                  {children}
                </CustomSidebar>
              </MobileSidebarContainer>
            </>
          )}
        </>
      }
    />
  );
};

export default ResponsiveSidebar;

// --- Styled Components ---

const MobileToggleButton = styled.button`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  z-index: 1101;
  background-color: #2c2e3c;
  border: none;
  color: white;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    opacity: 0.8;
  }
`;

const LogoImage = styled.img`
  height: 32px;
  object-fit: contain;
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1100;
`;

const MobileSidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  z-index: 1101;
  background-color: #2c2e3c;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.2);
  transform: translateX(-100%);
  animation: slideIn 0.3s ease-out forwards;

  @keyframes slideIn {
    to {
      transform: translateX(0);
    }
  }
`;

const AppBar = styled.div<{ $sidebarWidth: number }>`
  position: fixed;
  top: 0;
  left:0;
  width:100%;
  height: 56px;
  background-color: #2C2E3C;
  border-bottom: 1px solid #444444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1200;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const LeftLogo = styled.img`
  height: 32px;
  object-fit: contain;
`;

const CenterNotice = styled.div`
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #fff;
`;

const RightInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

const DateText = styled.div`
  font-size: 14px;
  color: white;
`;

const SettingsContainer = styled.div`
  position: relative;
`;

const SettingsButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  // background-color: #999;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const SettingsMenu = styled.div<{ $isvisible: boolean }>`
  position: absolute;
  top: 44px;
  right: -12px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 0px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1300;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  
  transform-origin: top;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  transform: scaleY(${({ $isvisible }) => ($isvisible ? 1 : 0)});
  opacity: ${({ $isvisible }) => ($isvisible ? 1 : 0)};
  pointer-events: ${({ $isvisible }) => ($isvisible ? 'auto' : 'none')};
`;

const MenuItem = styled.button`
  width: 100%; 
  padding: 12px 16px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;

`;