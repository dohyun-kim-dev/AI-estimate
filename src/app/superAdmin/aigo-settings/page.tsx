import React, { useState } from 'react';
import styled from 'styled-components';
import TextField from '@/components/common/TextField';
import TextArea from '@/components/common/TextArea';
import CheckBox from '@/components/common/CheckBox';
import Switch from '@components/Switch';
import { AppColors } from '@styles/colors';
import { ThemeProvider } from "styled-components";
import { lightTheme } from "@styles/theme"; 
import { Button } from '@mui/material';

const Slider = styled.input.attrs({ type: 'range' })<{ value: number }>`
  width: 100%;
  height: 8px;
  background: linear-gradient(
    to right,
    #636994 0%,
    #636994 ${props => props.value}%,
    #ccc ${props => props.value}%,
    #ccc 100%
  );
  border-radius: 4px;
  -webkit-appearance: none;
  appearance: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #636994;
    border-radius: 50%;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #636994;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const SettingsContainer = styled.div`
  // margin: 0 auto;
  padding: 44px 24px 24px 24px;
  width: 100%;
  // max-width: 800px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 840px;
`;

const Heading = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
`;


const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #F7F7F7;
  padding: 24px;
  border-radius: 8px;
`;

const Card = styled.div`
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  max-width: 840px;
  // box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  // border: 1px solid #e5e5e5;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionNumber = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${AppColors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin-bottom: 16px;
  line-height: 1.4;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModeText = styled.div`
display: flex;
  font-size: 16px;
  color: #555;
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const SwitchFrom = styled.div`
  margin-left: 12px;
`;

const ExternalLink = styled.a`
  background-color: #2C2E3C;
  color: white;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
  display: inline-block;
  padding: 12px 16px;
  border-radius: 4px;
  float: right;
  
  &:hover {
    opacity: 0.9;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  width: 100%;
`;

const SliderValue = styled.span`
  color: inherit;
  font-weight: 500;
  min-width: 30px;
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  background-color: #686B7E;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
    padding-right: 36px; /* X 버튼 자리 확보 */

  white-space: nowrap;
  z-index: 1000;
  
  /* 말풍선 꼬리 */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-top-color: #686B7E;
  }
`;

export const CloseBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  opacity: 0.9;

  &:hover { opacity: 1; }
  &:active { transform: scale(0.96); }

  /* 버튼 클릭 영역이 겹쳐도 텍스트 선택 방지 */
  user-select: none;

  /* SVG 크기 제어 */
  svg { display: block; width: 10px; height: 10px; }
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

const SliderWrapper = styled.div`
  width: 100%;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;


const RadioGroup = styled.div`
  display: flex;
  gap: 24px;
  margin: 16px 0;
`;

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const RateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const RateLabel = styled.span`
  min-width: 80px;
  font-size: 14px;
`;

const RateInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const UnitLabel = styled.span`
  font-size: 14px;
  color: #666;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const SaveAllButton = styled.button`
  padding: 16px 20px;
  background-color: #2C2E3C;
  color: white;
  border: none;
  border-radius: 0px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
`;

// ✅ 토글 비활성화 문제 해결: pointer-events를 토글 영역에서 제외
const CollapsibleCard = styled(Card)<{ $isCollapsed: boolean }>`
  transition: all 0.3s ease;
  ${({ $isCollapsed }) => $isCollapsed && `
    opacity: 0.6;
  `}
`;

// ✅ 토글 버튼은 항상 활성화되도록 스타일 분리
const ToggleWrapper = styled.div`
  /* 토글은 항상 활성화 */
  pointer-events: auto;
`;

const CardContent = styled.div<{ $isDisabled: boolean }>`
  ${({ $isDisabled }) => $isDisabled && `
    pointer-events: none;
    opacity: 0.5;
  `}
`;

const CollapseContent = styled.div<{ $isVisible: boolean }>`
  transition: all 0.3s ease;
  max-height: ${({ $isVisible }) => $isVisible ? '1000px' : '0'};
  overflow: hidden;
  ${({ $isVisible }) => !$isVisible && `
    margin: 0;
    padding: 0;
  `}
`;

export default function AigoSettingsPage() {
  const [showTooltip, setShowTooltip] = useState(true);
  const [formData, setFormData] = useState({
    theme: 'light',
    maxGuestQueries: '',
    maxMemberQueries: '',
    maxMonthlyMemberQueries: '',
    maxStaffQueries: '',
    maxMonthlyStaffQueries: '',
    inferencePerformance: 50,
    licenseKey: '',
    projectRateEnabled: true,
    projectName1: '',
    projectRate1: '',
    projectName2: '',
    projectRate2: '',
    projectName3: '',
    projectRate3: '',
    rateIncrease: 'simple',
    basicRate: '',
    advancedRate: '',
    premiumRate: '',
    // 단위 기준 설정
    unitWeek: false,
    unitMonth: false,
    unitAmount: false,
    // 단위 설정
    unitFixed: false,
    unitDynamic: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleCheckBoxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, inferencePerformance: parseInt(e.target.value, 10) }));
  };

  const handleSaveAll = () => {
    console.log('전체 설정 저장:', formData);
    // 실제 저장 로직 구현
  };

  const handleCloseTooltip = () => {
    setShowTooltip(false);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <SettingsContainer>
        <Heading>AIGO 설정 관리</Heading>
        
        <CardsWrapper>
          <MainContent>
          {/* 1. 채팅 질의 횟수 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>
                채팅 질의 횟수 설정
              </CardTitle>
            </CardHeader>
            <Description>
              AI 답변은 질의 응답에 약 20원 내외 가치로 사용됩니다.<br/>
              비회원은 체험용으로 10회가 적당합니다.
            </Description>
            <Group>
              <TextField
                id="maxGuestQueries"
                label="[1일] 비회원 최대 질의 횟수"
                name="maxGuestQueries"
                value={formData.maxGuestQueries}
                onChange={handleChange}
              />
              <TextField
                id="maxMemberQueries"
                label="[1일] 로그인 회원 최대 질의 횟수"
                name="maxMemberQueries"
                value={formData.maxMemberQueries}
                onChange={handleChange}
              />
              <TextField
                id="maxMonthlyMemberQueries"
                label="[한달] 회원 최대 질의 횟수"
                name="maxMonthlyMemberQueries"
                value={formData.maxMonthlyMemberQueries}
                onChange={handleChange}
              />
              <TextField
                id="maxStaffQueries"
                label="[1일] 직원 최대 질의 횟수"
                name="maxStaffQueries"
                value={formData.maxStaffQueries}
                onChange={handleChange}
              />
              <TextField
                id="maxMonthlyStaffQueries"
                label="[한달] 직원 최대 질의 횟수"
                name="maxMonthlyStaffQueries"
                value={formData.maxMonthlyStaffQueries}
                onChange={handleChange}
              />
            </Group>
          </Card>

          {/* 2. AI 추론 성능 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>
                AI 추론 성능 설정
              </CardTitle>
            </CardHeader>
            <Description>
              AI 추론 성능을 높일수록 전문가스럽게 답변합니다.<br/>
              0으로 해놓아도 기본적인 AI 답변은 훌륭합니다.<br/>
              추론 성능이 높을수록 답변 속도가 느려지며, 질의 당 과금 비용이 높아집니다.
            </Description>
            <ButtonContainer>
              <TooltipWrapper>
                {showTooltip && (
                  <Tooltip>
                    AIGO는 <strong>Gemini 2.5 Flash</strong><br/>
                    모델을 사용합니다.
                    <CloseBtn onClick={handleCloseTooltip} aria-label="닫기">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M5.00052 5.93288L1.73385 9.19954C1.61163 9.32177 1.45608 9.38288 1.26719 9.38288C1.0783 9.38288 0.922743 9.32177 0.800521 9.19954C0.678298 9.07732 0.617188 8.92177 0.617188 8.73288C0.617188 8.54399 0.678298 8.38843 0.800521 8.26621L4.06719 4.99954L0.800521 1.73288C0.678298 1.61066 0.617188 1.4551 0.617188 1.26621C0.617188 1.07732 0.678298 0.921766 0.800521 0.799544C0.922743 0.677322 1.0783 0.616211 1.26719 0.616211C1.45608 0.616211 1.61163 0.677322 1.73385 0.799544L5.00052 4.06621L8.26719 0.799544C8.38941 0.677322 8.54497 0.616211 8.73385 0.616211C8.92274 0.616211 9.0783 0.677322 9.20052 0.799544C9.32274 0.921766 9.38385 1.07732 9.38385 1.26621C9.38385 1.4551 9.32274 1.61066 9.20052 1.73288L5.93385 4.99954L9.20052 8.26621C9.32274 8.38843 9.38385 8.54399 9.38385 8.73288C9.38385 8.92177 9.32274 9.07732 9.20052 9.19954C9.0783 9.32177 8.92274 9.38288 8.73385 9.38288C8.54497 9.38288 8.38941 9.32177 8.26719 9.19954L5.00052 5.93288Z" fill="white"/>
                      </svg>
                    </CloseBtn>
                  </Tooltip>
                )}
                <ExternalLink 
                  href="https://ai.google.dev/gemini-api/docs/pricing?hl=ko#standard_1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  가격표 보기
                </ExternalLink>
              </TooltipWrapper>
            </ButtonContainer>
            <SliderWrapper>
              <SliderContainer>
                <Slider
                  min="0"
                  max="100"
                  value={formData.inferencePerformance}
                  onChange={handleSliderChange}
                />
              </SliderContainer>
              <SliderLabels>
                <span>0</span>
                <span>100</span>
              </SliderLabels>
            </SliderWrapper>
          </Card>

          {/* 3. 사용자 컬러 테마 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>
                사용자 컬러 테마 설정
              </CardTitle>
            
            </CardHeader>
            <Description>
              컬러 테마는 Light 모드와 Dark 모드 중 하나를 위해하여 일괄 적용 수 있습니다.
            </Description>
            <ModeText>
            라이트모드
              <SwitchFrom><Switch
                checked={formData.theme === 'dark'}
                onToggle={() => setFormData(prev => ({ 
                  ...prev, 
                  theme: prev.theme === 'light' ? 'dark' : 'light' 
                }))}
              /></SwitchFrom>
              </ModeText>
          </Card>

          {/* 4. 구글 AI Key 입력 */}
          <Card>
            <CardHeader>
              <CardTitle>
                구글 AI Key 입력
              </CardTitle>
            </CardHeader>
            <Description>
              Google Cloud Vertex AI에서 발급받은 API Key를 입력해주세요.
            </Description>
            <Group>
              <TextArea
                id="licenseKey"
                label="AI Key"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                placeholder="AI Key를 입력해주세요"
                height="120px"
              />
            </Group>
          </Card>

          {/* 5. 프로젝트 요율 관리 */}
          <CollapsibleCard $isCollapsed={!formData.projectRateEnabled}>
            <CardHeader>
              <CardTitle>
                프로젝트 요율 관리
              </CardTitle>
              <ToggleWrapper>
                <Switch
                  checked={formData.projectRateEnabled}
                  onToggle={() => handleToggle('projectRateEnabled')}
                />
              </ToggleWrapper>
            </CardHeader>
            <CollapseContent $isVisible={formData.projectRateEnabled}>
              <CardContent $isDisabled={!formData.projectRateEnabled}>
                <Description>
                  프로젝트 진행 단위를 선택하고 최소·최대 단위를 입력해주세요. <br/>
                  설정된 단위는 프로젝트 요율 계산 시 기준 값으로 사용됩니다.
                </Description>
                
                <div style={{ marginBottom: '24px' }}>
                  <strong style={{ color:"#555555", fontSize: '14px' }}>단위 기준 설정</strong>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <CheckBox
                      id="unitWeek"
                      label="주"
                      checked={formData.unitWeek}
                      onChange={(checked) => handleCheckBoxChange('unitWeek', checked)}
                      color="#636994"
                    />
                    <CheckBox
                      id="unitMonth"
                      label="달"
                      checked={formData.unitMonth}
                      onChange={(checked) => handleCheckBoxChange('unitMonth', checked)}
                      color="#636994"
                    />
                    <CheckBox
                      id="unitAmount"
                      label="수량"
                      checked={formData.unitAmount}
                      onChange={(checked) => handleCheckBoxChange('unitAmount', checked)}
                      color="#636994"
                    />
                  </div>
                </div>

                <Group>
                  <div>
                    <strong style={{ color:"#555555",fontSize: '14px', fontWeight: '500' }}>프로젝트 단위</strong>
                    <div style={{ marginTop: '16px' }}>
                      <TextField
                        id="projectName1"
                        label="최소 단위"
                        name="projectName1"
                        value={formData.projectName1}
                        onChange={handleChange}
                        placeholder="최소 단위를 입력해주세요"
                      />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <TextField
                        id="projectName2"
                        label="최대 단위"
                        name="projectName2"
                        value={formData.projectName2}
                        onChange={handleChange}
                        placeholder="최대 단위를 입력해주세요"
                      />
                    </div>
                  </div>
                </Group>
              </CardContent>
            </CollapseContent>
          </CollapsibleCard>

          {/* 6. 요율(증가 규칙) 설정 */}
          {formData.projectRateEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>
                  요율(증가 규칙) 설정
                </CardTitle>
              </CardHeader>
              <Description>
                기간 중에 따라 요율을 변동하는 규칙을 설정합니다.
              </Description>
              
              <div style={{ marginBottom: '24px' }}>
                <strong style={{ color:"#555555",fontSize: '14px' }}>단위 설정</strong>
                <div style={{ marginTop: '16px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <CheckBox
                    id="unitFixed"
                    label="단위고정설정"
                    checked={formData.unitFixed}
                    onChange={(checked) => handleCheckBoxChange('unitFixed', checked)}
                    color="#636994"
                  />
                  <CheckBox
                    id="unitDynamic"
                    label="단위 동작 설정"
                    checked={formData.unitDynamic}
                    onChange={(checked) => handleCheckBoxChange('unitDynamic', checked)}
                    color="#636994"
                  />
                </div>
              </div>
              
              <div>
           

                {formData.rateIncrease === 'detailed' && (
                  <Group>
                    <TextField
                      id="basicRate"
                      label="베이직"
                      name="basicRate"
                      value={formData.basicRate}
                      onChange={handleChange}
                      placeholder="베이직 등급을 입력해주세요"
                    />
                    <TextField
                      id="advancedRate"
                      label="어드밴스"
                      name="advancedRate"
                      value={formData.advancedRate}
                      onChange={handleChange}
                      placeholder="어드밴스 등급을 입력해주세요"
                    />
                    <TextField
                      id="premiumRate"
                      label="프리미엄"
                      name="premiumRate"
                      value={formData.premiumRate}
                      onChange={handleChange}
                      placeholder="프리미엄 등급을 입력해주세요"
                    />
                  </Group>
                )}
              </div>
            </Card>
          )}

        <SaveButtonContainer>
          <SaveAllButton onClick={handleSaveAll}>
            전체 저장
          </SaveAllButton>
        </SaveButtonContainer>
      </MainContent>

        </CardsWrapper>

      </SettingsContainer>
    </ThemeProvider>
  );
}