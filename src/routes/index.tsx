import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'

// Lazy load pages
import { lazy, Suspense } from 'react'
const Home = lazy(() => import('./pages/Home'))
const AIEstimate = lazy(() => import('./pages/estimate/AIEstimate'))
const MyEstimate = lazy(() => import('./pages/estimate/MyEstimate'))
const Settings = lazy(() => import('./pages/settings/Settings'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ai-estimate" element={<AIEstimate />} />
          <Route path="/my-estimate" element={<MyEstimate />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* CMS routes will be added later */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  ) 
}
