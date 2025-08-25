import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import Icon from '@/components/ai-esti/Icon';
import { IoChevronForward } from 'react-icons/io5';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from "react-router-dom";
import TermsModal from '@/components/ai-esti/TermsModal';
const Container = styled.div `
  // min-height: 100vh;
  background-color: ${({ theme }) => theme.body};
  padding: 20px 16px;
`;
const ProfileSection = styled.div `
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  margin-bottom: 24px;
  cursor: pointer;
`;
const ProfileImage = styled.div `
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
`;
const ProfileInfo = styled.div `
  flex: 1;
`;
const Flex = styled.div `
  display: flex;
  align-items: center;
  gap: 12px;
`;
const ProfileName = styled.div `
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 4px;
`;
const ProfileEmail = styled.div `
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
`;
const ChevronIcon = styled(IoChevronForward) `
  color: ${({ theme }) => theme.subtleText};
  width: 24px;
  height: 24px;
`;
const Section = styled.div `
  margin: 40px 0;
`;
const SectionTitle = styled.h2 `
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
`;
const MenuItem = styled.div `
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.surface3};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.surface2};
  }
`;
const MenuText = styled.span `
  flex: 1;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
`;
export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); // 👈 모달 상태 추가
    const handleLogout = () => {
        logout();
        navigate('/ai');
    };
    const handleViewTerms = () => {
        console.log("check");
        setIsModalOpen(true); // 👈 모달 열기 함수
    };
    return (_jsxs(Container, { children: [_jsxs(ProfileSection, { children: [_jsx(ProfileImage, { children: _jsx(Icon, { src: user?.profileImage || "/main/profile.png", width: 56, height: 56, fallbackIcon: "image" }) }), _jsxs(ProfileInfo, { children: [_jsxs(Flex, { children: [_jsx(ProfileName, { children: user?.name || '사용자' }), _jsx("div", { style: { width: '24px', height: '24px', display: 'flex', marginBottom: '8px' }, children: _jsx(ChevronIcon, {}) })] }), _jsx(ProfileEmail, { children: user?.email || '' })] })] }), _jsxs(Section, { children: [_jsx(SectionTitle, { children: "\uACE0\uAC1D \uC11C\uBE44\uC2A4" }), _jsxs(MenuItem, { onClick: handleViewTerms, children: [_jsx(MenuText, { children: "\uC774\uC6A9\uC57D\uAD00" }), _jsx(ChevronIcon, {})] }), _jsxs(MenuItem, { onClick: handleLogout, children: [_jsx(MenuText, { children: "\uB85C\uADF8\uC544\uC6C3" }), _jsx(ChevronIcon, {})] })] }), _jsx(TermsModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) })] }));
}
