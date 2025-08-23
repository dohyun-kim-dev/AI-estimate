'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from '@/components/common/Modal'
import { AppColors } from '@/styles/colors'

type ConfirmButtonProps = {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  width?: number
  buttonLabel?: string
  disabled?: boolean
}

export default function ConfirmButton({
  title,
  content,
  confirmText = '저장',
  cancelText = '취소',
  onConfirm,
  onCancel,
  width = 520,
  buttonLabel = '저장',
  disabled = false,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    setOpen(false)
    onConfirm?.()
  }

  const handleCancel = () => {
    setOpen(false)
    onCancel?.()
  }

  return (
    <>
      <TriggerButton onClick={() => setOpen(true)} disabled={disabled}>
        {buttonLabel}
      </TriggerButton>

      <Modal open={open} title={title} onClose={() => setOpen(false)} width={width}>
        <ContentWrapper>
          <Description>{content}</Description>
          <Actions>
            <PrimaryButton onClick={handleConfirm}>{confirmText}</PrimaryButton>
            <SecondaryButton onClick={handleCancel}>{cancelText}</SecondaryButton>
          </Actions>
        </ContentWrapper>
      </Modal>
    </>
  )
}

const TriggerButton = styled.button`
  justify-content:start;
  padding: 0 20px;
  border-radius: 8px;
  border: none;
  background: ${AppColors.primary};
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;

  &:disabled { opacity: .6; cursor: not-allowed; }
`

const ContentWrapper = styled.div`
  padding: 12px 32px;
`

const Description = styled.p`
  margin: 12px 0 32px;
  font-size: 16px;
  color: ${AppColors.onSurface};
  white-space: pre-line;
`

const SubText = styled.p`
  margin: 0 0 28px;
  font-size: 14px;
  color: ${AppColors.onSurfaceVariant};
`

const Actions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`

const PrimaryButton = styled.button`
  min-width: 140px;
  width: 45%;
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
  min-width: 140px;
    width:45%;
  height: 48px;
  border-radius: 4px;
  border: 1px solid ${AppColors.borderLight};
  background: #ffffff;
  color: ${AppColors.onSurface};
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
`



