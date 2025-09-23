'use client';
import React from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { AppColors } from '@/styles/colors';
import TextArea from '@/components/common/TextArea';
import CommonTextField from '@/components/common/TextField';
import { SwitchInput } from '@/components/SwitchInput';


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
    code: string;
    category: string;
    businessNumber: string;
    memo: string;
    licence: string;
    password: string;
    confirmPassword: string;
    email: string;
    cellphone: string;
    address: string;
    ciImage?: File | null;
    businessImage?: File | null;
    errors?: {
      name?: string;
      code?: string;
      category?: string;
      businessNumber?: string;
      memo?: string;
      licence?: string;
      password?: string;
      confirmPassword?: string;
      email?: string;
      cellphone?: string;
      address?: string;
    };
  };
  onFormChange: {
    setName: (value: string) => void;
    setCode: (value: string) => void;
    setCategory: (value: string) => void;
    setBusinessNumber: (value: string) => void;
    setMemo: (value: string) => void;
    setLicence: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setEmail: (value: string) => void;
    setCellphone: (value: string) => void;
    setAddress: (value: string) => void;
  };
  onFileUpload?: {
    onCiImageUpload: (file: File) => void;
    onBusinessImageUpload: (file: File) => void;
  };
}

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
    code,
    category,
    businessNumber,
    memo,
    licence,
    password,
    confirmPassword,
    email,
    cellphone,
    address,
    ciImage,
    businessImage,
    errors = {},
  } = formData;

  const {
    setName,
    setCode,
    setCategory,
    setBusinessNumber,
    setMemo,
    setLicence,
    setPassword,
    setConfirmPassword,
    setEmail,
    setCellphone,
    setAddress,
  } = onFormChange;

  // 등록/수정 모드 구분
  const isEditMode = !!selectedCustomer;
  const popupTitle = isEditMode ? "고객사 수정" : "고객사 등록";

  // 파일 업로드 핸들러
  const handleCiImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload?.onCiImageUpload) {
      onFileUpload.onCiImageUpload(file);
    }
  };

  const handleBusinessImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload?.onBusinessImageUpload) {
      onFileUpload.onBusinessImageUpload(file);
    }
  };

  return (
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
      <FormContainer>
        <CommonTextField
          id="name"
          value={name}
          label="* 카테고리명"
          onChange={(e) => setName(e.target.value)}
          placeholder="카테고리명을 입력하세요"
          errorMessage={errors.name}
        />
        <CommonTextField
          id="code"
          value={code}
          label="* 카테고리코드"
          onChange={(e) => setCode(e.target.value)}
          placeholder="카테고리코드를 입력하세요"
          errorMessage={errors.code}
        />
        <CommonTextField
          id="category"
          value={category}
          label="카테고리"
          onChange={(e) => setCategory(e.target.value)}
          placeholder="카테고리 입력"
          errorMessage={errors.category}
        />
        <CommonTextField
          id="businessNumber"
          value={businessNumber}
          label="사업자번호"
          onChange={(e) => setBusinessNumber(e.target.value)}
          placeholder="사업자등록번호를 입력하세요"
          errorMessage={errors.businessNumber}
        />
        <CommonTextField
          id="memo"
          value={memo}
          label="메모"
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모 입력"
          errorMessage={errors.memo}
        />
        <CommonTextField
          id="licence"
          value={licence}
          label="라이선스"
          onChange={(e) => setLicence(e.target.value)}
          placeholder="라이선스 입력"
          errorMessage={errors.licence}
        />
        {!selectedCustomer && (
          <>
            <CommonTextField
              id="password"
              value={password}
              label="* 비밀번호"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              errorMessage={errors.password}
              type="password"
            />
            <CommonTextField
              id="confirmPassword"
              value={confirmPassword}
              label="* 비밀번호 확인"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인 입력"
              errorMessage={errors.confirmPassword}
              type="password"
            />
          </>
        )}
        <CommonTextField
          id="email"
          value={email}
          label="이메일"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 입력"
          errorMessage={errors.email}
        />
        <CommonTextField
          id="cellphone"
          value={cellphone}
          label="연락처"
          onChange={(e) => setCellphone(e.target.value)}
          placeholder="연락처 입력"
          errorMessage={errors.cellphone}
        />
        <CommonTextField
          id="address"
          value={address}
          label="주소"
          onChange={(e) => setAddress(e.target.value)}
          placeholder="주소 입력"
          errorMessage={errors.address}
        />
        {/* 이미지 첨부 섹션 */}
        <ImageUploadSection>
          <ImageUploadTitle>이미지 첨부</ImageUploadTitle>
          {/* 고객사 CI */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#333' }}>
              * 고객사 CI
            </div>
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
          </div>
          {/* 사업자등록증 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#333' }}>
              * 사업자등록증
            </div>
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
          </div>
        </ImageUploadSection>
      </FormContainer>
    </CmsPopup>
  );
};

export default CompanyFormPopup;
