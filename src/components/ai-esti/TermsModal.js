import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import Modal from '@/components/common/Modal';
import { termsGetList } from '@/lib/api/user/userApi'; // 사용자 API import
const TermsContent = styled.div `
  white-space: pre-wrap;
  line-height: 1.6;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background-color: ${({ theme }) => theme.surface2};
  border-radius: 8px;
  margin: 16px 0;
`;
const TabsContainer = styled.div `
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 1rem;
`;
const TabButton = styled.button `
  background: none;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ active }) => (active ? AppColors.primary : '#555')};
  border-bottom: 2px solid ${({ active }) => (active ? AppColors.primary : 'transparent')};
  
  transition: all 0.2s;
  &:hover {
    color: ${AppColors.primary};
  }
`;
const termsTabs = [
    { id: 1, key: 'terms', label: '이용약관' },
    { id: 2, key: 'privacy', label: '개인정보 취급방침' },
    { id: 3, key: 'company', label: '사업자 정보' },
];
const TermsModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('terms');
    const [allTermsData, setAllTermsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const termsResponse = await termsGetList();
                    let termsList = termsResponse?.data || [];
                    if (termsList) {
                        const sortedList = termsList.sort((a, b) => a._id - b._id);
                        setAllTermsData(sortedList);
                    }
                    else {
                        setAllTermsData([]);
                    }
                }
                finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);
    const getModalContent = () => {
        if (isLoading) {
            return '로딩 중...';
        }
        const currentTabContent = allTermsData.find(term => term.language === 'KOR' && term._id.toString() === termsTabs.find(tab => tab.key === activeTab)?.id.toString());
        const content = currentTabContent?.content || '약관 내용을 불러오지 못했습니다.';
        return _jsx(TermsContent, { dangerouslySetInnerHTML: { __html: content } });
    };
    return (_jsxs(Modal, { open: isOpen, onClose: onClose, title: "\uC57D\uAD00 \uBCF4\uAE30", width: 600, children: [_jsx(TabsContainer, { children: termsTabs.map((tab) => (_jsx(TabButton, { active: activeTab === tab.key, onClick: () => setActiveTab(tab.key), children: tab.label }, tab.key))) }), getModalContent()] }));
};
export default TermsModal;
