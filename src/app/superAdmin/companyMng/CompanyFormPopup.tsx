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
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          닫기
        </button>
        <DaumPostcode
          onComplete={handleComplete}
          style={{
            width: '100%',
            height: '400px',
            border: 'none',
          }}
          autoClose={false}
        />
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
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
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
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 32px 0 12px 0;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  > * {
    flex: 1;
  }
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
    setContractType,
    setMode,
    setLicence,
    setContractStartDate,
    setContractEndDate,
  } = onFormChange;

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

  // 스타일드 컴포넌트
  const DateFieldWrapper = styled.div`
    position: relative;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ddd;
    padding-top: 18px;
    margin-bottom: 0;
  `;
  const DateLabel = styled.label`
    position: absolute;
    top: 4px;
    left: 16px;
    font-size: 13px;
    color: #666;
    background: #fff;
    padding: 0 4px;
    z-index: 2;
    font-weight: 500;
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

const DatePickerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DatePickerContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
        <SwitchInput
          value={mode === 'active'}
          onChange={(isActive) => setMode(isActive ? 'active' : 'inactive')}
          label="챗봇 활성"
          $labelPosition="vertical"
        />

        <SectionTitle>라이선스 유형</SectionTitle>
        

        {/* 계약 기간 */}
        <SectionTitle>계약 기간</SectionTitle>
        <div style={{ marginBottom: '16px' }}>
          <DateFieldWrapper>
            <DateLabel>* 계약 시작일시</DateLabel>
            <DateInput
              type="text"
              value={contractStartDate}
              onChange={(e) => setContractStartDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{ background: '#fff' }}
            />
            <DateIconWrapper onClick={() => setShowStartDatePicker(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M19.5 4H17.5V3C17.5 2.73478 17.3946 2.48043 17.2071 2.29289C17.0196 2.10536 16.7652 2 16.5 2C16.2348 2 15.9804 2.10536 15.7929 2.29289C15.6054 2.48043 15.5 2.73478 15.5 3V4H9.5V3C9.5 2.73478 9.39464 2.48043 9.20711 2.29289C9.01957 2.10536 8.76522 2 8.5 2C8.23478 2 7.98043 2.10536 7.79289 2.29289C7.60536 2.48043 7.5 2.73478 7.5 3V4H5.5C4.70435 4 3.94129 4.31607 3.37868 4.87868C2.81607 5.44129 2.5 6.20435 2.5 7V19C2.5 19.7956 2.81607 20.5587 3.37868 21.1213C3.94129 21.6839 4.70435 22 5.5 22H19.5C20.2956 22 21.0587 21.6839 21.6213 21.1213C22.1839 20.5587 22.5 19.7956 22.5 19V7C22.5 6.20435 22.1839 5.44129 21.6213 4.87868C21.0587 4.31607 20.2956 4 19.5 4ZM20.5 19C20.5 19.2652 20.3946 19.5196 20.2071 19.7071C20.0196 19.8946 19.7652 20 19.5 20H5.5C5.23478 20 4.98043 19.8946 4.79289 19.7071C4.60536 19.5196 4.5 19.2652 4.5 19V12H20.5V19ZM20.5 10H4.5V7C4.5 6.73478 4.60536 6.48043 4.79289 6.29289C4.98043 6.10536 5.23478 6 5.5 6H7.5V7C7.5 7.26522 7.60536 7.51957 7.79289 7.70711C7.98043 7.89464 8.23478 8 8.5 8C8.76522 8 9.01957 7.89464 9.20711 7.70711C9.39464 7.51957 9.5 7.26522 9.5 7V6H15.5V7C15.5 7.26522 15.6054 7.51957 15.7929 7.70711C15.9804 7.89464 16.2348 8 16.5 8C16.7652 8 17.0196 7.89464 17.2071 7.70711C17.3946 7.51957 17.5 7.26522 17.5 7V6H19.5C19.7652 6 20.0196 6.10536 20.2071 6.29289C20.3946 6.48043 20.5 6.73478 20.5 7V10Z" fill="#888888"/>
              </svg>
            </DateIconWrapper>
          </DateFieldWrapper>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <DateFieldWrapper>
            <DateLabel>* 계약 종료일시</DateLabel>
            <DateInput
              type="text"
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{ background: '#fff' }}
            />
            <DateIconWrapper onClick={() => setShowEndDatePicker(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M19.5 4H17.5V3C17.5 2.73478 17.3946 2.48043 17.2071 2.29289C17.0196 2.10536 16.7652 2 16.5 2C16.2348 2 15.9804 2.10536 15.7929 2.29289C15.6054 2.48043 15.5 2.73478 15.5 3V4H9.5V3C9.5 2.73478 9.39464 2.48043 9.20711 2.29289C9.01957 2.10536 8.76522 2 8.5 2C8.23478 2 7.98043 2.10536 7.79289 2.29289C7.60536 2.48043 7.5 2.73478 7.5 3V4H5.5C4.70435 4 3.94129 4.31607 3.37868 4.87868C2.81607 5.44129 2.5 6.20435 2.5 7V19C2.5 19.7956 2.81607 20.5587 3.37868 21.1213C3.94129 21.6839 4.70435 22 5.5 22H19.5C20.2956 22 21.0587 21.6839 21.6213 21.1213C22.1839 20.5587 22.5 19.7956 22.5 19V7C22.5 6.20435 22.1839 5.44129 21.6213 4.87868C21.0587 4.31607 20.2956 4 19.5 4ZM20.5 19C20.5 19.2652 20.3946 19.5196 20.2071 19.7071C20.0196 19.8946 19.7652 20 19.5 20H5.5C5.23478 20 4.98043 19.8946 4.79289 19.7071C4.60536 19.5196 4.5 19.2652 4.5 19V12H20.5V19ZM20.5 10H4.5V7C4.5 6.73478 4.60536 6.48043 4.79289 6.29289C4.98043 6.10536 5.23478 6 5.5 6H7.5V7C7.5 7.26522 7.60536 7.51957 7.79289 7.70711C7.98043 7.89464 8.23478 8 8.5 8C8.76522 8 9.01957 7.89464 9.20711 7.70711C9.39464 7.51957 9.5 7.26522 9.5 7V6H15.5V7C15.5 7.26522 15.6054 7.51957 15.7929 7.70711C15.9804 7.89464 16.2348 8 16.5 8C16.7652 8 17.0196 7.89464 17.2071 7.70711C17.3946 7.51957 17.5 7.26522 17.5 7V6H19.5C19.7652 6 20.0196 6.10536 20.2071 6.29289C20.3946 6.48043 20.5 6.73478 20.5 7V10Z" fill="#888888"/>
              </svg>
            </DateIconWrapper>
          </DateFieldWrapper>
        </div>


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
          label="* 비고"
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
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
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
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
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

        {/* 데이트피커 모달들 */}
        {showStartDatePicker && (
          <DatePickerModal>
            <DatePickerContent>
              <input
                type="date"
                value={contractStartDate}
                onChange={(e) => {
                  setContractStartDate(e.target.value);
                  setShowStartDatePicker(false);
                }}
                style={{
                  border: 'none',
                  fontSize: '16px',
                  padding: '8px',
                }}
              />
            </DatePickerContent>
          </DatePickerModal>
        )}

        {showEndDatePicker && (
          <DatePickerModal>
            <DatePickerContent>
              <input
                type="date"
                value={contractEndDate}
                onChange={(e) => {
                  setContractEndDate(e.target.value);
                  setShowEndDatePicker(false);
                }}
                style={{
                  border: 'none',
                  fontSize: '16px',
                  padding: '8px',
                }}
              />
            </DatePickerContent>
          </DatePickerModal>
        )}
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
