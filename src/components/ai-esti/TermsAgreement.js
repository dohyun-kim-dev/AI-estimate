import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppTextStyles } from '@/styles/textStyles';
import { AppColors } from '@/styles/colors';
import Modal from '@/components/common/Modal';
// 👈 userApi에서 약관 API를 가져옵니다.
import { termsGetList } from '@/lib/api/user/userApi';
const CheckboxContainer = styled.div `
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #dddddd;
`;
const CheckboxGroup = styled.div `
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;
const CheckboxLabelGroup = styled.div `
  display: flex;
  align-items: center;
`;
const Checkbox = styled.input `
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
const CheckboxLabel = styled.label `
  ${AppTextStyles.body2}
  cursor: pointer;
`;
const ViewButton = styled.button `
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
`;
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
// 메인 컴포넌트
const TermsAgreement = ({ onAgreeChange, initialPrivacyAgreed = false, initialTermsAgreed = false, }) => {
    const [allAgreed, setAllAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(initialPrivacyAgreed);
    const [termsAgreed, setTermsAgreed] = useState(initialTermsAgreed);
    // 👈 모달 상태를 다시 추가합니다.
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        setPrivacyAgreed(initialPrivacyAgreed);
        setTermsAgreed(initialTermsAgreed);
        setAllAgreed(initialPrivacyAgreed && initialTermsAgreed);
    }, [initialPrivacyAgreed, initialTermsAgreed]);
    useEffect(() => {
        onAgreeChange(privacyAgreed, termsAgreed);
    }, [privacyAgreed, termsAgreed, onAgreeChange]);
    const handleAllAgree = () => {
        const newValue = !allAgreed;
        setAllAgreed(newValue);
        setPrivacyAgreed(newValue);
        setTermsAgreed(newValue);
    };
    const handlePrivacyAgree = () => {
        const newValue = !privacyAgreed;
        setPrivacyAgreed(newValue);
        if (newValue && termsAgreed) {
            setAllAgreed(true);
        }
        else {
            setAllAgreed(false);
        }
    };
    const handleTermsAgree = () => {
        const newValue = !termsAgreed;
        setTermsAgreed(newValue);
        if (newValue && privacyAgreed) {
            setAllAgreed(true);
        }
        else {
            setAllAgreed(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs(CheckboxContainer, { children: [_jsx(CheckboxGroup, { children: _jsxs(CheckboxLabelGroup, { children: [_jsx(Checkbox, { type: "checkbox", id: "agree-all", checked: allAgreed, onChange: handleAllAgree }), _jsx(CheckboxLabel, { htmlFor: "agree-all", children: "\uC804\uCCB4 \uB3D9\uC758\uD558\uAE30" })] }) }), _jsxs(CheckboxGroup, { children: [_jsxs(CheckboxLabelGroup, { children: [_jsx(Checkbox, { type: "checkbox", id: "agree-terms", checked: termsAgreed, onChange: handleTermsAgree }), _jsx(CheckboxLabel, { htmlFor: "agree-terms", children: "[\uD544\uC218] \uC774\uC6A9\uC57D\uAD00 \uB3D9\uC758" })] }), _jsx(ViewButton, { onClick: () => setIsModalOpen(true), children: "\uBCF4\uAE30" })] }), _jsxs(CheckboxGroup, { children: [_jsxs(CheckboxLabelGroup, { children: [_jsx(Checkbox, { type: "checkbox", id: "agree-privacy", checked: privacyAgreed, onChange: handlePrivacyAgree }), _jsx(CheckboxLabel, { htmlFor: "agree-privacy", children: "[\uD544\uC218] \uAC1C\uC778\uC815\uBCF4 \uCDE8\uAE09\uBC29\uCE68 \uB3D9\uC758" })] }), _jsx(ViewButton, { onClick: () => setIsModalOpen(true), children: "\uBCF4\uAE30" })] })] }), _jsx(TermsModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) })] }));
};
export default TermsAgreement;
