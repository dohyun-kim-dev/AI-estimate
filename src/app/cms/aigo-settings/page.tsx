import React, { useState } from 'react';
import styled from 'styled-components';
import TextField from '@components/common/TextField';
import Switch from '@components/Switch';
import { AppColors } from '@styles/colors';
import { Link } from 'react-router-dom';

const Slider = styled.input.attrs({ type: 'range' })`
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

const SettingsContainer = styled.div`
  max-width: 1050px;
  margin: 0 auto;
  padding: 84px 24px 24px 24px;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const MainContent = styled.div`
  flex: 2;
`;

const RightSidebar = styled.div`
  flex: 1;
  width: 100%;
  
  @media (min-width: 1024px) {
    position: sticky;
    top: 120px;
    align-self: flex-start;
  }
`;

const Heading = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const SubHeading = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SubHeadingToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const SaveButton = styled.button`
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

const ExternalLink = styled.a`
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

const Description = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin-bottom: 16px;
`;

const UnderlineButton = styled.button`
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, inferencePerformance: parseInt(e.target.value, 10) }));
  };

  return (
    <SettingsContainer>
      <Heading>AIGO 설정</Heading>
      <FlexContainer>
        <MainContent>
          <Card>
            {/* 고객용 AIGO */}
            <SubHeading id="aigo-settings">
              <span>고객용 AIGO</span>
              <SubHeadingToggleContainer>
                <span>{formData.aigoEnabled ? 'ON' : 'OFF'}</span>
                <Switch
                  checked={formData.aigoEnabled}
                  onToggle={() => handleToggle('aigoEnabled')}
                />
              </SubHeadingToggleContainer>
            </SubHeading>
            <Description>ON 시 활성화, OFF 시 화면 및 서비스가 비활성됩니다.</Description>

            {/* 채팅 질의 횟수 설정 */}
            <SubHeading id="chat-count">채팅 질의 횟수 설정</SubHeading>
            <Description>AI 답변은 질의 응답에 약 50원 내외 가치로 사용됩니다.</Description>
            <Description>비회원은 체험용으로 10회가 적당합니다.</Description>
            <Group>
              <TextField
                label="[1일] 비회원 최대 질의 횟수"
                name="maxGuestQueries"
                value={formData.maxGuestQueries}
                onChange={handleChange}
              />
              <TextField
                label="[1일] 로그인 회원 최대 질의 횟수"
                name="maxMemberQueries"
                value={formData.maxMemberQueries}
                onChange={handleChange}
              />
              <TextField
                label="[한달] 회원 최대 질의 횟수"
                name="maxMonthlyMemberQueries"
                value={formData.maxMonthlyMemberQueries}
                onChange={handleChange}
              />
              <TextField
                label="[1일] 직원 최대 질의 횟수"
                name="maxStaffQueries"
                value={formData.maxStaffQueries}
                onChange={handleChange}
              />
              <TextField
                label="[한달] 직원 최대 질의 횟수"
                name="maxMonthlyStaffQueries"
                value={formData.maxMonthlyStaffQueries}
                onChange={handleChange}
              />
            </Group>
            <SaveButton>저장하기</SaveButton>

            {/* AI 추론 성능 설정 */}
            <SubHeading id="inference-performance">AI 추론 성능 설정</SubHeading>
            <Description>AI 추론 성능을 높일수록 전문가스럽게 답변합니다.</Description>
            <Description>0으로 해놓아도 기본적인 AI 답변은 훌륭합니다.</Description>
            <Description>추론 성능이 높을수록 답변 속도가 느려지며, 질의 당 과금 비용이 높아집니다.</Description>
            <ExternalLink href="https://developers.googleblog.com/ko/start-building-with-gemini-25-flash/" target="_blank" rel="noopener noreferrer">
              가격표 보기
            </ExternalLink>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Slider
                min="0"
                max="100"
                value={formData.inferencePerformance}
                onChange={handleSliderChange}
              />
              <span style={{ color: "inherit" }}>{formData.inferencePerformance}</span>
            </div>

            {/* 컬러 테마 설정 */}
            <SubHeading id="color-theme">
              <span>컬러 테마 설정</span>
              <SubHeadingToggleContainer>
                <span>{formData.theme === 'light' ? 'light' : 'dark'}</span>
                <Switch
                  checked={formData.theme === 'dark'}
                  onToggle={() => setFormData(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
                />
              </SubHeadingToggleContainer>
            </SubHeading>

            {/* Pro 라이센스 입력 */}
            <SubHeading id="pro-license">
              <span>Pro 라이센스 입력</span>
              <UnderlineButton>저장하기</UnderlineButton>
            </SubHeading>
            <Group>
              <TextField
                label="라이센스"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                placeholder="라이센스 키를 입력하세요"
              />
            </Group>
          </Card>
        </MainContent>
      </FlexContainer>
    </SettingsContainer>
  );
}