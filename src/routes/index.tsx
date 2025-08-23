import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import RootLayout from '@app/layout'
import AILayout from '@app/ai/layout'
import AIEstimateLayout from '@app/ai-estimate/layout'
import CMSLayout from '@app/cms/layout'

// Pages
import Home from '@app/page'
import AI from '@app/ai/page'
import AIMyEstimate from '@app/ai/my-estimate/page'
import AISetting from '@app/ai/setting/page'
import AIEstimate from '@app/ai-estimate/page'
import CMS from '@app/cms/page'
import CMSAdminMng from '@app/cms/adminMng/page'
import CMSAiData from '@app/cms/aiData/page'
import CMSAigoSettings from '@app/cms/aigo-settings/page'
import CMSAiSetting from '@app/cms/aiSetting/page'
import CMSCompanySettings from '@app/cms/company-settings/page'
import CMSCompanyMng from '@app/cms/companyMng/page'
import CMSInquiry from '@app/cms/inquiry/page'
import CMSLogin from '@app/cms/login/page'
import CMSSuperAdminMng from '@app/cms/superAdminMng/page'
import CMSTerms from '@app/cms/terms/page'
import CMSUserData from '@app/cms/userData/page'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Main routes */}
        <Route path="/" element={<Home />} />
          <Route path="/my-estimate" element={<AIMyEstimate />} />
          <Route path="/settings" element={<AISetting />} />
        
        {/* AI routes */}
        <Route element={<AILayout />}>
          <Route path="/ai" element={<AI />} />
          <Route path="/ai/my-estimate" element={<AIMyEstimate />} />
          <Route path="/ai/setting" element={<AISetting />} />
        </Route>

        {/* AI Estimate routes */}
        <Route element={<AIEstimateLayout />}>
          <Route path="/ai-estimate" element={<AIEstimate />} />
        </Route>

        {/* CMS routes */}
        <Route element={<CMSLayout />}>
          <Route path="/cms" element={<CMS />} />
          <Route path="/cms/admin-management" element={<CMSAdminMng />} />
          <Route path="/cms/ai-data" element={<CMSAiData />} />
          <Route path="/cms/aigo-settings" element={<CMSAigoSettings />} />
          <Route path="/cms/ai-setting" element={<CMSAiSetting />} />
          <Route path="/cms/company-settings" element={<CMSCompanySettings />} />
          <Route path="/cms/company-management" element={<CMSCompanyMng />} />
          <Route path="/cms/inquiry" element={<CMSInquiry />} />
          <Route path="/cms/login" element={<CMSLogin />} />
          <Route path="/cms/super-admin" element={<CMSSuperAdminMng />} />
          <Route path="/cms/terms" element={<CMSTerms />} />
          <Route path="/cms/user-data" element={<CMSUserData />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}