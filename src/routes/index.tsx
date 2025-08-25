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
import CMSUserMng from '@app/cms/userMng/page'
import PromptPage from '../app/cms/aiData/prompt/page'
import AiChatHistoryPage from '../app/cms/aiData/conversationHistory/page'
import TreeGridPage from '../app/cms/aiData/wrongAnswer/page'
import SurveyPage from '../app/cms/aiData/survey/page'
import CompanyInfoSettingsPage from '@app/cms/company-settings/page'
import AigoSettingsPage from '@app/cms/aigo-settings/page'
import InquiryPage from '../app/cms/userData/inquiry/page'
import PriceListPage from '../app/cms/userData/price/page'
import ProposalDownloadPage from '../app/cms/userData/proposal/page'

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
          <Route path="/cms/login" element={<CMSLogin />} />
          <Route path="/cms/super-admin" element={<CMSSuperAdminMng />} />
          <Route path="/cms/company-management" element={<CMSCompanyMng />} />
          <Route path="/cms/admin-management" element={<CMSAdminMng />} />
          <Route path="/cms/user-management" element={<CMSUserMng />} />
          
          {/* AI Data Management Routes */}
          <Route path="/cms/ai-data">
            <Route index element={<Navigate to="/cms/ai-data/survey" replace />} />
            <Route path="survey" element={<SurveyPage />} />
            <Route path="prompt" element={<PromptPage />} />
            <Route path="wrong-answer" element={<TreeGridPage />} />
            <Route path="conversation-history" element={<AiChatHistoryPage />} />
          </Route>

          {/* AI Settings Routes */}
          <Route path="/cms/ai-setting">
            <Route index element={<Navigate to="/cms/ai-setting/company-info" replace />} />
            <Route path="company-info" element={<CompanyInfoSettingsPage />} />
            <Route path="management" element={<AigoSettingsPage />} />
          </Route>

          {/* User Data Routes */}
          <Route path="/cms/user-data">
            <Route index element={<Navigate to="/cms/user-data/price" replace />} />
            <Route path="price" element={<PriceListPage />} />
            <Route path="proposal" element={<ProposalDownloadPage />} />
            <Route path="inquiry" element={<InquiryPage />} />
          </Route>

          <Route path="/cms/company-settings" element={<CompanyInfoSettingsPage />} />
          <Route path="/cms/aigo-settings" element={<AigoSettingsPage />} />
          <Route path="/cms/terms" element={<CMSTerms />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}