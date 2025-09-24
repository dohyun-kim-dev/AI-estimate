'use client';
import React from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { AppColors } from '@/styles/colors';
import TextArea from '@/components/common/TextArea';
import CommonTextField from '@/components/common/TextField';
import { SwitchInput } from '@/components/SwitchInput';
import CategorySearchPopup from './CategorySearchPopup';
import { uploadFiles } from '@/lib/api/user/userApi';
import DaumPostcode from 'react-daum-postcode';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

// 다음 우편번호 서비스를 사용한 주소 검색 모달 컴포넌트
const AddressSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    onSelect(fullAddress);
    onClose();
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const contentStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
    position: 'relative' as const,
  };

  const closeButtonStyle = {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    zIndex: 1001,
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle}>
        {/* <button style={closeButtonStyle} onClick={onClose}>
          
        </button> */}
        <DaumPostcode
          onComplete={handleComplete}
          style={{
            width: '100%',
            height: '400px',
            border: 'none',
          }}
          autoClose={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
          <CancelButton onClick={onClose}>닫기</CancelButton>
        </div>
      </div>
    </div>
  );
};


const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 16px;
`;

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
`;


const Title = styled.h2`
  margin: 10px 0 ;
  padding: 0;
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
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
`;


const SearchButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
  height: 56px;
`;


const ImageUploadSection = styled.div`
  margin-top: 24px;
`;

const ImageUploadTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
`;

const ImageUploadBox = styled.div`
  border: 2px dashed #E6E7E9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
  margin-bottom: 16px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #ccc;
  }
`;

const ImageUploadText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const ImageUploadSubText = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
`;

const UploadButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;

  &:hover {
    background-color: #e8e8e8;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

type Customer = {
  _id: string;
  name: string;
  companyName: string;
  cellphone: string;
  email: string;
  companyCode: string;
  dbName: string;
  address: string;
  detailAddress: string;
  ciImage: string;
  businessImage: string;
  contractType: string;
  contractStartDate: string;
  contractEndDate: string;
  aiConfidence: string;
  mode: string;
  category: {name: string, code: string} | null;
  businessNumber: string;
  memo: string;
  licence: string;
  createAt: string;
};

interface CompanyFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedCustomer: Partial<Customer> | null;
  formData: {
    name: string;
    companyName: string;
    code: string;
    category: string;
    businessNumber: string;
    memo: string;
    password: string;
    confirmPassword: string;
    email: string;
    cellphone: string;
    address: string;
    detailAddress: string;
    ceoName: string;
    ceoPhone: string;
    ceoEmail: string;
    contractType: string;
    mode: string;
    licence: string;
    contractStartDate: string;
    contractEndDate: string;
    ciImage?: File | null;
    businessImage?: File | null;
    errors?: {
      name?: string;
      companyName?: string;
      code?: string;
      category?: string;
      businessNumber?: string;
      memo?: string;
      password?: string;
      confirmPassword?: string;
      email?: string;
      cellphone?: string;
      address?: string;
      detailAddress?: string;
      ceoName?: string;
      ceoPhone?: string;
      ceoEmail?: string;
      contractType?: string;
      mode?: string;
      licence?: string;
      contractStartDate?: string;
      contractEndDate?: string;
    };
  };
  onFormChange: {
    setName: (value: string) => void;
    setCompanyName: (value: string) => void;
    setCode: (value: string) => void;
    setCategory: (value: string) => void;
    setBusinessNumber: (value: string) => void;
    setMemo: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setEmail: (value: string) => void;
    setCellphone: (value: string) => void;
    setAddress: (value: string) => void;
    setDetailAddress: (value: string) => void;
    setCeoName: (value: string) => void;
    setCeoPhone: (value: string) => void;
    setCeoEmail: (value: string) => void;
    setContractType: (value: string) => void;
    setMode: (value: string) => void;
    setLicence: (value: string) => void;
    setContractStartDate: (value: string) => void;
    setContractEndDate: (value: string) => void;
  };
  onFileUpload?: {
    onCiImageUpload: (file: File) => void;
    onBusinessImageUpload: (file: File) => void;
  };
}

// 스타일드 컴포넌트 추가
const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  // padding : 24px 0 ;
  color: #555;
  margin: 24px 0 24px 0;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  > * {
    flex: 1;
  }
`;

const Row2 = styled.div`
  display: flex;
  gap: 16px;
`;

const CompanyFormPopup: React.FC<CompanyFormPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedCustomer,
  formData,
  onFormChange,
  onFileUpload,
}) => {
  const {
    name,
    companyName,
    code,
    category,
    businessNumber,
    memo,
    password,
    confirmPassword,
    email,
    cellphone,
    address,
    detailAddress,
    ceoName,
    ceoPhone,
    ceoEmail,
    contractType,
    mode,
    licence,
    contractStartDate,
    contractEndDate,
    ciImage,
    businessImage,
    errors = {},
  } = formData;

  const {
    setName,
    setCompanyName,
    setCode,
    setCategory,
    setBusinessNumber,
    setMemo,
    setPassword,
    setConfirmPassword,
    setEmail,
    setCellphone,
    setAddress,
    setDetailAddress,
    setCeoName,
    setCeoPhone,
    setCeoEmail,
    setContractType: _setContractType,
    setMode: _setMode,
    setLicence: _setLicence,
    setContractStartDate: _setContractStartDate,
    setContractEndDate: _setContractEndDate,
  } = onFormChange;

  // 컴포넌트 내부 상태로 관리하여 UI 반영
  const [internalContractType, setInternalContractType] = React.useState(contractType || 'monthly');
  const [internalMode, setInternalMode] = React.useState(mode || 'inactive');
  const [internalLicence, setInternalLicence] = React.useState(licence || 'customer');
  const [internalStartDate, setInternalStartDate] = React.useState(contractStartDate || dayjs().format('YYYY-MM-DD'));
  const [internalEndDate, setInternalEndDate] = React.useState(
    contractEndDate || 
    dayjs(contractStartDate || new Date()).add(internalContractType === 'monthly' ? 1 : 12, 'month').format('YYYY-MM-DD')
  );
  
  // 방어 코드 추가 (로그 기록 + 내부 상태 동기화)
  const setContractType = (v: string) => {
    console.log('setContractType called with:', v);
    setInternalContractType(v);
    if (_setContractType) _setContractType(v);
  };
  
  const setMode = (v: string) => {
    console.log('setMode called with:', v);
    setInternalMode(v);
    if (_setMode) _setMode(v);
  };
  
  const setLicence = (v: string) => {
    console.log('setLicence called with:', v);
    setInternalLicence(v);
    if (_setLicence) _setLicence(v);
  };
  
  const setContractStartDate = (v: string) => {
    console.log('setContractStartDate called with:', v);
    setInternalStartDate(v);
    if (_setContractStartDate) _setContractStartDate(v);
  };
  
  const setContractEndDate = (v: string) => {
    console.log('setContractEndDate called with:', v);
    setInternalEndDate(v);
    if (_setContractEndDate) _setContractEndDate(v);
  };

  // 등록/수정 모드 구분
  const isEditMode = !!selectedCustomer;
  const popupTitle = isEditMode ? "고객사 수정" : "고객사 등록";

  // 파일 업로드 핸들러
  const handleCiImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const response = await uploadFiles([file]);
        if (response.data && response.data.length > 0) {
          setCiFileId(response.data[0]);
          setCiPreview(URL.createObjectURL(file));
        }
      } catch (error) {
        console.error('CI 이미지 업로드 실패:', error);
      }
    }
  };

  const handleBusinessImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const response = await uploadFiles([file]);
        if (response.data && response.data.length > 0) {
          setBusinessFileId(response.data[0]);
          setBusinessPreview(URL.createObjectURL(file));
        }
      } catch (error) {
        console.error('사업자등록증 업로드 실패:', error);
      }
    }
  };

  // 계약 시작/종료 일시 데이트피커 상태
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
  const startDatePickerRef = React.useRef<HTMLDivElement>(null);
  const endDatePickerRef = React.useRef<HTMLDivElement>(null);

  // 외부 클릭 감지 useEffect
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startDatePickerRef.current && !startDatePickerRef.current.contains(event.target as Node)) {
        setShowStartDatePicker(false);
      }
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target as Node)) {
        setShowEndDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 카테고리 조회 모달 상태
  const [categoryModalOpen, setCategoryModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<{name: string, code: string} | null>(null);

  // 주소 조회 모달 상태
  const [addressModalOpen, setAddressModalOpen] = React.useState(false);

  // 파일 업로드 상태
  const [ciFileId, setCiFileId] = React.useState<string>('');
  const [businessFileId, setBusinessFileId] = React.useState<string>('');
  const [ciPreview, setCiPreview] = React.useState<string>('');
  const [businessPreview, setBusinessPreview] = React.useState<string>('');

  // 카테고리 선택 핸들러
  const handleCategorySelect = (cat: {name: string, code: string}) => {
    setSelectedCategory(cat);
    setCategory(cat.name);
    setCode(cat.code);
    setCategoryModalOpen(false);
  };

  // 데이트피커 컴포넌트 임포트 필요 (GenericDateRangePicker 참고)
  // 실제로는 DatePicker 또는 커스텀 컴포넌트 사용
  // 아래는 예시로 input + date picker

  // SVG 아이콘
  const CalendarIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V12H20V19ZM20 10H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V10Z" fill="#888888"/>
    </svg>
  );

  // 계약 유형 변경 핸들러
  const handleContractTypeChange = (type: 'monthly' | 'yearly') => {
    // 계약 유형 설정
    setContractType(type);
    
    // 시작일 설정 (현재 선택된 시작일 또는 현재 날짜)
    let startDate = internalStartDate || dayjs().format('YYYY-MM-DD');
    
    // 종료일 계산 (월간/연간에 따라 다름)
    let endDate;
    if (type === 'monthly') {
      endDate = dayjs(startDate).add(1, 'month').format('YYYY-MM-DD');
    } else {
      endDate = dayjs(startDate).add(1, 'year').format('YYYY-MM-DD');
    }
    
    // 시작일/종료일 업데이트
    setContractStartDate(startDate);
    setContractEndDate(endDate);
  };

  // 계약시작일 데이트피커에서 날짜 선택 시 종료일 자동 계산
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      const startDate = dayjs(date).format('YYYY-MM-DD');
      setContractStartDate(startDate);
      
      // 종료일 자동 계산 (계약 유형에 따라)
      let endDate;
      if (internalContractType === 'monthly') {
        endDate = dayjs(date).add(1, 'month').format('YYYY-MM-DD');
      } else {
        endDate = dayjs(date).add(1, 'year').format('YYYY-MM-DD');
      }
      setContractEndDate(endDate);
    }
    setShowStartDatePicker(false);
  };

  // 계약종료일 데이트피커에서 날짜 선택
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setContractEndDate(dayjs(date).format('YYYY-MM-DD'));
    }
    setShowEndDatePicker(false);
  };

  // 스타일드 컴포넌트
  const DateFieldWrapper = styled.div`
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    display: flex;
    align-items: center;
  `;
  
  const DateLabel = styled.label`
  position: absolute;
  background: #fff;
  top: -10px;
  left: 16px;
  font-size: 13px;
    color: #89858E;
    font-weight: 500;
    margin-bottom: 8px;
    padding: 0 4px;
    display: block;
    z-index: 2;
  `;
  
  const DateInput = styled.input`
    width: 100%;
    height: 48px;
    border: none;
    background: transparent;
    color: #111827;
    font-size: 16px;
    padding: 0 44px 0 16px;
    border-radius: 8px;
    outline: none;
    box-sizing: border-box;
    cursor: pointer;
    &:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
  `;
const DateIconWrapper = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
`;



const ToggleButton = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  border-radius: 50px;
  border: 1px solid #E5E7EB;
  background-color: ${props => props.active ? '#2C2E3C' : '#FFFFFF'};
  color: ${props => props.active ? '#FFFFFF' : '#374151'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  &:hover {
    border-color: #E6E7E9;
  }

`;

const DateRangeContainer = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const DateFieldContainer = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const DateRowContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

const DateFieldColumn = styled.div`
  flex: 1;
  position: relative;
`;

const DateRangeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 4px 8px;
  background: #fff;
`;

const DateSeparator = styled.div`
  font-size: 16px;
  color: #666;
  font-weight: 500;
`;

const DatePickerWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 4px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ff4757;
  color: white;
  font-size: 18px;
  line-height: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  &:hover {
    background-color: #ff6b81;
  }
`;  return (
    <CmsPopup
      title={popupTitle}
      isOpen={isOpen}
      onClose={onClose}
      backgroundColor="#FFF"
      bottomFloating={
        <PopupFooter>
          <div />
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveButton onClick={onSave}>저장</SaveButton>
            <CancelButton onClick={onClose}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >

        {/* 챗봇 활성 상태 */}
                <SectionTitle>챗봇 활성</SectionTitle>

        <SwitchInput
          value={internalMode === 'active'}
          onChange={(isActive) => setMode(isActive ? 'active' : 'inactive')}
          $labelPosition="vertical"
          label={internalMode === 'active' ? '활성화' : '비활성화'}
        />

        <SectionTitle>라이선스 유형</SectionTitle>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <ToggleButton 
            active={internalLicence === 'customer'}
            onClick={() => setLicence('customer')}
          >
            Pro (고객용)
          </ToggleButton>
          <ToggleButton 
            active={internalLicence === 'employee'}
            onClick={() => setLicence('employee')}
          >
            Pro (직원용)
          </ToggleButton>
        </div>

        {/* 계약 유형 */}
        <SectionTitle>계약 유형</SectionTitle>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <ToggleButton 
            active={internalContractType === 'monthly'}
            onClick={() => handleContractTypeChange('monthly')}
          >
            월계약
          </ToggleButton>
          <ToggleButton 
            active={internalContractType === 'yearly'}
            onClick={() => handleContractTypeChange('yearly')}
          >
            년계약
          </ToggleButton>
        </div>
        <DateRowContainer>
          {/* 계약시작일시 */}
          <DateFieldColumn>
            <DateLabel>* 계약시작일시</DateLabel>
            <DateFieldWrapper>
              <DateInput
                type="text"
                value={internalStartDate}
                onClick={() => setShowStartDatePicker(true)}
                placeholder="YYYY-MM-DD"
                readOnly
              />
              <DateIconWrapper onClick={() => setShowStartDatePicker(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V12H20V19ZM20 10H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V10Z" fill="#888888"/>
                </svg>
              </DateIconWrapper>
            </DateFieldWrapper>
            {showStartDatePicker && (
              <DatePickerWrapper ref={startDatePickerRef}>
                <DatePicker
                  selected={internalStartDate ? dayjs(internalStartDate).toDate() : null}
                  onChange={handleStartDateChange}
                  inline
                  dateFormat="yyyy-MM-dd"
                />
              </DatePickerWrapper>
            )}
          </DateFieldColumn>

          {/* 계약종료일시 */}
          <DateFieldColumn>
            <DateLabel>* 계약종료일시</DateLabel>
            <DateFieldWrapper>
              <DateInput
                type="text"
                value={internalEndDate}
                onClick={() => setShowEndDatePicker(true)}
                placeholder="YYYY-MM-DD"
                readOnly
              />
              <DateIconWrapper onClick={() => setShowEndDatePicker(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V12H20V19ZM20 10H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V10Z" fill="#888888"/>
                </svg>
              </DateIconWrapper>
            </DateFieldWrapper>
            {showEndDatePicker && (
              <DatePickerWrapper ref={endDatePickerRef}>
                <DatePicker
                  selected={internalEndDate ? dayjs(internalEndDate).toDate() : null}
                  onChange={handleEndDateChange}
                  inline
                  dateFormat="yyyy-MM-dd"
                />
              </DatePickerWrapper>
            )}
          </DateFieldColumn>
        </DateRowContainer>


      {/* 상단 추가 영역 */}
      <FormContainer>
        {/* 고객사 정보 */}
        <SectionTitle>고객사 정보</SectionTitle>
        <CommonTextField
          id="name"
          value={name}
          label="* 고객사명(KR)"
          onChange={(e) => setName(e.target.value)}
          placeholder="고객사명을 입력하세요"
          errorMessage={errors.name}
        />
        <CommonTextField
          id="companyName"
          value={companyName}
          label="* 고객사명(EN)"
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="고객사명(영문)을 입력하세요"
          errorMessage={errors.companyName}
        />
        <CommonTextField
          id="code"
          value={code}
          label="* 고객사코드"
          onChange={(e) => setCode(e.target.value)}
          placeholder="고객사코드를 입력하세요"
          errorMessage={errors.code}
        />
        <CommonTextField
          id="category"
          value={selectedCategory ? selectedCategory.name : category}
          label="* 카테고리"
          onClick={() => setCategoryModalOpen(true)}
          readOnly
          placeholder="카테고리를 선택하세요"
          errorMessage={errors.category}
          style={{ cursor: 'pointer', background: '#f3f4f6' }}
        />

        {/* 고객사 주소 */}
        <SectionTitle>고객사 주소</SectionTitle>
        <Row2>
          <CommonTextField
            id="address"
            value={address}
            label="* 고객사 주소"
            onClick={() => setAddressModalOpen(true)}
          readOnly
          placeholder="주소를 선택하세요"
          errorMessage={errors.address}
          style={{ cursor: 'pointer', background: '#f3f4f6' }}
        />
        <SearchButton onClick={() => setAddressModalOpen(true)}>검색</SearchButton>
        </Row2>
        <CommonTextField
          id="detailAddress"
          value={detailAddress}
          label="* 상세 주소"
          onChange={(e) => setDetailAddress(e.target.value)}
          placeholder="상세 주소를 입력하세요"
          errorMessage={errors.detailAddress}
        />

        {/* 고객사 대표 정보 */}
        <SectionTitle>고객사 대표 정보</SectionTitle>
        <CommonTextField
          id="representativeName"
          value={ceoName}
          label="* 고객사 대표명"
          onChange={(e) => setCeoName(e.target.value)}
          placeholder="대표명을 입력하세요"
          errorMessage={errors.ceoName}
        />
        <CommonTextField
          id="representativePhone"
          value={ceoPhone}
          label="* 대표 전화번호"
          onChange={(e) => setCeoPhone(e.target.value)}
          placeholder="전화번호를 입력하세요"
          errorMessage={errors.ceoPhone}
        />
        <CommonTextField
          id="representativeEmail"
          value={ceoEmail}
          label="* 대표 이메일"
          onChange={(e) => setCeoEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          errorMessage={errors.ceoEmail}
        />

        {/* 비고 */}
        <SectionTitle>비고</SectionTitle>
        <TextArea
          id="memo"
          value={memo}
          label="비고"
          onChange={(e) => setMemo(e.target.value)}
          placeholder="비고를 입력하세요"
          errorMessage={errors.memo}
          height="120px"
        />

        {/* 이미지 첨부 */}
        <SectionTitle>이미지 첨부</SectionTitle>
        <ImageUploadSection>
          <ImageUploadTitle>* 고객사 CI</ImageUploadTitle>
          {ciPreview && (
            <div style={{ marginBottom: '16px', textAlign: 'center', position: 'relative' }}>
              <img
                src={ciPreview}
                alt="CI 미리보기"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <RemoveImageButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setCiFileId('');
                  setCiPreview('');
                }}
              >
                ×
              </RemoveImageButton>
            </div>
          )}
          <ImageUploadBox onClick={() => document.getElementById('ci-upload')?.click()}>
            <ImageUploadText>파일을 업로드해주세요</ImageUploadText>
            <ImageUploadSubText>
              1장의 이미지만 첨부 가능합니다<br />
              1MB 이내의 Jpg, Jpeg, Png 파일만 등록 가능
            </ImageUploadSubText>
            <UploadButton type="button">파일 열기</UploadButton>
          </ImageUploadBox>
          <HiddenInput
            id="ci-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleCiImageUpload}
          />
          <ImageUploadTitle>* 사업자등록증</ImageUploadTitle>
          {businessPreview && (
            <div style={{ marginBottom: '16px', textAlign: 'center', position: 'relative' }}>
              <img
                src={businessPreview}
                alt="사업자등록증 미리보기"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <RemoveImageButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setBusinessFileId('');
                  setBusinessPreview('');
                }}
              >
                ×
              </RemoveImageButton>
            </div>
          )}
          <ImageUploadBox onClick={() => document.getElementById('business-upload')?.click()}>
            <ImageUploadText>파일을 업로드해주세요</ImageUploadText>
            <ImageUploadSubText>
              1장의 이미지만 첨부 가능합니다<br />
              1MB 이내의 Jpg, Jpeg, Png 파일만 등록 가능
            </ImageUploadSubText>
            <UploadButton type="button">파일 열기</UploadButton>
          </ImageUploadBox>
          <HiddenInput
            id="business-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleBusinessImageUpload}
          />
        </ImageUploadSection>


      </FormContainer>
      {/* 카테고리 조회 모달 연결 */}
      {categoryModalOpen && (
        <CategorySearchPopup
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          onSelect={handleCategorySelect}
        />
      )}

      {/* 주소 조회 모달 연결 */}
      {addressModalOpen && (
        <AddressSearchModal
          isOpen={addressModalOpen}
          onClose={() => setAddressModalOpen(false)}
          onSelect={(selectedAddress) => {
            setAddress(selectedAddress);
            setAddressModalOpen(false);
          }}
        />
      )}
    </CmsPopup>
  );
};

export default CompanyFormPopup;
