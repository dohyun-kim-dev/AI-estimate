'use client';
import React from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import TextArea from '@/components/common/TextArea';
import { AppColors } from '@/styles/colors';

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between; /* 좌우로 분리 */
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
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
`;

const PwdChangeButton = styled(FooterButton)`
  background-color: ${AppColors.primary};
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
};

interface AdminFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onPwdChangeClick: () => void;
  onDeleteClick: () => void;
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
  emailYn: 'Y' | 'N';
  setEmailYn: (value: 'Y' | 'N') => void;
  smsYn: 'Y' | 'N';
  setSmsYn: (value: 'Y' | 'N') => void;
  description: string;
  setDescription: (value: string) => void;
  idError: string | null;
  pwdError: string | null;
  confirmPwdError: string | null;
  nameError: string | null;
  emailError: string | null;
  cellphoneError: string | null;
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
  emailYn,
  setEmailYn,
  smsYn,
  setSmsYn,
  description,
  setDescription,
  idError,
  pwdError,
  confirmPwdError,
  nameError,
  emailError,
  cellphoneError,
}) => {
  return (
    <CmsPopup
      title={selectedUser ? "관리자 수정" : "관리자 등록"}
      isOpen={isOpen}
      onClose={onClose}
      isWide={false}
      showRequiredMark={true}
      backgroundColor="white"
      bottomFloating={
        <PopupFooter>
          {/* 왼쪽 영역: 삭제 버튼 */}
          {selectedUser ? (
            <CancelButton
              style={{ backgroundColor: 'eeeeee', color: '#333333' }}
              onClick={onDeleteClick}
            >
              삭제
            </CancelButton>
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
        <CommonTextField
          id="adminId"
          value={userId}
          label="아이디"
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
          id="email"
          value={email}
          label="* 이메일"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 형식으로 입력하세요"
          errorMessage={emailError ?? undefined}
        />
        <CommonTextField
          id="cellphone"
          value={cellphone}
          label="* 연락처"
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d*$/.test(input) && input.length <= 11) {
              setCellphone(input);
            }
          }}
          placeholder="- 제외 하고 입력하세요"
          errorMessage={cellphoneError ?? undefined}
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

        {/* <SwitchInput
          label="이메일 수신"
          value={emailYn}
          onChange={setEmailYn}
          $labelPosition="horizontal"
          labelColor="white"
        />

        <SwitchInput
          label="SMS 수신"
          value={smsYn}
          onChange={setSmsYn}
          $labelPosition="horizontal"
          labelColor="white"
        /> */}

        <TextArea
          id="description"
          value={description}
          label="비고"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="비고를 입력하세요"
          height="200px"
        />
      </FormContainer>
    </CmsPopup>
  );
};

export default AdminFormPopup;
