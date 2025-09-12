'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { AppTextStyles } from '@/styles/textStyles';
import { AppColors } from '@/styles/colors';
import Modal from '@/components/common/Modal';
import { toast } from 'react-toastify';
// 👈 userApi에서 약관 API를 가져옵니다.
import { termsGetList } from '@/lib/api/user/userApi';

interface TermsAgreementProps {
  onAgreeChange: (privacyAgreed: boolean, termsAgreed: boolean) => void;
  initialPrivacyAgreed?: boolean;
  initialTermsAgreed?: boolean;
  onViewDetails?: (type: 'terms' | 'privacy') => void; // external control with type
}

const CheckboxContainer = styled.div`
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #dddddd;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;


const CheckboxField = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CheckboxLabelGroup = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  appearance: none;
  border: 1px solid #cccccc;
  border-radius: 4px;
  background-color: white;

  &:checked {
    background-color: #202055;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      display: block;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  &:focus {
    outline: none;
    border-color: #202055;
  }
`;

const CheckboxLabel = styled.label`
  ${AppTextStyles.body2}
  cursor: pointer;
  font-size :14px;
  
`;

const ViewButton = styled.button.attrs({ type: 'button' })<{ $isHidden?: boolean }>`
  background: none;
  border: none;
  color: ${AppColors.primary};
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9em;
  padding: 0.25rem 0.5rem;
  &:hover {
    color: ${AppColors.secondary};
  }

     visibility: ${({ $isHidden }) => ($isHidden ? 'hidden' : 'visible')};

`;

const TermsContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: #000 !important;
  font-size: 14px;
  height: 60vh;
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

const TabButton = styled.button.attrs({ type: 'button' })<{ active: boolean }>`
  background: none;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 13px;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ active }) => (active ? AppColors.primary : '#555')};
  border-bottom: 2px solid ${({ active }) => (active ? AppColors.primary : 'transparent')};
  transition: all 0.2s;
  white-space: pre-line;
  text-align: center;
  line-height: 1.2;
  &:hover {
    color: ${AppColors.primary};
  }
`;

// 약관 내용을 보여줄 모달 컴포넌트
interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'company';
}

const termsTabs = [
  { id: 1, key: 'terms', label: '이용\n약관' },
  { id: 2, key: 'privacy', label: '개인정보\n취급방침' },
  { id: 3, key: 'company', label: '사업자\n정보' },
];

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [allTermsData, setAllTermsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const termsResponse = await termsGetList(); 
          let termsList = (termsResponse?.data as { _id: number; language: string; content: string }[]) || [];
          
          if (termsList) {
            const sortedList = termsList.sort((a, b) => a._id - b._id);
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

  // 탭 변경 시 스크롤을 맨 위로 이동
  useEffect(() => {
    if (isOpen) {
      const termsContent = document.querySelector('.terms-content-scroll');
      if (termsContent) {
        termsContent.scrollTop = 0;
      }
    }
  }, [activeTab, isOpen]);

  
  const getModalContent = () => {
    if (isLoading) {
      return '로딩 중...';
    }
    
    const currentTabContent = allTermsData.find(term => term.language === 'KOR' && term._id.toString() === termsTabs.find(tab => tab.key === activeTab)?.id.toString());
    
    const content = currentTabContent?.content || '약관 내용을 불러오지 못했습니다.';
    return <TermsContent className="terms-content-scroll" dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="약관 보기" width={600}>
      <TabsContainer>
        {termsTabs.map((tab) => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key as 'terms' | 'privacy' | 'company')}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsContainer>
      {getModalContent()}
    </Modal>
  );
};

// 메인 컴포넌트
const TermsAgreement: React.FC<TermsAgreementProps> = ({
  onAgreeChange,
  initialPrivacyAgreed = false,
  initialTermsAgreed = false,
  onViewDetails, // Destructure the new prop
}) => {
  const [privacyAgreed, setPrivacyAgreed] = useState(initialPrivacyAgreed);
  const [termsAgreed, setTermsAgreed] = useState(initialTermsAgreed);
  const [isAgeAgreed, setIsAgeAgreed] = useState(false); // 만 14세 이상 동의 상태 추가
  
  // 👈 모달 상태를 다시 추가합니다.
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [modalTab, setModalTab] = useState<'terms' | 'privacy' | 'company'>('terms');
  
  // allAgreed 상태를 파생 상태로 만듭니다.
  const allAgreed = useMemo(() => {
    return privacyAgreed && termsAgreed && isAgeAgreed;
  }, [privacyAgreed, termsAgreed, isAgeAgreed]);
  
  useEffect(() => {
    // onAgreeChange 함수에 isAgeAgreed 상태도 함께 전달해야 할 수도 있습니다.
    if (privacyAgreed !== initialPrivacyAgreed || termsAgreed !== initialTermsAgreed) {
      onAgreeChange(privacyAgreed, termsAgreed);
    }
  }, [privacyAgreed, termsAgreed, initialPrivacyAgreed, initialTermsAgreed, onAgreeChange]);
  
  // 모든 상태를 한 번에 토글하는 함수
  const handleAllAgree = () => {
    const newValue = !allAgreed;
    setPrivacyAgreed(newValue);
    setTermsAgreed(newValue);
    setIsAgeAgreed(newValue);
  };
  
  // 개별 동의 상태를 토글하는 함수
  const handleIndividualAgree = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(prev => !prev);
  };
  
  return (
    <>
      <CheckboxContainer>
        <CheckboxField>
          <CheckboxLabelGroup>
            <Checkbox
              type="checkbox"
              id="agree-all"
              checked={allAgreed}
              onChange={handleAllAgree}
            />
            <CheckboxLabel htmlFor="agree-all">전체 동의하기</CheckboxLabel>
          </CheckboxLabelGroup>
        </CheckboxField>
  
        <CheckboxGroup>
          <CheckboxLabelGroup>
            <Checkbox
              type="checkbox"
              id="agree-terms"
              checked={termsAgreed}
              onChange={() => handleIndividualAgree(setTermsAgreed)}
            />
            <CheckboxLabel htmlFor="agree-terms">
              [필수] 이용약관 동의
            </CheckboxLabel>
          </CheckboxLabelGroup>
          <ViewButton onClick={() => {
            setModalTab('terms');
            setIsModalOpen(true);
            if (onViewDetails) onViewDetails('terms');
          }}>
            보기
          </ViewButton>
        </CheckboxGroup>
  
        <CheckboxGroup>
          <CheckboxLabelGroup>
            <Checkbox
              type="checkbox"
              id="agree-privacy"
              checked={privacyAgreed}
              onChange={() => handleIndividualAgree(setPrivacyAgreed)}
            />
            <CheckboxLabel htmlFor="agree-privacy">
              [필수] 개인정보 취급방침 동의
            </CheckboxLabel>
          </CheckboxLabelGroup>
          <ViewButton onClick={() => {
            setModalTab('privacy');
            setIsModalOpen(true);
            if (onViewDetails) onViewDetails('privacy');
          }}>
            보기
          </ViewButton>
        </CheckboxGroup>
  
         <CheckboxGroup>
          <CheckboxLabelGroup>
            <Checkbox
              type="checkbox"
              id="agree-age" 
              checked={isAgeAgreed}
              onChange={() => handleIndividualAgree(setIsAgeAgreed)} 
            />
            <CheckboxLabel htmlFor="agree-age">
              [필수] 만 14세 이상입니다
            </CheckboxLabel>
          </CheckboxLabelGroup>
          <ViewButton $isHidden={true}>
            보기
          </ViewButton>
        </CheckboxGroup>
      </CheckboxContainer>
  
      <TermsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialTab={modalTab} />
    </>
  );
};
  
export default TermsAgreement;