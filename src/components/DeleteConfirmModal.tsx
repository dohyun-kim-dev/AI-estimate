'use client'

import React from 'react'
import styled from 'styled-components'
import Modal from '@/components/common/Modal'

type DeleteConfirmModalProps = {
  open: boolean
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  width?: number
}

export default function DeleteConfirmModal({
  open,
  title = "구간 설정 물가 안내",
  content = "직접 구간에 100% 할인이 설정되어,\n이후 단위도 자동으로 동일하게 100%로 적용됩니다",
  confirmText = "확인",
  cancelText = "아니오",
  onConfirm,
  onCancel,
  width = 400,
}: DeleteConfirmModalProps) {

  return (
    <Modal open={open} title={title} onClose={onCancel} width={width}>
      <ContentWrapper>
        <Description>{content}</Description>
        <Actions>
          <PrimaryButton onClick={onConfirm}>{confirmText}</PrimaryButton>
          <SecondaryButton onClick={onCancel}>{cancelText}</SecondaryButton>
        </Actions>
      </ContentWrapper>
    </Modal>
  )
}

const ContentWrapper = styled.div`
  padding: 12px 32px;
`

const Description = styled.div`
  margin: 12px 0 32px;
  font-size: 16px;
  color: #333;
  white-space: pre-line;
  text-align: center;
  line-height: 1.5;
`

const Actions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`

const PrimaryButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 4px;
  border: none;
  background: #2E3040;
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
`

const SecondaryButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #ffffff;
  color: #333;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
`
