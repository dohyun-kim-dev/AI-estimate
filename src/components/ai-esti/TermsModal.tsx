import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import Modal from '@/components/common/Modal';
import { termsGetList } from '@/lib/api/user/userApi';
import { devLog } from '@/utils/devLogger'

const TermsContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: #000 !important;
  font-size: 12px;
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
  gap: 4px;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ active }) => (active ? AppColors.primary : '#555')};
  border-bottom: 2px solid ${({ active }) => (active ? AppColors.primary : 'transparent')};
  transition: all 0.2s;
  white-space: pre-line;        /* 줄바꿈 적용 */
  line-height: 1.2;
  text-align: center;

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

// 작은 화면(<=386px)에서 줄바꿈된 라벨 반환
const getResponsiveLabel = (key: string, isNarrow: boolean) => {
  if (isNarrow) return (
    {
      terms: '이용\n약관',
      privacy: '개인정보\n취급방침',
      company: '사업자\n정보'
    } as Record<string, string>
  )[key];

  return (
    {
      terms: '이용약관',
      privacy: '개인정보 취급방침',
      company: '사업자 정보'
    } as Record<string, string>
  )[key];
};

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('terms');
  const [allTermsData, setAllTermsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  // 화면 폭 감지
  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      const narrow = width <= 386;
      devLog("window.innerWidth:", width, "isNarrow:", narrow);
      setIsNarrow(narrow);
    };
    check(); // 초기 체크
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 약관 로드
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const termsResponse = await termsGetList();
          devLog('Terms API Response:', termsResponse);
          devLog('Terms data type:', typeof termsResponse?.data);
          devLog('Terms data:', termsResponse?.data);
          
          const termsList = Array.isArray(termsResponse?.data) ? termsResponse.data : [];
          devLog('Terms list:', termsList);
          
          if (termsList.length > 0) {
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
    if (isLoading) return '로딩 중...';

    const currentId = termsTabs.find(t => t.key === activeTab)?.id;
    const currentTabContent = allTermsData.find(
      term => term.language === 'KOR' && term._id?.toString() === currentId?.toString()
    );
    const content = currentTabContent?.content || '약관 내용을 불러오지 못했습니다.';
    return <TermsContent dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="약관 보기" width={600} height={'85vh'}>
      <TabsContainer>
        {termsTabs.map(tab => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {getResponsiveLabel(tab.key, isNarrow)}
          </TabButton>
        ))}
      </TabsContainer>
      {getModalContent()}
    </Modal>
  );
};

export default TermsModal;