import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from '@app/layout'
// ... 기존 import들
    import AiclientRoutes from '@/routes/AiclientRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ⭐️ /aiclient/:companyCode/* 경로로 들어오는 모든 요청을 AiclientRoutes로 전달합니다. */}
      <Route path="/aiclient/:companyCode/*" element={<AiclientRoutes />} />

      {/* Fallback route - aiclient 경로가 아닌 다른 경로를 처리합니다. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}