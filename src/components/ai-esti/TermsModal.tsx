import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import Modal from '@/components/common/Modal';
import { toast } from 'react-toastify';
import { termsGetList } from '@/lib/api/user/userApi'; // 사용자 API import

const TermsContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: #000 !important;
  font-size: 14px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background-color: #F7F7F7 !important;
  border-radius: 8px;
  margin: 16px 0;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 1rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ active }) => (active ? AppColors.primary : '#555')};
  border-bottom: 2px solid ${({ active }) => (active ? AppColors.primary : 'transparent')};
  
  transition: all 0.2s;
  &:hover {
    color: ${AppColors.primary};
  }
`;

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const termsTabs = [
  { id: 1, key: 'terms', label: '이용약관' },
  { id: 2, key: 'privacy', label: '개인정보 취급방침' },
  { id: 3, key: 'company', label: '사업자 정보' },
];

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('terms');
  const [allTermsData, setAllTermsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const termsResponse = await termsGetList(); 
          let termsList = termsResponse?.data || [];
          
          if (termsList) {
            const sortedList = termsList.sort((a: any, b: any) => a._id - b._id);
            setAllTermsData(sortedList);
          } else {
            setAllTermsData([]);
          }
        } finally {
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
    return <TermsContent dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="약관 보기" width={600} height={'85vh'}>
      <TabsContainer>
        {termsTabs.map((tab) => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsContainer>
      {getModalContent()}
    </Modal>
  );
};

export default TermsModal;