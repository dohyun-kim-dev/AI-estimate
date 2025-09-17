'use client'

import React, { createContext, useContext, useRef, useState } from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  color: #fff;
  font-weight: 600;
  gap: 16px;
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const LoadingText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`

interface PageLoaderContextValue {
  open: (message?: string) => void
  close: () => void
}

const Ctx = createContext<PageLoaderContextValue | null>(null)

export const pageLoaderController = {
  open: (_message?: string) => {},
  close: () => {},
}

export function PageLoaderProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('Loading...')

  const open = (customMessage?: string) => {
    setMessage(customMessage || 'Loading...')
    setVisible(true)
  }
  const close = () => setVisible(false)

  // controller에 연결
  pageLoaderController.open = open
  pageLoaderController.close = close

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {visible && (
        <Overlay>
          <Spinner />
          <LoadingText>{message}</LoadingText>
        </Overlay>
      )}
    </Ctx.Provider>
  )
}

export function usePageLoader() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePageLoader must be used within PageLoaderProvider')
  return ctx
}

