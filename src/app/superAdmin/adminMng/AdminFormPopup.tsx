'use client';
import React, { useState } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import TextArea from '@/components/common/TextArea';
import { SwitchInput } from '@/components/SwitchInput';
import { AppColors } from '@/styles/colors';
import CompanySearchModal from '@/components/CustomList/CompanySearchModal';

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between; /* 좌우로 분리 */
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 0 14px;
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
  border-radius: 4px;
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
  border-radius: 4px;
`;

const PwdChangeButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
  height: 48px;
  width: 160px !important; /* !important를 추가하여 강제로 덮어쓰기 */
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 22px;
  justify-content: space-evenly;
  padding-top: 10px;
`;

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  /* margin: 12px 0; */
`;

const CompanySearchInput = styled.div`
  position: relative;
  width: 100%;
`;

const CompanyTextField = styled(CommonTextField)`
  .text-field-wrapper {
    cursor: pointer;
  }
  
  input {
    cursor: pointer;
    padding-right: 40px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  svg {
    width: 20px;
    height: 20px;
  }
`;

type AdminUser = {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  cellphone: string;
  createAt: string;
  memo?: string;
  emailYn?: 'Y' | 'N';
  smsYn?: 'Y' | 'N';
  description?: string;
  companyCode?: string;
};

interface AdminFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onPwdChangeClick: () => void;
  onDeleteClick: (_id: string) => void; // _id 매개변수 추가
  selectedUser: Partial<AdminUser> | null;
  userId: string;
  setUserId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  cellphone: string;
  setCellphone: (value: string) => void;
  receiveEmail: boolean;
  setReceiveEmail: (value: boolean) => void;
  receiveAlimtalk: boolean;
  setReceiveAlimtalk: (value: boolean) => void;
  description: string;
  setDescription: (value: string) => void;
  idError: string | null;
  pwdError: string | null;
  confirmPwdError: string | null;
  nameError: string | null;
  emailError: string | null;
  cellphoneError: string | null;
  // 고객사 관련 props 추가
  selectedCompanyCode: string;
  selectedCompanyName: string;
  onCompanySelect: (company: { id: string; name: string }) => void;
}

const AdminFormPopup: React.FC<AdminFormPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  onPwdChangeClick,
  onDeleteClick,
  selectedUser,
  userId,
  setUserId,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  name,
  setName,
  email,
  setEmail,
  cellphone,
  setCellphone,
  receiveEmail,
  setReceiveEmail,
  receiveAlimtalk,
  setReceiveAlimtalk,
  description,
  setDescription,
  idError,
  pwdError,
  confirmPwdError,
  nameError,
  emailError,
  cellphoneError,
  // 고객사 관련 props
  selectedCompanyCode,
  selectedCompanyName,
  onCompanySelect,
}) => {
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  return (
    <CmsPopup
      title={selectedUser ? "고객사 관리자 수정" : "고객사 관리자 등록"}
      isOpen={isOpen}
      onClose={onClose}
      isWide={false}
      showRequiredMark={true}
      height='auto'
      backgroundColor="white"
      bottomFloating={
        <PopupFooter>
          {/* 왼쪽 영역: 삭제 버튼 */}
          {selectedUser ? (
            <SaveButton
              onClick={() => selectedUser?._id && onDeleteClick(selectedUser._id)}
            >
              삭제
            </SaveButton>
          ) : (
            <div /> // 빈 영역 유지
          )}

          {/* 오른쪽 영역: 저장/닫기 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveButton onClick={onSave}>저장</SaveButton>
            <CancelButton onClick={onClose}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >
      <FormContainer>
        {/* 문자 · 메일 수신 섹션 */}
        <Title>문자 · 메일 수신</Title>
        
        <SwitchInput
          label="SMS 수신"
          value={receiveAlimtalk}
          onChange={setReceiveAlimtalk}
          $labelPosition="horizontal"
          labelColor="white"
        />
        <SwitchInput
          label="이메일 수신"
          value={receiveEmail}
          onChange={setReceiveEmail}
          $labelPosition="horizontal"
          labelColor="white"
        />


        {/* 관리자 정보 섹션 */}
        <Title>관리자 정보</Title>
        
        {/* 고객사 조회 */}
        <CompanySearchInput>
          <CompanyTextField
            id="companySearch"
            value={selectedCompanyName}
            label="* 고객사"
            placeholder="고객사를 선택하세요"
            readOnly
            onClick={() => setIsCompanyModalOpen(true)}
          />
          <SearchIcon onClick={() => setIsCompanyModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="#9E9E9E"/>
            </svg>
          </SearchIcon>
        </CompanySearchInput>

        <CommonTextField
          id="adminId"
          value={userId}
          label="* 아이디"
          onChange={(e) => setUserId(e.target.value)}
          placeholder="영문자와 숫자를 포함한 6~20자"
          errorMessage={idError ?? undefined}
          readOnly={!!selectedUser} // ✅ 조건부 readOnly
        />

        {/* 신규 등록 시: 아이디 아래에 비밀번호 입력 */}
        {!selectedUser && (
          <CommonTextField
            id="password"
            value={password}
            showSuffixIcon={true}
            label="* 비밀번호"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="영문 + 숫자 + 특수문자 1개 포함 8자리 이상"
            isPasswordField={true}
            errorMessage={pwdError ?? undefined}
          />
        )}
        {/* // 비밀번호 확인 필드 */}
        {!selectedUser && (
          <CommonTextField
            id="confirmPassword"
            value={confirmPassword}
            showSuffixIcon={true}
            label="* 비밀번호 확인"
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="영문 + 숫자 + 특수문자 1개 포함 8자리 이상"
            isPasswordField={true}
            errorMessage={confirmPwdError ?? undefined}
          />
        )}

        <CommonTextField
          id="name"
          value={name}
          label="* 이름"
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          errorMessage={nameError ?? undefined}
        />

        <CommonTextField
          id="cellphone"
          value={cellphone}
          label="* 전화번호"
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d*$/.test(input) && input.length <= 11) {
              setCellphone(input);
            }
          }}
          placeholder="- 제외 하고 입력하세요"
          errorMessage={cellphoneError ?? undefined}
        />
        <CommonTextField
          id="email"
          value={email}
          label="* 이메일"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 형식으로 입력하세요"
          errorMessage={emailError ?? undefined}
        />

        {/* 수정 모드일 때: 이메일 수신 Switch 위에 비밀번호 변경 버튼 */}
        {selectedUser && (
          <div>
            {/* <SwitchLabel>비밀번호 변경</SwitchLabel> */}
            <SwitchRow>
              <PwdChangeButton
                style={{ width: 'auto', padding: '0px 16px', fontSize: '14px' }}
                onClick={onPwdChangeClick}
              >
                비밀번호 변경
              </PwdChangeButton>
            </SwitchRow>
          </div>
        )}

        <Title>비고</Title>

        <TextArea
          id="description"
          value={description}
          label="비고"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="비고를 입력하세요"
          height="200px"
        />
      </FormContainer>

      {/* 고객사 검색 모달 */}
      <CompanySearchModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={(company) => {
          onCompanySelect({ id: company.companyCode, name: company.companyName });
          setIsCompanyModalOpen(false);
        }}
        themeMode="light"
      />
    </CmsPopup>
  );
};

export default AdminFormPopup;
