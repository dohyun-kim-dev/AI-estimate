import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

// Layouts
import RootLayout from '@app/layout';
import AILayout from '@app/ai/layout';
import AIEstimateLayout from '@app/ai-estimate/layout';
import CMSLayout from '@app/superAdmin/layout';

// Pages
import Home from '@app/page';
import AI from '@app/ai/page';
import AIMyEstimate from '@app/ai/my-estimate/page';
import AISetting from '@app/ai/setting/page';
import AIShare from '@app/ai/share/page';
import AIEstimate from '@app/ai-estimate/page';
import CMS from '@app/superAdmin/page';
import CMSAdminMng from '@app/superAdmin/adminMng/page';
import CMSCompanyMng from '@app/superAdmin/companyMng/page';
import CMSLogin from '@app/superAdmin/login/page';
import CMSSuperAdminMng from '@app/superAdmin/superAdminMng/page';
import CMSTerms from '@app/superAdmin/terms/page';
import CMSUserMng from '@app/superAdmin/userMng/page';
import PromptPage from '../app/superAdmin/aiData/prompt/page';
import AiChatHistoryPage from '../app/superAdmin/aiData/conversationHistory/page';
import TreeGridPage from '../app/superAdmin/aiData/wrongAnswer/page';
import SurveyPage from '../app/superAdmin/aiData/survey/page';
import CompanyInfoSettingsPage from '@app/superAdmin/company-settings/page';
import AigoSettingsPage from '@app/superAdmin/aigo-settings/page';
import InquiryPage from '../app/superAdmin/userData/inquiry/page';
import PriceListPage from '../app/superAdmin/userData/price/page';
import ProposalDownloadPage from '../app/superAdmin/userData/proposal/page';
import PDFPreview from './pdfPreview';

export default function AppRoutes() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/aiclient/:companyCode" element={<Outlet />}>
        {/*
          RootLayout의 헤더와 푸터를 사용할 페이지들을 RootLayout으로 감싸는 구조로 변경했습니다.
          http://localhost:5173/aiclient/heredot 경로에서 RootLayout이 렌더링됩니다.
        */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="my-estimate" element={<AIMyEstimate />} />
          <Route path="settings" element={<AISetting />} />
        </Route>
        
        <Route element={<AILayout />}>
          <Route path="ai" element={<AI />} />
          <Route path="ai/my-estimate" element={<AIMyEstimate />} />
          <Route path="ai/setting" element={<AISetting />} />
        </Route>

          {/* 공유 링크에 불필요한 텍스트가 붙은 경우도 처리하기 위해 와일드카드 라우트 추가 */}
          <Route path="ai/share/:sessionId" element={<AIShare />} />
          <Route path="ai/share/*" element={<AIShare />} />

        <Route element={<AIEstimateLayout />}>
          <Route path="ai-estimate" element={<AIEstimate />} />
        </Route>

        <Route path="pdf-preview" element={<PDFPreview />} />

        <Route element={<CMSLayout />}>
          <Route path="cms" element={<CMS />} />
          <Route path="cms/login" element={<CMSLogin />} />
          <Route path="cms/super-admin" element={<CMSSuperAdminMng />} />
          <Route path="cms/company-management" element={<CMSCompanyMng />} />
          <Route path="cms/admin-management" element={<CMSAdminMng />} />
          <Route path="cms/user-management" element={<CMSUserMng />} />
          
          <Route path="cms/ai-data">
            <Route index element={<Navigate to="survey" replace />} />
            <Route path="survey" element={<SurveyPage />} />
            <Route path="prompt" element={<PromptPage />} />
            <Route path="wrong-answer" element={<TreeGridPage />} />
            <Route path="conversation-history" element={<AiChatHistoryPage />} />
          </Route>

          <Route path="cms/ai-setting">
            <Route index element={<Navigate to="company-info" replace />} />
            <Route path="company-info" element={<CompanyInfoSettingsPage />} />
            <Route path="management" element={<AigoSettingsPage />} />
          </Route>

          <Route path="cms/user-data">
            <Route index element={<Navigate to="price" replace />} />
            <Route path="price" element={<PriceListPage />} />
            <Route path="proposal" element={<ProposalDownloadPage />} />
            <Route path="inquiry" element={<InquiryPage />} />
          </Route>

          <Route path="cms/company-settings" element={<CompanyInfoSettingsPage />} />
          <Route path="cms/aigo-settings" element={<AigoSettingsPage />} />
          <Route path="cms/terms" element={<CMSTerms />} />
        </Route>

        

        <Route path="*" element={<Navigate to="." replace />} />
      </Route>

      <Route element={<CMSLayout />}>
          <Route path="superadmin" element={<CMS />} />
          <Route path="superadmin/login" element={<CMSLogin />} />
          <Route path="superadmin/super-admin" element={<CMSSuperAdminMng />} />
          <Route path="superadmin/company-management" element={<CMSCompanyMng />} />
          <Route path="superadmin/admin-management" element={<CMSAdminMng />} />
          <Route path="superadmin/user-management" element={<CMSUserMng />} />
          
          <Route path="superadmin/ai-data">
            <Route index element={<Navigate to="survey" replace />} />
            <Route path="survey" element={<SurveyPage />} />
            <Route path="prompt" element={<PromptPage />} />
            <Route path="wrong-answer" element={<TreeGridPage />} />
            <Route path="conversation-history" element={<AiChatHistoryPage />} />
          </Route>

          <Route path="superadmin/ai-setting">
            <Route index element={<Navigate to="company-info" replace />} />
            <Route path="company-info" element={<CompanyInfoSettingsPage />} />
            <Route path="management" element={<AigoSettingsPage />} />
          </Route>

          <Route path="superadmin/user-data">
            <Route index element={<Navigate to="price" replace />} />
            <Route path="price" element={<PriceListPage />} />
            <Route path="proposal" element={<ProposalDownloadPage />} />
            <Route path="inquiry" element={<InquiryPage />} />
          </Route>

          <Route path="superadmin/company-settings" element={<CompanyInfoSettingsPage />} />
          <Route path="superadmin/aigo-settings" element={<AigoSettingsPage />} />
          <Route path="superadmin/terms" element={<CMSTerms />} />
        </Route>
    </Routes>
  )
}
