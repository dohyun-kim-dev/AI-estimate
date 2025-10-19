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
import { uploadFiles, getFileUrl } from '@/lib/api/user/userApi';
import DaumPostcode from 'react-daum-postcode';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { devLog } from '@/utils/devLogger'

// 파일 다운로드 URL 생성 함수
function getDownloadEstimateUrl(companyCode: string, uuid: string) {
  const filePath = `${companyCode}/${uuid}.pdf`;
  return `/file/estimate/download/${filePath}`;
}

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

  &:hover {
  border: 1px solid ${AppColors.border};
}
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};

  &:hover:not(:disabled) {
      border: 1px solid ${AppColors.border};
  }
  
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    border: 1px solid #cccccc;
  }
`;


const SearchButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
  height: 56px;
`;


const ImageUploadSection = styled.div`
  margin-top: 24px;
  // background: #eee;
`;

const ImageUploadTitle = styled.h3`
  // position: absolute;
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
  // background-color: #fafafa;
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
  border-radius: 20px;
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
  name: string; // 고객사 대표명
  companyName: string; // 고객사명(KR)
  dbName: string; // 고객사명(EN)
  cellphone: string;
  email: string;
  companyCode: string; // 고객사코드
  address: string;
  detailAddress: string;
  ciImage: string;
  businessImage: string;
  contractType: 'MONTH' | 'YEAR';
  contractStartDate: string;
  contractEndDate: string;
  aiConfidence: string | null;
  mode: 'LIGHT' | 'DARK';
  category: {
    _id: string;
    name: string;
    code: string;
    createAt?: string;
    updateAt?: string;
  } | null;
  businessNumber?: string;
  memo?: string;
  licence?: string;
  homepage?: string;
  createAt: string;
  updateAt: string;
  no: number;
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
    homepage?: string;
    ciImage?: File | null | string;
    businessImage?: File | null | string;
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
      homepage?: string;
    };
  };
  onFormChange: {
    setName: (value: string) => void;
    setCompanyName: (value: string) => void;
    setCode: (value: string) => void;
    setCategory: (value: string) => void;
    setCategoryId?: (value: string) => void;
    setCategoryCode?: (value: string) => void;
    setBusinessNumber: (value: string) => void;
    setMemo: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setEmail: (value: string) => void;
    setCellphone: (value: string) => void;
    setAddress: (value: string) => void;
    setDetailAddress: (value: string) => void;
    setCeoName: (value: string) => void;
    setCeoPhone?: (value: string) => void;
    setCeoEmail?: (value: string) => void;
    setContractType: (value: string) => void;
    setMode: (value: string) => void;
    setLicence: (value: string) => void;
    setContractStartDate: (value: string) => void;
    setContractEndDate: (value: string) => void;
    setHomepage: (value: string) => void;
    setCiImage: (value: string | undefined) => void;
    setBusinessImage: (value: string | undefined) => void;
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
  width: 100%;
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
    homepage,
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
    setContractType: _setContractType,
    setMode: _setMode,
    setLicence: _setLicence,
    setContractStartDate: _setContractStartDate,
    setContractEndDate: _setContractEndDate,
  } = onFormChange || {};

  // 컴포넌트 내부 상태로 관리하여 UI 반영 - 서버 데이터 형식에 맞게 변환
  const [internalContractType, setInternalContractType] = React.useState(
    contractType === 'MONTH' ? 'monthly' : contractType === 'YEAR' ? 'yearly' : 'monthly'
  );
  const [internalMode, setInternalMode] = React.useState(
    mode === 'LIGHT' ? 'active' : mode === 'DARK' ? 'inactive' : 'active'
  );
  const [internalLicence, setInternalLicence] = React.useState(licence || 'customer');
  const [internalStartDate, setInternalStartDate] = React.useState(
    contractStartDate ? dayjs(contractStartDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [internalEndDate, setInternalEndDate] = React.useState(
    contractEndDate ? dayjs(contractEndDate).format('YYYY-MM-DD') : 
    dayjs(contractStartDate || new Date()).add(contractType === 'MONTH' ? 1 : 12, 'month').format('YYYY-MM-DD')
  );
  
  // 방어 코드 추가 (로그 기록 + 내부 상태 동기화) - 서버 형식으로 변환
  const setContractType = (v: string) => {
    devLog('setContractType called with:', v);
    setInternalContractType(v);
    // 서버 형식으로 변환하여 전달
    const serverFormat = v === 'monthly' ? 'MONTH' : 'YEAR';
    if (_setContractType) _setContractType(serverFormat);
    
    // 계약 유형이 변경되면 종료일 자동 업데이트
    if (internalStartDate) {
      const endDate = dayjs(internalStartDate).add(v === 'monthly' ? 1 : 12, 'month').format('YYYY-MM-DD');
      setInternalEndDate(endDate);
      if (_setContractEndDate) _setContractEndDate(dayjs(endDate).format('YYYY-MM-DD HH:mm:ss'));
    }
  };
  
  const setMode = (v: string) => {
    devLog('setMode called with:', v);
    setInternalMode(v);
    // 서버 형식으로 변환하여 전달
    const serverFormat = v === 'active' ? 'LIGHT' : 'DARK';
    if (_setMode) _setMode(serverFormat);
  };
  
  const setLicence = (v: string) => {
    devLog('setLicence called with:', v);
    setInternalLicence(v);
    if (_setLicence) _setLicence(v);
  };
  
  const setContractStartDate = (v: string) => {
    devLog('setContractStartDate called with:', v);
    setInternalStartDate(v);
    // 서버 형식으로 변환하여 전달 (YYYY-MM-DD HH:mm:ss)
    const serverFormat = dayjs(v).format('YYYY-MM-DD HH:mm:ss');
    if (_setContractStartDate) _setContractStartDate(serverFormat);
  };
  
  const setContractEndDate = (v: string) => {
    devLog('setContractEndDate called with:', v);
    setInternalEndDate(v);
    // 서버 형식으로 변환하여 전달 (YYYY-MM-DD HH:mm:ss)
    const serverFormat = dayjs(v).format('YYYY-MM-DD HH:mm:ss');
    if (_setContractEndDate) _setContractEndDate(serverFormat);
  };

  // 등록/수정 모드 구분
  const isEditMode = !!selectedCustomer;
  const popupTitle = isEditMode ? "고객사 수정" : "고객사 등록";

  // 로딩 상태
  const [isSaving, setIsSaving] = React.useState(false);

  // 저장 핸들러 (벨리데이션 포함)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(); // 부모 컴포넌트의 저장 로직 실행
    } catch (error) {
      console.error('저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 입력 포맷팅 함수들
  const formatBusinessNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '');
    
    // 10자리까지만 허용
    if (numbers.length > 10) return businessNumber;
    
    // 000-00-00000 형식으로 포맷팅
    if (numbers.length >= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
    } else if (numbers.length >= 4) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return numbers;
    }
  };

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '');
    
    // 11자리까지만 허용
    if (numbers.length > 11) return cellphone;
    
    // 전화번호 포맷팅
    if (numbers.startsWith('02')) {
      // 서울 지역번호 (02-XXXX-XXXX)
      if (numbers.length >= 7) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else if (numbers.length >= 3) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      }
    } else if (numbers.startsWith('01')) {
      // 휴대폰 번호 (010-XXXX-XXXX)
      if (numbers.length >= 8) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
      } else if (numbers.length >= 4) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      }
    } else if (numbers.length >= 7) {
      // 기타 지역번호 (XXX-XXXX-XXXX)
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length >= 4) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }
    
    return numbers;
  };

  const handleBusinessNumberChange = (value: string) => {
    const formatted = formatBusinessNumber(value);
    if (setBusinessNumber) setBusinessNumber(formatted);
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    if (setCellphone) setCellphone(formatted);
  };

  // 파일 업로드 핸들러
  const handleCiImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const response = await uploadFiles([file]);
        // 업로드 응답에서 data 배열의 첫 번째 값을 사용
        if (response.data && response.data.length > 0) {
          const fileName = response.data[0]; // 파일명 (예: "45f67d8d-10e1-4c7c-8921-cd98ddac326b_(1).pdf")
          setCiFileId(fileName);
          setCiPreview(URL.createObjectURL(file));
          
          // 부모 컴포넌트의 상태도 업데이트
          if (onFormChange?.setCiImage) {
            onFormChange.setCiImage(fileName);
          }
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
        // 업로드 응답에서 data 배열의 첫 번째 값을 사용
        if (response.data && response.data.length > 0) {
          const fileName = response.data[0]; // 파일명 (예: "45f67d8d-10e1-4c7c-8921-cd98ddac326b_(1).pdf")
          setBusinessFileId(fileName);
          
          // PDF 파일인 경우 파일명만 저장, 이미지 파일인 경우 미리보기 생성
          if (file.type === 'application/pdf') {
            setBusinessPreview(`PDF: ${file.name}`);
          } else {
            setBusinessPreview(URL.createObjectURL(file));
          }
          
          // 부모 컴포넌트의 상태도 업데이트
          if (onFormChange?.setBusinessImage) {
            onFormChange.setBusinessImage(fileName);
          }
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

  // 선택된 고객사 정보가 변경될 때 모든 상태 초기화/설정
  React.useEffect(() => {
    if (selectedCustomer && isEditMode) {
      // 수정 모드일 때 기존 정보 설정
      
      // 이미지 미리보기 설정
      if (selectedCustomer.ciImage) {
        setCiPreview(getFileUrl(selectedCustomer.ciImage));
      } else {
        setCiPreview('');
      }
      
      if (selectedCustomer.businessImage) {
        const fileUrl = getFileUrl(selectedCustomer.businessImage);
        // 파일 확장자를 확인하여 PDF 파일인지 판단
        if (selectedCustomer.businessImage.toLowerCase().endsWith('.pdf')) {
          setBusinessPreview(`PDF: ${selectedCustomer.businessImage}`);
        } else {
          setBusinessPreview(fileUrl);
        }
      } else {
        setBusinessPreview('');
      }
      
      // 카테고리 정보 설정 - 서버 데이터 구조에 맞게 수정
      if (selectedCustomer.category) {
        setSelectedCategory({
          name: selectedCustomer.category.name,
          code: selectedCustomer.category.code
        });
        // 부모 컴포넌트의 카테고리 상태도 업데이트
        if (onFormChange?.setCategory) {
          onFormChange.setCategory(selectedCustomer.category.name);
        }
        if (onFormChange?.setCategoryId) {
          onFormChange.setCategoryId(selectedCustomer.category._id);
        }
        if (onFormChange?.setCategoryCode) {
          onFormChange.setCategoryCode(selectedCustomer.category.code);
        }
      } else {
        setSelectedCategory(null);
      }
      
      // 계약 관련 내부 상태 설정
      setInternalContractType(
        selectedCustomer.contractType === 'MONTH' ? 'monthly' : 
        selectedCustomer.contractType === 'YEAR' ? 'yearly' : 'monthly'
      );
      setInternalMode(
        selectedCustomer.mode === 'LIGHT' ? 'active' : 
        selectedCustomer.mode === 'DARK' ? 'inactive' : 'active'
      );
      setInternalLicence(selectedCustomer.licence || 'customer');
      
      // 날짜 설정
      if (selectedCustomer.contractStartDate) {
        setInternalStartDate(dayjs(selectedCustomer.contractStartDate).format('YYYY-MM-DD'));
      }
      if (selectedCustomer.contractEndDate) {
        setInternalEndDate(dayjs(selectedCustomer.contractEndDate).format('YYYY-MM-DD'));
      }
      
      // 홈페이지 정보 설정
      if (onFormChange?.setHomepage && selectedCustomer.homepage) {
        onFormChange.setHomepage(selectedCustomer.homepage);
      }
      
    } else {
      // 신규 생성 모드일 때 모든 상태 초기화
      setCiPreview('');
      setBusinessPreview('');
      setCiFileId('');
      setBusinessFileId('');
      setSelectedCategory(null);
      
      // 내부 상태들도 기본값으로 초기화
      setInternalContractType('monthly');
      setInternalMode('active');
      setInternalLicence('customer');
      const startDate = dayjs().format('YYYY-MM-DD');
      const endDate = dayjs().add(1, 'month').format('YYYY-MM-DD');
      setInternalStartDate(startDate);
      setInternalEndDate(endDate);
      
      // 부모 컴포넌트 상태도 업데이트
      if (_setContractType) _setContractType('MONTH');
      if (_setMode) _setMode('LIGHT');
      if (_setLicence) _setLicence('customer');
      if (_setContractStartDate) _setContractStartDate(dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'));
      if (_setContractEndDate) _setContractEndDate(dayjs(endDate).format('YYYY-MM-DD HH:mm:ss'));
    }
  }, [selectedCustomer, isEditMode]);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (cat: {categoryId: string, categoryName: string, categoryCode: string}) => {
    // 선택된 카테고리 정보 저장
    setSelectedCategory({ name: cat.categoryName, code: cat.categoryCode });
    setCategory(cat.categoryName); // 화면에 표시용
    
    // 부모 컴포넌트의 상태도 업데이트
    if (onFormChange?.setCategoryId) {
      onFormChange.setCategoryId(cat.categoryId);
    }
    if (onFormChange?.setCategoryCode) {
      onFormChange.setCategoryCode(cat.categoryCode);
    }
    
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
    
    // 시작일/종료일 업데이트 (서버 형식으로 전달)
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

const Flex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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

const CategoryFieldWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CategoryIconWrapper = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  border-radius: 50%;
  background-color: #777777;
  color: white;
  font-size: 14px;
  line-height: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #555555;
  }
  
  &:before {
    content: "×";
    font-weight: bold;
  }
`;  return (
    <CmsPopup
      title={popupTitle}
      isOpen={isOpen}
      onClose={() => {
        setCategoryModalOpen(false);
        onClose();
      }}
      backgroundColor="#FFF"
      bottomFloating={
        <PopupFooter>
          <div />
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveButton 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </SaveButton>
            <CancelButton onClick={() => {
              setCategoryModalOpen(false);
              onClose();
            }}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >

        {/* 챗봇 활성 상태 */}
        <Flex>
                <SectionTitle>챗봇 활성</SectionTitle>

        <SwitchInput
          value={internalMode === 'active'}
          onChange={(isActive) => setMode(isActive ? 'active' : 'inactive')}
          $labelPosition="horizontal"
          // label={internalMode === 'active' ? '활성화' : '비활성화'}
        />
</Flex>
        <SectionTitle>라이선스 유형</SectionTitle>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <ToggleButton 
            active={internalLicence === 'customer'}
            onClick={() => setLicence('customer')}
          >
            Pro
          </ToggleButton>
          {/* <ToggleButton 
            active={internalLicence === 'employee'}
            onClick={() => setLicence('employee')}
          >
            Pro (직원용)
          </ToggleButton> */}
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
        {/* 고객사 기본 정보 */}
        <SectionTitle>고객사 기본 정보</SectionTitle>
        <CommonTextField
          id="companyName"
          value={companyName || ''}
          label="* 고객사명(KR)"
          onChange={(e) => setCompanyName && setCompanyName(e.target.value)}
          placeholder="고객사명을 입력하세요"
          errorMessage={errors?.companyName}
        />
        <CommonTextField
          id="ceoName"
          value={ceoName || ''}
          label="* 고객사명(EN)"
          onChange={(e) => setCeoName && setCeoName(e.target.value)}
          placeholder="고객사명(영문)을 입력하세요"
          errorMessage={errors?.ceoName}
        />
        <CommonTextField
          id="code"
          value={code || ''}
          label="* 고객사코드"
          onChange={(e) => setCode && setCode(e.target.value)}
          placeholder="고객사코드를 입력하세요"
          errorMessage={errors?.code}
        />
        <CategoryFieldWrapper>
          <CommonTextField
            id="category"
            value={selectedCategory ? selectedCategory.name : category}
            label="* 카테고리"
            onClick={() => setCategoryModalOpen(true)}
            readOnly
            placeholder="카테고리를 선택하세요"
            errorMessage={errors.category}
            style={{ cursor: 'pointer', paddingRight: '44px' }}
          />
          <CategoryIconWrapper onClick={() => setCategoryModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="#888888"/>
            </svg>
          </CategoryIconWrapper>
        </CategoryFieldWrapper>
        <CommonTextField
          id="businessNumber"
          value={businessNumber || ''}
          label="* 사업자번호"
          onChange={(e) => handleBusinessNumberChange(e.target.value)}
          placeholder="사업자번호를 입력하세요 (예: 123-45-67890)"
          errorMessage={errors?.businessNumber}
        />
        <CommonTextField
          id="homepage"
          value={homepage || ''}
          label="홈페이지"
          onChange={(e) => onFormChange?.setHomepage && onFormChange.setHomepage(e.target.value)}
          placeholder="홈페이지 URL을 입력하세요 (예: www.example.com)"
          errorMessage={errors?.homepage}
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
          style={{ cursor: 'pointer' }}
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
          value={name || ''}
          label="* 고객사 대표명"
          onChange={(e) => setName && setName(e.target.value)}
          placeholder="대표명을 입력하세요"
          errorMessage={errors?.name}
        />
        <CommonTextField
          id="representativePhone"
          value={cellphone || ''}
          label="* 대표 전화번호"
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
          errorMessage={errors?.cellphone}
        />
        <CommonTextField
          id="representativeEmail"
          value={email || ''}
          label="* 대표 이메일"
          onChange={(e) => setEmail && setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          errorMessage={errors?.email}
        />

        {/* 비고 */}
        <SectionTitle>비고</SectionTitle>
        <TextArea
          id="memo"
          value={memo || ''}
          label="비고"
          onChange={(e) => setMemo && setMemo(e.target.value)}
          placeholder="비고를 입력하세요"
          errorMessage={errors?.memo}
          height="120px"
        />

        {/* 이미지 첨부 */}
        <SectionTitle>이미지 첨부</SectionTitle>
        <ImageUploadSection>
          <div>
          <ImageUploadTitle>* 고객사 CI</ImageUploadTitle>
          {ciPreview ? (
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
                onError={(e) => {
                  console.error('CI 이미지 로드 실패');
                  setCiPreview(''); // 미리보기 상태 초기화하여 업로드 박스 표시
                }}
              />
              
              <RemoveImageButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setCiFileId('');
                  setCiPreview('');
                  // 부모 컴포넌트 상태도 초기화
                  if (onFormChange?.setCiImage) {
                    onFormChange.setCiImage(undefined);
                  }
                }}
              />
            </div>
            
          ) : (
            <ImageUploadBox onClick={() => document.getElementById('ci-upload')?.click()}>
              <ImageUploadText>파일을 업로드해주세요</ImageUploadText>
              <ImageUploadSubText>
                <p style={{color: '#CA7575'}}>1장의 이미지만 첨부 가능합니다</p>
                1MB 이내의 Jpg, Jpeg, Png 파일만 등록 가능
              </ImageUploadSubText>
              <UploadButton type="button">파일 열기</UploadButton>
            </ImageUploadBox>
          )}</div>
          <HiddenInput
            id="ci-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleCiImageUpload}
          />
          
          <ImageUploadTitle style={{ marginTop: '24px' }}>* 사업자등록증</ImageUploadTitle>
          {businessPreview ? (
            <div style={{ marginBottom: '16px', textAlign: 'center', position: 'relative', color:'black'}}>
              {businessPreview.startsWith('PDF:') ? (
                // PDF 파일인 경우 파일명 표시
                <div style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="#dc3545"/>
                  </svg>
                  <span>{businessPreview}</span>
                </div>
              ) : (
                // 이미지 파일인 경우 미리보기 표시
                <img
                  src={businessPreview}
                  alt="사업자등록증 미리보기"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                  onError={(e) => {
                    console.error('사업자등록증 이미지 로드 실패');
                    setBusinessPreview(''); // 미리보기 상태 초기화하여 업로드 박스 표시
                  }}
                />
              )}
              <RemoveImageButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setBusinessFileId('');
                  setBusinessPreview('');
                  // 부모 컴포넌트 상태도 초기화
                  if (onFormChange?.setBusinessImage) {
                    onFormChange.setBusinessImage(undefined);
                  }
                }}
              />
            </div>
          ) : (
            <ImageUploadBox onClick={() => document.getElementById('business-upload')?.click()}>
              <ImageUploadText>파일을 업로드해주세요</ImageUploadText>
              <ImageUploadSubText>
                <p style={{color: '#CA7575'}}>1개의 파일만 첨부 가능합니다</p>
                10MB 이내의 Jpg, Jpeg, Png, PDF 파일만 등록 가능
              </ImageUploadSubText>
              <UploadButton type="button">파일 열기</UploadButton>
            </ImageUploadBox>
          )}
          <HiddenInput
            id="business-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
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
          showEditActions={false}
          selectedCategoryId={selectedCustomer?.category?._id}
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
