import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
// Layouts
import RootLayout from '@app/layout';
import AILayout from '@app/ai/layout';
import AIEstimateLayout from '@app/ai-estimate/layout';
import CMSLayout from '@app/cms/layout';
// Pages
import Home from '@app/page';
import AI from '@app/ai/page';
import AIMyEstimate from '@app/ai/my-estimate/page';
import AISetting from '@app/ai/setting/page';
import AIEstimate from '@app/ai-estimate/page';
import CMS from '@app/cms/page';
import CMSAdminMng from '@app/cms/adminMng/page';
import CMSCompanyMng from '@app/cms/companyMng/page';
import CMSLogin from '@app/cms/login/page';
import CMSSuperAdminMng from '@app/cms/superAdminMng/page';
import CMSTerms from '@app/cms/terms/page';
import CMSUserMng from '@app/cms/userMng/page';
import PromptPage from '../app/cms/aiData/prompt/page';
import AiChatHistoryPage from '../app/cms/aiData/conversationHistory/page';
import TreeGridPage from '../app/cms/aiData/wrongAnswer/page';
import SurveyPage from '../app/cms/aiData/survey/page';
import CompanyInfoSettingsPage from '@app/cms/company-settings/page';
import AigoSettingsPage from '@app/cms/aigo-settings/page';
import InquiryPage from '../app/cms/userData/inquiry/page';
import PriceListPage from '../app/cms/userData/price/page';
import ProposalDownloadPage from '../app/cms/userData/proposal/page';
export default function AppRoutes() {
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(RootLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/my-estimate", element: _jsx(AIMyEstimate, {}) }), _jsx(Route, { path: "/settings", element: _jsx(AISetting, {}) }), _jsxs(Route, { element: _jsx(AILayout, {}), children: [_jsx(Route, { path: "/ai", element: _jsx(AI, {}) }), _jsx(Route, { path: "/ai/my-estimate", element: _jsx(AIMyEstimate, {}) }), _jsx(Route, { path: "/ai/setting", element: _jsx(AISetting, {}) })] }), _jsx(Route, { element: _jsx(AIEstimateLayout, {}), children: _jsx(Route, { path: "/ai-estimate", element: _jsx(AIEstimate, {}) }) }), _jsxs(Route, { element: _jsx(CMSLayout, {}), children: [_jsx(Route, { path: "/cms", element: _jsx(CMS, {}) }), _jsx(Route, { path: "/cms/login", element: _jsx(CMSLogin, {}) }), _jsx(Route, { path: "/cms/super-admin", element: _jsx(CMSSuperAdminMng, {}) }), _jsx(Route, { path: "/cms/company-management", element: _jsx(CMSCompanyMng, {}) }), _jsx(Route, { path: "/cms/admin-management", element: _jsx(CMSAdminMng, {}) }), _jsx(Route, { path: "/cms/user-management", element: _jsx(CMSUserMng, {}) }), _jsxs(Route, { path: "/cms/ai-data", children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/cms/ai-data/survey", replace: true }) }), _jsx(Route, { path: "survey", element: _jsx(SurveyPage, {}) }), _jsx(Route, { path: "prompt", element: _jsx(PromptPage, {}) }), _jsx(Route, { path: "wrong-answer", element: _jsx(TreeGridPage, {}) }), _jsx(Route, { path: "conversation-history", element: _jsx(AiChatHistoryPage, {}) })] }), _jsxs(Route, { path: "/cms/ai-setting", children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/cms/ai-setting/company-info", replace: true }) }), _jsx(Route, { path: "company-info", element: _jsx(CompanyInfoSettingsPage, {}) }), _jsx(Route, { path: "management", element: _jsx(AigoSettingsPage, {}) })] }), _jsxs(Route, { path: "/cms/user-data", children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/cms/user-data/price", replace: true }) }), _jsx(Route, { path: "price", element: _jsx(PriceListPage, {}) }), _jsx(Route, { path: "proposal", element: _jsx(ProposalDownloadPage, {}) }), _jsx(Route, { path: "inquiry", element: _jsx(InquiryPage, {}) })] }), _jsx(Route, { path: "/cms/company-settings", element: _jsx(CompanyInfoSettingsPage, {}) }), _jsx(Route, { path: "/cms/aigo-settings", element: _jsx(AigoSettingsPage, {}) }), _jsx(Route, { path: "/cms/terms", element: _jsx(CMSTerms, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
