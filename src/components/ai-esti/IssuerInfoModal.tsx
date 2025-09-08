"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import TextField from "@/components/common/TextField";
import TermsAgreement from "./TermsAgreement";

const Form = styled.form`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
  height: 44px;
  border-radius: 8px;
  background: ${({ disabled }) => (disabled ? "#9aa3ff" : "#2D50FF")};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  border: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  margin-top: 16px;
  &:hover {
    opacity: ${({ disabled }) => (disabled ? 1 : 0.9)};
  }
`;

export type IssuerInfo = {
  name: string;
  email: string;
  cellphone: string;
  privacyAgreed: boolean;
  termsAgreed: boolean;
};

type IssuerInfoModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (info: IssuerInfo) => void;
  /** 초기값이 있으면 전달 (선택) */
  initial?: Partial<IssuerInfo>;
};

const defaultInfo: IssuerInfo = {
  name: "",
  email: "",
  cellphone: "",
  privacyAgreed: false,
  termsAgreed: false,
};

const IssuerInfoModal: React.FC<IssuerInfoModalProps> = ({
  open,
  onClose,
  onSubmit,
  initial,
}) => {
  const [info, setInfo] = useState<IssuerInfo>({ ...defaultInfo, ...initial });

  useEffect(() => {
    // open될 때 초기값 반영/리셋
    if (open) {
      setInfo({ ...defaultInfo, ...initial });
    }
  }, [open, initial]);

  const onlyDigits = (s: string) => s.replace(/[^0-9]/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!info.name || !info.email || !info.cellphone) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }
    if (!info.privacyAgreed || !info.termsAgreed) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    onSubmit(info);
  };

  const isDisabled =
    !info.name ||
    !info.email ||
    !info.cellphone ||
    !info.privacyAgreed ||
    !info.termsAgreed;

  return (
    <Modal open={open} title="발행자 정보 입력" onClose={onClose} width={520} centerTitle={true}>
      <div style={{ fontSize: 14, textAlign: "center", marginBottom: 32 }} />
      <Form onSubmit={handleSubmit}>
        <TextField
          id="issuer-name"
          label="이름"
          placeholder="이름을 입력해주세요"
          required
          value={info.name}
          onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))}
        />
        <TextField
          id="issuer-email"
          label="이메일"
          type="email"
          placeholder="이메일을 입력해주세요"
          required
          value={info.email}
          onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))}
        />
        <TextField
          id="issuer-phone"
          label="전화번호"
          placeholder="전화번호를 입력해주세요"
          required
          value={info.cellphone}
          pattern="[0-9]{10,11}"
          type="tel"
          maxLength={11}
          onChange={(e) =>
            setInfo((p) => ({ ...p, cellphone: onlyDigits(e.target.value) }))
          }
        />

        <TermsAgreement
          onAgreeChange={(privacy, terms) =>
            setInfo((p) => ({
              ...p,
              privacyAgreed: privacy,
              termsAgreed: terms,
            }))
          }
          initialPrivacyAgreed={info.privacyAgreed}
          initialTermsAgreed={info.termsAgreed}
        />

        <SubmitButton type="submit" disabled={isDisabled}>
          완료하기
        </SubmitButton>
      </Form>
    </Modal>
  );
};

export default IssuerInfoModal;
