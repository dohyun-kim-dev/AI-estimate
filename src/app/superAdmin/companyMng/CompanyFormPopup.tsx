'use client';
import React from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { AppColors } from '@/styles/colors';

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
  id: string;
  name: string;
  ceo: string;
  businessNo: string;
  adminId: string;
  email: string;
  cellphone: string;
  address: string;
  description: string;
  createdTime: string | null;
  lastLoginTime: string | null;
};

interface CompanyFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedCustomer: Partial<Customer> | null;
  formData: {
    customerId: string;
    password: string;
    confirmPassword: string;
    name: string;
    ceo: string;
    businessNo: string;
    adminId: string;
    email: string;
    cellphone: string;
    address: string;
    description: string;
    pwdError: string | null;
    confirmPwdError: string | null;
  };
  onFormChange: {
    setCustomerId: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setName: (value: string) => void;
    setCeo: (value: string) => void;
    setBusinessNo: (value: string) => void;
    setAdminId: (value: string) => void;
    setEmail: (value: string) => void;
    setCellphone: (value: string) => void;
    setAddress: (value: string) => void;
    setDescription: (value: string) => void;
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
    customerId,
    password,
    confirmPassword,
    name,
    ceo,
    businessNo,
    adminId,
    email,
    cellphone,
    address,
    description,
    pwdError,
    confirmPwdError,
  } = formData;

  const {
    setCustomerId,
    setPassword,
    setConfirmPassword,
    setName,
    setCeo,
    setBusinessNo,
    setAdminId,
    setEmail,
    setCellphone,
    setAddress,
    setDescription,
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
        <TextField
          radius="0"
          value={customerId}
          label="* 고객사 ID"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="고객사 고유 ID를 입력하세요"
          readOnly={!!selectedCustomer}
        />

        {/* 신규 등록 시: 비밀번호/비밀번호 확인 */}
        {!selectedCustomer && (
          <>
            <TextField
              radius="0"
              value={password}
              showSuffixIcon
              label="* 비밀번호"
              $labelPosition="horizontal"
              labelColor="white"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="영문 + 숫자 + 특수문자 1개 포함 8자리 이상"
              isPasswordField
              errorMessage={pwdError ?? undefined}
            />

            <TextField
              radius="0"
              value={confirmPassword}
              showSuffixIcon
              label="* 비밀번호 확인"
              $labelPosition="horizontal"
              labelColor="white"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              isPasswordField
              errorMessage={confirmPwdError ?? undefined}
            />
          </>
        )}

        <TextField
          radius="0"
          value={name}
          label="* 고객사명"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setName(e.target.value)}
          placeholder="고객사명을 입력하세요"
        />
        <TextField
          radius="0"
          value={ceo}
          label="대표명"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setCeo(e.target.value)}
          placeholder="대표자명을 입력하세요"
        />
        <TextField
          radius="0"
          value={businessNo}
          label="사업자번호"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setBusinessNo(e.target.value)}
          placeholder="사업자등록번호를 입력하세요 (예: 123-45-67890)"
        />
        <TextField
          radius="0"
          value={email}
          label="이메일"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 형식으로 입력하세요"
        />
        <TextField
          radius="0"
          value={cellphone}
          label="연락처"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d*$/.test(input)) setCellphone(input);
          }}
          placeholder="- 없이 숫자만 입력"
        />
        <TextField
          radius="0"
          value={address}
          label="주소"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setAddress(e.target.value)}
          placeholder="도로명/상세주소 입력"
        />
        <TextField
          radius="0"
          value={description}
          label="비고"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="기타 참고 사항 입력"
          multiline
          minLines={3}
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
