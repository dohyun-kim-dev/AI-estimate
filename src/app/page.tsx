import React, { useState, useEffect, useRef } from 'react'
import styled, { useTheme } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import BottomInput from '@/components/ai-esti/BottomInput'
import { useThemeStore } from '@/store/themeStore'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.body};


 @media (min-width: 1024px) {
    max-width: 70vw;
    margin: 0 auto;
  }
`

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
`

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 12px;
`

const SubHeader = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  line-height: 1.5;
`

const CustomInput = styled.div`
  padding: 0px;
  background-color: ${({ theme }) => theme.body};
  z-index: 1000;
  width: 100%;
  @media (min-width: 1024px) {
    padding: 16px;
    max-width: 100vw;
    // left: 50%;
    // transform: translateX(-50%);
  }
`
const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  padding: 4px;
  background-color: ${({ theme }) => theme.body};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  width: 100%;
  min-height: 145px;
  

  @media (min-width: 1024px) {
    max-width: 1024px;
    margin: 0 auto;
  }
`

const Input = styled.input`
  flex: 1;
  border: none;
  background: none;
  color: ${({ theme }) => theme.subtleText || '#000'};
  font-size: 16px;
  padding-left: 16px;
  align-self: flex-start;   /* 🔹 세로 상단 정렬 */
  padding-top: 12px; 
  caret-color: ${({ theme }) => theme.text || '#000'}; // 깜빡이는 커서 색
  &:focus {
    outline: none;
  }
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;

  align-self: flex-end; /* 세로 하단 정렬 */

  &:hover {
    opacity: 0.8;
  }
`


const FeatureSection = styled.div`
   margin-top: 40px;
`

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 24px;
  text-align: center;
`

const SectionSubtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.subtleText};
  text-align: center;
  line-height: 1.5;
  margin-bottom: 24px;
`

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.body === '#FFFFFF' 
    ? 'rgba(255, 255, 255, 0.30)'
    : 'linear-gradient(180deg, rgba(94, 94, 94, 0.30) -14.47%, rgba(8, 8, 15, 0.30) 100%)'};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
`

const FeatureIconWrapper = styled.div`
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const FeatureIcon = styled.img`
  width: 40px;
  height: 40px;
`

const FeatureContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FeatureSubtitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
`

const FeatureText = styled.p`
  color: ${({ theme }) => theme.subtleText};
  font-size: 14px;
  line-height: 1.5;
`

const TestimonialCard = styled.div`
  background-color: ${({ theme }) => theme.statBg};
  border: 1px solid ${({ theme }) => theme.testimonialBorder};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
`

const TestimonialImageWrapper = styled.div`
  width: 40px;
  display: flex;
  justify-content: center;
`

const TestimonialMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const TestimonialStars = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
`

const TestimonialContent = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 16px;
`

const TestimonialFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const StatsSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
`

const StatCard = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.statBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`

const StatValue = styled.div`
  color: ${({ theme }) => theme.cardText};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  color: ${({ theme }) => theme.subtleText};
  font-size: 12px;
`

const TestimonialSection = styled.div`
  margin-bottom: 32px;
`

const ConsultButton = styled.button`
position: fixed;           /* 화면 고정 */
bottom: 94px;              /* 화면 하단에서 24px 위 */
left: 50%;                 /* 화면 중앙 정렬 */
transform: translateX(-50%); /* 중앙 맞춤 */
width: 90%;                /* 원하는 너비 */
max-width: 400px;
border-radius: 12px;
border: 0 solid #E5E7EB;
background: linear-gradient(90deg, #6366F1 0%, #4F46E5 100%);
box-shadow: 0 0 15px 0 rgba(99, 102, 241, 0.50);
display: flex;
padding: 11px 85px;
justify-content: center;
align-items: center;
color: white;
font-size: 16px;
font-weight: 600;
cursor: pointer;
transition: opacity 0.2s ease-in-out;
z-index: 1000; /* 다른 요소 위에 표시 */

&:hover {
  opacity: 0.9;
}
`


const TestimonialAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`

const TestimonialInfo = styled.div`
  flex: 1;
`

const TestimonialName = styled.div`
  color: ${({ theme }) => theme.cardText};
  font-weight: bold;
  font-size: 14px;
`

const TestimonialRole = styled.div`
  color: ${({ theme }) => theme.subtleText};
  font-size: 12px;
`

const TestimonialText = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  line-height: 1.5;
`

const BottomNav = styled.nav`
  background-color: ${({ theme }) => theme.bottomNavBg};
  border-top: 1px solid ${({ theme }) => theme.bottomNavBorder};
  padding: 12px 24px;
  display: flex;
  justify-content: space-around;
`

const NavItem = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.subtleText};
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`

function TypingInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [displayText, setDisplayText] = useState('')
  const fullText = '저희 프로젝트 견적은 얼마일까요 ?'

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }

    let i = 0
    const typing = () => {
      setDisplayText('')
      i = 0
      const interval = setInterval(() => {
        setDisplayText(fullText.slice(0, i + 1))
        i++
        if (i >= fullText.length) {
          clearInterval(interval)
        }
      }, 100)
    }

    typing() // 첫 실행

    // 3초마다 반복
    const loop = setInterval(() => {
      typing()
    }, 5000)

    return () => clearInterval(loop)
  }, [])

  return <Input ref={inputRef} value={displayText} readOnly />
}

export default function Home() {
  const navigate = useNavigate()
  const { isDarkMode } = useThemeStore()

  
  return (
    <Container>
      <MainContent>
        <Header>
          <Logo>AIGO로 견적을 한 번에!</Logo>
          <SubHeader>
            견적, 새로고침 하다<br />
            견적AI서비스 AIGO로 3분만에 견적받기
          </SubHeader>
        </Header>

        <CustomInput>
          <InputWrapper>
            <TypingInput />
            <IconButton>
              <img 
                src={isDarkMode ? "/ai-estimate/enter_dark.png" : "/ai-estimate/enter.png"}
                alt="전송"
                width={36}
                height={36}
              />
            </IconButton>
          </InputWrapper>
        </CustomInput>

        <FeatureSection>
          <SectionTitle>AIGO만의 핵심 기능</SectionTitle>
          <FeatureCard>
            <FeatureIconWrapper>
              <FeatureIcon 
                src={isDarkMode ? '/pr/icon_pr_feature1_dark.png' : '/pr/icon_pr_feature1_light.png'} 
                alt="AI 컨설팅" 
              />
            </FeatureIconWrapper>
            <FeatureContent>
              <FeatureSubtitle>AI 컨설팅 기반 견적 자동 산출</FeatureSubtitle>
              <FeatureText>
              필요한 기능과 요구사항만 입력하면, <br />
              기다림 없이 바로 견적을 받아볼 수 있습니다
              </FeatureText>
            </FeatureContent>
          </FeatureCard>
          <FeatureCard>
            <FeatureIconWrapper>
              <FeatureIcon 
                src={isDarkMode ? '/pr/icon_pr_feature2_dark.png' : '/pr/icon_pr_feature2_light.png'} 
                alt="시간 단축" 
              />
            </FeatureIconWrapper>
            <FeatureContent>
              <FeatureSubtitle>획기적인 견적 시간 단축</FeatureSubtitle>
              <FeatureText>
              복잡한 계산이나 여러 차례의 문의 없이, <br />
              단 몇 분 만에 견적 예산을 확인할 수 있습니다
              </FeatureText>
            </FeatureContent>
          </FeatureCard>
          <FeatureCard>
            <FeatureIconWrapper>
              <FeatureIcon 
                src={isDarkMode ? '/pr/icon_pr_feature3_dark.png' : '/pr/icon_pr_feature3_light.png'} 
                alt="다국어 지원" 
              />
            </FeatureIconWrapper>
            <FeatureContent>
              <FeatureSubtitle>글로벌 다국어 언어 지원</FeatureSubtitle>
              <FeatureText>
              다국어 지원으로 해외 팀이나 파트너와도 <br/>
              동일한 견적을 손쉽게 공유할 수 있습니다
              </FeatureText>
            </FeatureContent>
          </FeatureCard>
        </FeatureSection>

        <StatsSection>
          <StatCard>
            <StatValue>90%↑</StatValue>
            <StatLabel>견적문의<br />시간절약</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>100%</StatValue>
            <StatLabel>AI 컨설팅<br /> 무료 지원</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>24H</StatValue>
            <StatLabel>쉬지않는<br /> 연중무휴</StatLabel>
          </StatCard>
        </StatsSection>

        <TestimonialSection>
          <SectionTitle>고객 후기</SectionTitle>
          <SectionSubtitle>
            다양한 기업들이 에이고 "견적 AI 서비스"로<br />
            견적 문의 시간을 획기적으로 단축 했습니다
          </SectionSubtitle>
          <TestimonialCard>
            <TestimonialImageWrapper>
              <img src="/pr/Anna.png" alt="Anna Lee" width={48} height={48} style={{ borderRadius: '50%' }} />
            </TestimonialImageWrapper>
            <TestimonialMainContent>
              <TestimonialStars>
                {[1,2,3,4,5].map((n) => (
                  <img key={n} src="/pr/star.png" alt="star" width={24} height={24} />
                ))}
              </TestimonialStars>
              <TestimonialContent>
                "Managing multilingual quotations was always a challenge, but AIGO made it seamless. It's helped us win more global projects"
              </TestimonialContent>
              <TestimonialFooter>
                <TestimonialInfo>
                  <TestimonialName>Anna Lee, Global PR Agency Director</TestimonialName>
                </TestimonialInfo>
              </TestimonialFooter>
            </TestimonialMainContent>
          </TestimonialCard>
          <TestimonialCard>
            <TestimonialImageWrapper>
              <img src="/pr/sujeong.png" alt="박수정" width={48} height={48} style={{ borderRadius: '50%' }} />
            </TestimonialImageWrapper>
            <TestimonialMainContent>
              <TestimonialStars>
                {[1,2,3,4,5].map((n) => (
                  <img key={n} src="/pr/star.png" alt="star" width={24} height={24} />
                ))}
              </TestimonialStars>
              <TestimonialContent>
                "이전에는 견적을 받으려면 일주일 이상이 걸렸는데, 에이고 덕분에 단 몇 분 만에 예산을 확인할 수 있었습니다. 프로젝트 계획이 훨씬 빨라졌어요."
              </TestimonialContent>
              <TestimonialFooter>
                <TestimonialInfo>
                  <TestimonialName>박수정, IT 프로젝트 매니저</TestimonialName>
                </TestimonialInfo>
              </TestimonialFooter>
            </TestimonialMainContent>
          </TestimonialCard>
          <TestimonialCard>
            <TestimonialImageWrapper>
              <img src="/pr/junho.png" alt="김준호" width={48} height={48} style={{ borderRadius: '50%' }} />
            </TestimonialImageWrapper>
            <TestimonialMainContent>
              <TestimonialStars>
                {[1,2,3,4,5].map((n) => (
                  <img key={n} src="/pr/star.png" alt="star" width={24} height={24} />
                ))}
              </TestimonialStars>
              <TestimonialContent>
                "부서별로 따로 견적을 요청하느라 늘 혼란스러웠는데, 에이고에서 한 번에 정리된 견적을 보니 의사결정이 빨라졌습니다. 실제로 30% 이상 시간을 절약했어요."
              </TestimonialContent>
              <TestimonialFooter>
                <TestimonialInfo>
                  <TestimonialName>김준호, 기자재 구매 팀장</TestimonialName>
                </TestimonialInfo>
              </TestimonialFooter>
            </TestimonialMainContent>
                    </TestimonialCard>
        </TestimonialSection>

        <ConsultButton onClick={() => navigate('/ai')}>
          AI 견적 상담하기
        </ConsultButton>
      </MainContent>

      </Container>
  )
}