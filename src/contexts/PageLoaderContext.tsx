'use client'

import React, { createContext, useContext, useRef, useState } from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  color: #fff;
  font-weight: 600;
`

interface PageLoaderContextValue {
  open: () => void
  close: () => void
}

const Ctx = createContext<PageLoaderContextValue | null>(null)

export const pageLoaderController = {
  open: () => {},
  close: () => {},
}

export function PageLoaderProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  // controller에 연결
  pageLoaderController.open = open
  pageLoaderController.close = close

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {visible && <Overlay>Loading...</Overlay>}
    </Ctx.Provider>
  )
}

export function usePageLoader() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePageLoader must be used within PageLoaderProvider')
  return ctx
}

