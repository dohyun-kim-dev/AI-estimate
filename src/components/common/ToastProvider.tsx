'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { IoClose, IoCheckmarkCircle, IoAlertCircle, IoInformationCircle } from 'react-icons/io5'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, durationMs?: number) => void
  success: (message: string, durationMs?: number) => void
  error: (message: string, durationMs?: number) => void
  info: (message: string, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const slideDown = keyframes`
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

const deplete = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`

const Container = styled.div`
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  right: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
`

const Card = styled.div`
  background: #ffffff; /* 라이트/다크 공통 화이트 고정 */
  color: #111827; /* neutral-900 */
  border: 1px solid #e5e7eb; /* neutral-200 */
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  pointer-events: all;
  animation: ${slideDown} 0.16s ease both;
  overflow: hidden;
  min-width: 280px;
  max-width: min(360px, calc(100vw - 24px));
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
`

const IconBox = styled.div<{ $type: ToastType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $type }) => ($type === 'success' ? '#6366f1' : $type === 'error' ? '#ef4444' : '#3391FF')};
`

const Message = styled.div`
  font-size: 14px;
  line-height: 1.45;
`

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #9ca3af; /* neutral-400 */
`

const Progress = styled.div<{ $type: ToastType; $duration: number }>`
  height: 4px;
  background: ${({ $type }) => ($type === 'success' ? '#6366f1' : $type === 'error' ? '#ef4444' : '#3391FF')};
  animation: ${deplete} linear forwards;
  animation-duration: ${({ $duration }) => $duration}ms;
`

const TYPE_ICON: Record<ToastType, React.ComponentType<{ size?: number }>> = {
  success: IoCheckmarkCircle,
  error: IoAlertCircle,
  info: IoInformationCircle,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message: string, type: ToastType = 'info', durationMs = 2500) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration: durationMs }])
    window.setTimeout(() => remove(id), durationMs)
  }, [remove])

  const ctx = useMemo<ToastContextValue>(() => ({
    show,
    success: (m, d) => show(m, 'success', d),
    error: (m, d) => show(m, 'error', d),
    info: (m, d) => show(m, 'info', d),
  }), [show])

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <Container>
        {toasts.map((t) => {
          const Icon = TYPE_ICON[t.type]
          return (
            <Card key={t.id}>
              <Row>
                <IconBox $type={t.type}><Icon size={20} /></IconBox>
                <Message>{t.message}</Message>
                <CloseButton aria-label="close" onClick={() => remove(t.id)}>
                  <IoClose size={18} />
                </CloseButton>
              </Row>
              <Progress $type={t.type} $duration={t.duration} />
            </Card>
          )
        })}
      </Container>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
