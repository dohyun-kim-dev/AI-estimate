import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import TextField from '@components/common/TextField';
import Switch from '@components/Switch';
import { AppColors } from '@styles/colors';
import { ThemeProvider } from "styled-components";
import { lightTheme } from "@styles/theme";
const Slider = styled.input.attrs({ type: 'range' }) `
  width: 100%;
  height: 8px;
  background: #ccc;
  border-radius: 4px;
  -webkit-appearance: none;
  appearance: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: ${AppColors.primary};
    border-radius: 50%;
    cursor: pointer;
  }
`;
const SettingsContainer = styled.div `
  max-width: 1050px;
  margin: 0 auto;
  padding: 84px 24px 24px 24px;
`;
const FlexContainer = styled.div `
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;
const MainContent = styled.div `
  flex: 2;
`;
const RightSidebar = styled.div `
  flex: 1;
  width: 100%;
  
  @media (min-width: 1024px) {
    position: sticky;
    top: 120px;
    align-self: flex-start;
  }
`;
const Heading = styled.h2 `
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
`;
const SubHeading = styled.h3 `
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const SubHeadingToggleContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Group = styled.div `
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;
const Card = styled.div `
  background-color: ${({ theme }) => theme.surface1};
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;
const SaveButton = styled.button `
  width: 100%;
  padding: 12px;
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;
  &:hover {
    opacity: 0.9;
  }
`;
const ExternalLink = styled.a `
  background: none;
  border: none;
  color: ${AppColors.primary};
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-top: 8px;
  margin-bottom: 16px;
  display: inline-block;
`;
const Description = styled.p `
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin-bottom: 16px;
`;
const UnderlineButton = styled.button `
  background: none;
  border: none;
  color: ${AppColors.primary};
  text-decoration: underline;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;
export default function AigoSettingsPage() {
    const [formData, setFormData] = useState({
        theme: 'light',
        language: '한국어',
        voice: '여성',
        fontSize: '16px',
        showChatCount: 'On',
        defaultResponseStyle: '',
        toneOfVoice: '',
        apiUsage: '',
        dataRetentionPeriod: '',
        exportFormat: '',
        notifications: '',
        emailNotifications: '',
        pushNotifications: '',
        slackIntegration: '',
        chatHistory: '',
        defaultModel: '',
        customPromptTemplate: '',
        modelParameters: '',
        apiKey: '',
        developerMode: '',
        accountStatus: '',
        subscriptionPlan: '',
        renewalDate: '',
        paymentMethod: '',
        aigoEnabled: true,
        maxGuestQueries: '',
        maxMemberQueries: '',
        maxMonthlyMemberQueries: '',
        maxStaffQueries: '',
        maxMonthlyStaffQueries: '',
        inferencePerformance: 50,
        licenseKey: '',
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleToggle = (name) => {
        setFormData(prev => ({
            ...prev,
            [name]: !prev[name],
        }));
    };
    const handleSliderChange = (e) => {
        setFormData(prev => ({ ...prev, inferencePerformance: parseInt(e.target.value, 10) }));
    };
    return (_jsx(ThemeProvider, { theme: lightTheme, children: _jsxs(SettingsContainer, { children: [_jsx(Heading, { children: "AIGO \uC124\uC815" }), _jsx(FlexContainer, { children: _jsx(MainContent, { children: _jsxs(Card, { children: [_jsxs(SubHeading, { id: "aigo-settings", children: [_jsx("span", { children: "\uACE0\uAC1D\uC6A9 AIGO" }), _jsxs(SubHeadingToggleContainer, { children: [_jsx("span", { children: formData.aigoEnabled ? 'ON' : 'OFF' }), _jsx(Switch, { checked: formData.aigoEnabled, onToggle: () => handleToggle('aigoEnabled') })] })] }), _jsx(Description, { children: "ON \uC2DC \uD65C\uC131\uD654, OFF \uC2DC \uD654\uBA74 \uBC0F \uC11C\uBE44\uC2A4\uAC00 \uBE44\uD65C\uC131\uB429\uB2C8\uB2E4." }), _jsx(SubHeading, { id: "chat-count", children: "\uCC44\uD305 \uC9C8\uC758 \uD69F\uC218 \uC124\uC815" }), _jsx(Description, { children: "AI \uB2F5\uBCC0\uC740 \uC9C8\uC758 \uC751\uB2F5\uC5D0 \uC57D 50\uC6D0 \uB0B4\uC678 \uAC00\uCE58\uB85C \uC0AC\uC6A9\uB429\uB2C8\uB2E4." }), _jsx(Description, { children: "\uBE44\uD68C\uC6D0\uC740 \uCCB4\uD5D8\uC6A9\uC73C\uB85C 10\uD68C\uAC00 \uC801\uB2F9\uD569\uB2C8\uB2E4." }), _jsxs(Group, { children: [_jsx(TextField, { label: "[1\uC77C] \uBE44\uD68C\uC6D0 \uCD5C\uB300 \uC9C8\uC758 \uD69F\uC218", name: "maxGuestQueries", value: formData.maxGuestQueries, onChange: handleChange }), _jsx(TextField, { label: "[1\uC77C] \uB85C\uADF8\uC778 \uD68C\uC6D0 \uCD5C\uB300 \uC9C8\uC758 \uD69F\uC218", name: "maxMemberQueries", value: formData.maxMemberQueries, onChange: handleChange }), _jsx(TextField, { label: "[\uD55C\uB2EC] \uD68C\uC6D0 \uCD5C\uB300 \uC9C8\uC758 \uD69F\uC218", name: "maxMonthlyMemberQueries", value: formData.maxMonthlyMemberQueries, onChange: handleChange }), _jsx(TextField, { label: "[1\uC77C] \uC9C1\uC6D0 \uCD5C\uB300 \uC9C8\uC758 \uD69F\uC218", name: "maxStaffQueries", value: formData.maxStaffQueries, onChange: handleChange }), _jsx(TextField, { label: "[\uD55C\uB2EC] \uC9C1\uC6D0 \uCD5C\uB300 \uC9C8\uC758 \uD69F\uC218", name: "maxMonthlyStaffQueries", value: formData.maxMonthlyStaffQueries, onChange: handleChange })] }), _jsx(SaveButton, { children: "\uC800\uC7A5\uD558\uAE30" }), _jsx(SubHeading, { id: "inference-performance", children: "AI \uCD94\uB860 \uC131\uB2A5 \uC124\uC815" }), _jsx(Description, { children: "AI \uCD94\uB860 \uC131\uB2A5\uC744 \uB192\uC77C\uC218\uB85D \uC804\uBB38\uAC00\uC2A4\uB7FD\uAC8C \uB2F5\uBCC0\uD569\uB2C8\uB2E4." }), _jsx(Description, { children: "0\uC73C\uB85C \uD574\uB193\uC544\uB3C4 \uAE30\uBCF8\uC801\uC778 AI \uB2F5\uBCC0\uC740 \uD6CC\uB96D\uD569\uB2C8\uB2E4." }), _jsx(Description, { children: "\uCD94\uB860 \uC131\uB2A5\uC774 \uB192\uC744\uC218\uB85D \uB2F5\uBCC0 \uC18D\uB3C4\uAC00 \uB290\uB824\uC9C0\uBA70, \uC9C8\uC758 \uB2F9 \uACFC\uAE08 \uBE44\uC6A9\uC774 \uB192\uC544\uC9D1\uB2C8\uB2E4." }), _jsx(ExternalLink, { href: "https://developers.googleblog.com/ko/start-building-with-gemini-25-flash/", target: "_blank", rel: "noopener noreferrer", children: "\uAC00\uACA9\uD45C \uBCF4\uAE30" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsx(Slider, { min: "0", max: "100", value: formData.inferencePerformance, onChange: handleSliderChange }), _jsx("span", { style: { color: "inherit" }, children: formData.inferencePerformance })] }), _jsxs(SubHeading, { id: "color-theme", children: [_jsx("span", { children: "\uCEEC\uB7EC \uD14C\uB9C8 \uC124\uC815" }), _jsxs(SubHeadingToggleContainer, { children: [_jsx("span", { children: formData.theme === 'light' ? 'light' : 'dark' }), _jsx(Switch, { checked: formData.theme === 'dark', onToggle: () => setFormData(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' })) })] })] }), _jsxs(SubHeading, { id: "pro-license", children: [_jsx("span", { children: "Pro \uB77C\uC774\uC13C\uC2A4 \uC785\uB825" }), _jsx(UnderlineButton, { children: "\uC800\uC7A5\uD558\uAE30" })] }), _jsx(Group, { children: _jsx(TextField, { label: "\uB77C\uC774\uC13C\uC2A4", name: "licenseKey", value: formData.licenseKey, onChange: handleChange, placeholder: "\uB77C\uC774\uC13C\uC2A4 \uD0A4\uB97C \uC785\uB825\uD558\uC138\uC694" }) })] }) }) })] }) }));
}
