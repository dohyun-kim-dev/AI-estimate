'use client';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import { AppColors } from '@/styles/colors';
import TextArea from '@/components/common/TextArea';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { toast } from 'react-toastify';

// 견적문의 데이터 타입
interface InquiryData {
  _id: string;
  inquiryDate: string;
  name: string;
  userId: string;
  profileImageUrl: string;
  email: string;
  cellphone: string;
  title: string;
  memo?: string;
  status?: string;
  chatSession?: string;
  estimateId?: string;
}

interface EstimateInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInquiry: InquiryData | null;
  onSave?: (inquiryId: string, newStatus: string, newMemo: string) => Promise<void>;
}

// 처리상태 옵션
const STATUS_OPTIONS = [
  { value: 'received', label: '접수' },
  { value: 'contact_failed', label: '연락불가' },
  { value: 'canceled', label: '불발' },
  { value: 'completed', label: '완료' },
];

// 상태 텍스트 변환 함수
const getStatusValue = (statusText?: string) => {
  switch (statusText) {
    case '접수': return 'received';
    case '연락불가': return 'contact_failed';
    case '불발': return 'canceled';
    case '완료': return 'completed';
    default: return 'received';
  }
};

const EstimateInquiryModal: React.FC<EstimateInquiryModalProps> = ({
  isOpen,
  onClose,
  selectedInquiry,
  onSave,
}) => {
  const [status, setStatus] = useState<string>('received');
  const [memo, setMemo] = useState<string>('');
  
  // 드롭다운 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // selectedInquiry 변경 시 상태 초기화
  useEffect(() => {
    if (selectedInquiry) {
      setStatus(getStatusValue(selectedInquiry.status));
      setMemo(selectedInquiry.memo || '');
    }
  }, [selectedInquiry]);

  // 드롭다운 위치 업데이트
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  // 드롭다운 토글
  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      updateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 옵션 선택
  const handleOptionSelect = (value: string) => {
    setStatus(value);
    setIsDropdownOpen(false);
  };

  // 현재 선택된 옵션의 라벨 가져오기
  const getSelectedLabel = () => {
    const selectedOption = STATUS_OPTIONS.find(option => option.value === status);
    return selectedOption?.label || '처리상태를 선택하세요';
  };

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleResize = () => {
      setIsDropdownOpen(false);
    };

    const handleScroll = () => {
      if (isDropdownOpen) {
        updateDropdownPosition();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      document.addEventListener('scroll', handleScroll, true);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isDropdownOpen]);

  const handleSave = async () => {
    if (!selectedInquiry) return;

    try {
      if (onSave) {
        await onSave(selectedInquiry._id, status, memo);
        toast.success('견적문의 상태가 업데이트되었습니다.');
        onClose();
      }
    } catch (error) {
      console.error('견적문의 상태 업데이트 오류:', error);
      toast.error('상태 업데이트에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setStatus('received');
    setMemo('');
    onClose();
  };

  if (!selectedInquiry) return null;

  return (
    <CmsPopup
      title="견적문의 처리현황"
      isOpen={isOpen}
      onClose={handleClose}
      showRequiredMark={true}
      requiredText=""
      height="auto"
      backgroundColor="white"
      bottomFloating={
        <PopupFooter>
          {/* 왼쪽 영역 */}
          <div />

          {/* 오른쪽 영역: 저장/닫기 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveButton onClick={handleSave}>
              저장
            </SaveButton>
            <CancelButton onClick={handleClose}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >
      <FormContainer>
        {/* 문의자 정보 섹션 */}
        <Title>회원 정보</Title>
        
        <UserInfoSection>
          <ProfileImage src={selectedInquiry.profileImageUrl} alt="Profile" />
          <UserDetails>
            <DetailItem>
              <DetailIcon><PersonIcon /></DetailIcon>
              <NameText>{selectedInquiry.name || '-'}</NameText>
            </DetailItem>
            <DetailItem>
              <DetailIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 14 11" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.332031 0.166992V10.8337H13.6653V0.166992H0.332031ZM6.21744 8.16699V2.63184H7.74869C8.39973 2.63184 8.92056 2.69434 9.31119 2.81934C9.8216 2.9834 10.2122 3.28809 10.4831 3.7334C10.7539 4.17611 10.8893 4.7321 10.8893 5.40137C10.8893 6.08887 10.7539 6.65006 10.4831 7.08496C10.1445 7.63444 9.62108 7.96777 8.91275 8.08496C8.58723 8.13965 8.17056 8.16699 7.66275 8.16699H6.21744ZM7.46353 7.19043H7.70181C8.26952 7.19043 8.69009 7.09798 8.96353 6.91309C9.20311 6.75423 9.37629 6.50814 9.48306 6.1748C9.56119 5.92743 9.60025 5.66441 9.60025 5.38574C9.60025 5.08628 9.55468 4.80894 9.46353 4.55371C9.37239 4.29852 9.24739 4.0993 9.08853 3.95605C8.93749 3.82064 8.76561 3.72949 8.57291 3.68262C8.3802 3.63314 8.08983 3.6084 7.70181 3.6084H7.46353V7.19043ZM3.65494 2.63184V8.16699H4.90103V2.63184H3.65494Z" fill="#AAAAAA"/>
                </svg>
              </DetailIcon>
              <span>ID: {selectedInquiry.userId || '-'}</span>
            </DetailItem>
            <DetailItem>
              <DetailIcon><PhoneIcon /></DetailIcon>
              <span>{selectedInquiry.cellphone || '-'}</span>
            </DetailItem>
            <DetailItem>
              <DetailIcon><EmailIcon /></DetailIcon>
              <span>{selectedInquiry.email || '-'}</span>
            </DetailItem>
          </UserDetails>
        </UserInfoSection>

        {/* 문의 내용 섹션 */}
        {/* <Title>문의 내용</Title>
        <InquiryContentSection>
          <InquiryItem>
            <InquiryLabel>제목:</InquiryLabel>
            <InquiryValue>{selectedInquiry.title}</InquiryValue>
          </InquiryItem>
          <InquiryItem>
            <InquiryLabel>문의일시:</InquiryLabel>
            <InquiryValue>{selectedInquiry.inquiryDate}</InquiryValue>
          </InquiryItem>
          <InquiryItem>
            <InquiryLabel>견적ID:</InquiryLabel>
            <InquiryValue>{selectedInquiry.estimateId || '-'}</InquiryValue>
          </InquiryItem>
        </InquiryContentSection> */}

        <FormSection>
          {/* 처리상태 커스텀 드롭다운 */}
          <DropdownFieldContainer>
            <DropdownLabel>* 처리상태</DropdownLabel>
            <DropdownContainer ref={containerRef}>
              <DropdownHeader onClick={handleDropdownToggle}>
                <DropdownText>{getSelectedLabel()}</DropdownText>
                <DropdownArrow $isOpen={isDropdownOpen}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="9" viewBox="0 0 14 9" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M7.70682 8.20698C7.51929 8.39445 7.26498 8.49976 6.99982 8.49976C6.73466 8.49976 6.48035 8.39445 6.29282 8.20698L0.635819 2.54998C0.540309 2.45773 0.464127 2.34739 0.411717 2.22538C0.359308 2.10338 0.331723 1.97216 0.330569 1.83938C0.329415 1.7066 0.354717 1.57492 0.404998 1.45202C0.455278 1.32913 0.529532 1.21747 0.623425 1.12358C0.717319 1.02969 0.828969 0.955436 0.951865 0.905155C1.07476 0.854874 1.20644 0.829572 1.33922 0.830726C1.472 0.83188 1.60322 0.859466 1.72522 0.911875C1.84723 0.964284 1.95757 1.04047 2.04982 1.13598L6.99982 6.08598L11.9498 1.13598C12.1384 0.953818 12.391 0.853024 12.6532 0.855302C12.9154 0.857581 13.1662 0.96275 13.3516 1.14816C13.537 1.33357 13.6422 1.58438 13.6445 1.84658C13.6468 2.10877 13.546 2.36137 13.3638 2.54998L7.70682 8.20698Z" fill="#999"/>
                  </svg>
                </DropdownArrow>
              </DropdownHeader>
            </DropdownContainer>
          </DropdownFieldContainer>
          
          <Title>비고</Title>
          
          <TextArea
            id="memo"
            value={memo}
            label="비고"
            onChange={(e) => setMemo(e.target.value)}
            placeholder="처리 내용이나 메모를 입력하세요"
            height="200px"
          />
        </FormSection>
      </FormContainer>

      {/* 드롭다운 리스트 */}
      {isDropdownOpen && (
        <DropdownList
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              $isSelected={status === option.value}
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </CmsPopup>
  );
};

export default EstimateInquiryModal;

// Styled Components (UserMngPage와 동일)
const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 0 14px;
`;

const Title = styled.h2`
  padding: 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
`;

const FooterButton = styled.button`
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
`;

const CancelButton = styled(FooterButton)`
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};
  border-radius: 4px;
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
  border-radius: 4px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 22px;
  justify-content: space-evenly;
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 50px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  color: #000;
  font-size: 16px;
  flex-grow: 1;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
`;

const DetailIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #AAAAAA;
`;

const NameText = styled.div`
  font-size: 14px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 10px;
`;

// 문의 내용 섹션 스타일
const InquiryContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const InquiryItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const InquiryLabel = styled.span`
  font-weight: 500;
  color: #666;
  min-width: 80px;
  margin-right: 12px;
`;

const InquiryValue = styled.span`
  color: #000;
  flex: 1;
`;

// 선택 필드 스타일
const SelectFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SelectLabel = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
  margin-left: 8px;
`;

// 커스텀 드롭다운 스타일 (CommonTextField와 비슷한 스타일)
const DropdownFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const DropdownLabel = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
  margin-left: 8px;
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
  font-family: "Pretendard Variable", sans-serif;
`;

const DropdownHeader = styled.div`
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: 1px solid #79747E;
  border-radius: 8px;
  background-color: white;
  color: ${AppColors.onSurface};
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;


  &:focus {
    outline: none;
    border-color: #2C2E3C;
    box-shadow: 0 0 0 2px rgba(44, 46, 60, 0.1);
  }
`;

const DropdownText = styled.span`
  flex: 1;
  text-align: left;
  color: ${AppColors.onSurface};
`;

const DropdownArrow = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease;

  svg {
    width: 14px;
    height: 9px;
  }
`;

const DropdownList = styled.ul`
  position: fixed;
  width: calc(100% - 32px); /* 부모 너비에 맞춤 (패딩 고려) */
  min-width: 200px;
  max-width: 400px;
  background-color: white;
  border: 1px solid #79747E;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 99999;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
`;

const DropdownItem = styled.li<{ $isSelected: boolean }>`
  padding: 12px 16px;
  font-size: 16px;
  cursor: pointer;
  color: ${AppColors.onSurface};
  background-color: ${({ $isSelected }) => ($isSelected ? '#f0f4f8' : 'white')};
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ $isSelected }) => ($isSelected ? '#e8f0f6' : '#f8f9fa')};
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;
