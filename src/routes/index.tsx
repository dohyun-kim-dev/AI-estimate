import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

// Layouts
import RootLayout from '@app/layout';
import AILayout from '@app/ai/layout';
import AIEstimateLayout from '@app/ai-estimate/layout';
import CMSLayout from '@app/superAdmin/layout';
import CompanyCMSLayout from '@app/companyCMS/layout';

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
import CompanyCMSLogin from '@app/companyCMS/login/page';
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
import ExcelPreview from './excelPreview';
import CompletedPage from '@app/completed/page';
import PromptDetailPage from '@app/prompt-detail/page';
import FAQPage from '../app/superAdmin/faq/page';
import ServiceUnavailable from '../pages/ServiceUnavailable';

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
        <Route path="excel-preview" element={<ExcelPreview />} />
        <Route path="completed" element={<CompletedPage />} />
        <Route path="service-unavailable" element={<ServiceUnavailable />} />

        <Route path="*" element={<Navigate to="." replace />} />
      </Route>

      {/* 프롬프트 상세 페이지 - 레이아웃 없이 독립적으로 렌더링 */}
      <Route path="/prompt-detail" element={<PromptDetailPage />} />
      
      {/* 서비스 불가 페이지 - 레이아웃 없이 독립적으로 렌더링 */}
      <Route path="/service-unavailable" element={<ServiceUnavailable />} />

      {/* 새로운 고객사별 CMS 경로 - /:companyCode/cms */}
      <Route path="/:companyCode/cms" element={<Outlet />}>
        <Route element={<CompanyCMSLayout />}>
          <Route index element={<Navigate to="admin-management" replace />} />
          <Route path="login" element={<CompanyCMSLogin />} />
          <Route path="admin-management" element={<CMSAdminMng />} />
          <Route path="user-management" element={<CMSUserMng />} />
          
          <Route path="ai-data">
            <Route index element={<Navigate to="survey" replace />} />
            <Route path="survey" element={<SurveyPage />} />
            <Route path="prompt" element={<PromptPage />} />
            <Route path="wrong-answer" element={<TreeGridPage />} />
            <Route path="conversation-history" element={<AiChatHistoryPage />} />
          </Route>

          <Route path="ai-setting">
            <Route index element={<Navigate to="company-info" replace />} />
            <Route path="company-info" element={<CompanyInfoSettingsPage />} />
            <Route path="management" element={<AigoSettingsPage />} />
          </Route>

          <Route path="user-data">
            <Route index element={<Navigate to="price" replace />} />
            <Route path="price" element={<PriceListPage />} />
            <Route path="proposal" element={<ProposalDownloadPage />} />
            <Route path="inquiry" element={<InquiryPage />} />
          </Route>

          <Route path="faq" element={<FAQPage />} />
          <Route path="terms" element={<CMSTerms />} />
          <Route path="company-settings" element={<CompanyInfoSettingsPage />} />
          <Route path="aigo-settings" element={<AigoSettingsPage />} />
          <Route path="pdf-preview" element={<PDFPreview />} />
          <Route path="excel-preview" element={<ExcelPreview />} />
          <Route path="prompt-detail" element={<PromptDetailPage />} />
        </Route>
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
          <Route path="superadmin/faq" element={<FAQPage />} />
          <Route path="superadmin/terms" element={<CMSTerms />} />
          <Route path="superadmin/pdf-preview" element={<PDFPreview />} />
          <Route path="superadmin/excel-preview" element={<ExcelPreview />} />
          <Route path="superadmin/prompt-detail" element={<PromptDetailPage />} />
        </Route>
          <Route path="pdf-preview" element={<PDFPreview />} />


    </Routes>
  )
}
