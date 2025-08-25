import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
const Container = styled.div `
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.body};


 @media (min-width: 1024px) {
    max-width: 70vw;
    margin: 0 auto;
  }
`;
const MainContent = styled.div `
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;
const Header = styled.div `
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
`;
const Logo = styled.h1 `
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 12px;
`;
const SubHeader = styled.p `
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  line-height: 1.5;
`;
const CustomInput = styled.div `
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
`;
const InputWrapper = styled.div `
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
`;
const Input = styled.input `
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
`;
const IconButton = styled.button `
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
`;
const FeatureSection = styled.div `
   margin-top: 40px;
`;
const SectionTitle = styled.h2 `
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 24px;
  text-align: center;
`;
const SectionSubtitle = styled.p `
  font-size: 16px;
  color: ${({ theme }) => theme.subtleText};
  text-align: center;
  line-height: 1.5;
  margin-bottom: 24px;
`;
const FeatureCard = styled.div `
  background: ${({ theme }) => theme.body === '#FFFFFF'
    ? 'rgba(255, 255, 255, 0.30)'
    : 'linear-gradient(180deg, rgba(94, 94, 94, 0.30) -14.47%, rgba(8, 8, 15, 0.30) 100%)'};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
`;
const FeatureIconWrapper = styled.div `
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const FeatureIcon = styled.img `
  width: 40px;
  height: 40px;
`;
const FeatureContent = styled.div `
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const FeatureSubtitle = styled.h3 `
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
`;
const FeatureText = styled.p `
  color: ${({ theme }) => theme.subtleText};
  font-size: 14px;
  line-height: 1.5;
`;
const TestimonialCard = styled.div `
  background-color: ${({ theme }) => theme.statBg};
  border: 1px solid ${({ theme }) => theme.testimonialBorder};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
`;
const TestimonialImageWrapper = styled.div `
  width: 40px;
  display: flex;
  justify-content: center;
`;
const TestimonialMainContent = styled.div `
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const TestimonialStars = styled.div `
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
`;
const TestimonialContent = styled.p `
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 16px;
`;
const TestimonialFooter = styled.div `
  display: flex;
  align-items: center;
  gap: 12px;
`;
const StatsSection = styled.div `
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
`;
const StatCard = styled.div `
  flex: 1;
  background-color: ${({ theme }) => theme.statBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;
const StatValue = styled.div `
  color: ${({ theme }) => theme.cardText};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;
const StatLabel = styled.div `
  color: ${({ theme }) => theme.subtleText};
  font-size: 12px;
`;
const TestimonialSection = styled.div `
  margin-bottom: 32px;
`;
const ConsultButton = styled.button `
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
`;
const TestimonialAvatar = styled.img `
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;
const TestimonialInfo = styled.div `
  flex: 1;
`;
const TestimonialName = styled.div `
  color: ${({ theme }) => theme.cardText};
  font-weight: bold;
  font-size: 14px;
`;
const TestimonialRole = styled.div `
  color: ${({ theme }) => theme.subtleText};
  font-size: 12px;
`;
const TestimonialText = styled.p `
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  line-height: 1.5;
`;
const BottomNav = styled.nav `
  background-color: ${({ theme }) => theme.bottomNavBg};
  border-top: 1px solid ${({ theme }) => theme.bottomNavBorder};
  padding: 12px 24px;
  display: flex;
  justify-content: space-around;
`;
const NavItem = styled.button `
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
`;
function TypingInput() {
    const inputRef = useRef(null);
    const [displayText, setDisplayText] = useState('');
    const fullText = '저희 프로젝트 견적은 얼마일까요 ?';
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        let i = 0;
        const typing = () => {
            setDisplayText('');
            i = 0;
            const interval = setInterval(() => {
                setDisplayText(fullText.slice(0, i + 1));
                i++;
                if (i >= fullText.length) {
                    clearInterval(interval);
                }
            }, 100);
        };
        typing(); // 첫 실행
        // 3초마다 반복
        const loop = setInterval(() => {
            typing();
        }, 5000);
        return () => clearInterval(loop);
    }, []);
    return _jsx(Input, { ref: inputRef, value: displayText, readOnly: true });
}
export default function Home() {
    const navigate = useNavigate();
    const { isDarkMode } = useThemeStore();
    return (_jsx(Container, { children: _jsxs(MainContent, { children: [_jsxs(Header, { children: [_jsx(Logo, { children: "AIGO\uB85C \uACAC\uC801\uC744 \uD55C \uBC88\uC5D0!" }), _jsxs(SubHeader, { children: ["\uACAC\uC801, \uC0C8\uB85C\uACE0\uCE68 \uD558\uB2E4", _jsx("br", {}), "\uACAC\uC801AI\uC11C\uBE44\uC2A4 AIGO\uB85C 3\uBD84\uB9CC\uC5D0 \uACAC\uC801\uBC1B\uAE30"] })] }), _jsx(CustomInput, { children: _jsxs(InputWrapper, { children: [_jsx(TypingInput, {}), _jsx(IconButton, { children: _jsx("img", { src: isDarkMode ? "/ai-estimate/enter_dark.png" : "/ai-estimate/enter.png", alt: "\uC804\uC1A1", width: 36, height: 36 }) })] }) }), _jsxs(FeatureSection, { children: [_jsx(SectionTitle, { children: "AIGO\uB9CC\uC758 \uD575\uC2EC \uAE30\uB2A5" }), _jsxs(FeatureCard, { children: [_jsx(FeatureIconWrapper, { children: _jsx(FeatureIcon, { src: isDarkMode ? '/pr/icon_pr_feature1_dark.png' : '/pr/icon_pr_feature1_light.png', alt: "AI \uCEE8\uC124\uD305" }) }), _jsxs(FeatureContent, { children: [_jsx(FeatureSubtitle, { children: "AI \uCEE8\uC124\uD305 \uAE30\uBC18 \uACAC\uC801 \uC790\uB3D9 \uC0B0\uCD9C" }), _jsxs(FeatureText, { children: ["\uD544\uC694\uD55C \uAE30\uB2A5\uACFC \uC694\uAD6C\uC0AC\uD56D\uB9CC \uC785\uB825\uD558\uBA74, ", _jsx("br", {}), "\uAE30\uB2E4\uB9BC \uC5C6\uC774 \uBC14\uB85C \uACAC\uC801\uC744 \uBC1B\uC544\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4"] })] })] }), _jsxs(FeatureCard, { children: [_jsx(FeatureIconWrapper, { children: _jsx(FeatureIcon, { src: isDarkMode ? '/pr/icon_pr_feature2_dark.png' : '/pr/icon_pr_feature2_light.png', alt: "\uC2DC\uAC04 \uB2E8\uCD95" }) }), _jsxs(FeatureContent, { children: [_jsx(FeatureSubtitle, { children: "\uD68D\uAE30\uC801\uC778 \uACAC\uC801 \uC2DC\uAC04 \uB2E8\uCD95" }), _jsxs(FeatureText, { children: ["\uBCF5\uC7A1\uD55C \uACC4\uC0B0\uC774\uB098 \uC5EC\uB7EC \uCC28\uB840\uC758 \uBB38\uC758 \uC5C6\uC774, ", _jsx("br", {}), "\uB2E8 \uBA87 \uBD84 \uB9CC\uC5D0 \uACAC\uC801 \uC608\uC0B0\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4"] })] })] }), _jsxs(FeatureCard, { children: [_jsx(FeatureIconWrapper, { children: _jsx(FeatureIcon, { src: isDarkMode ? '/pr/icon_pr_feature3_dark.png' : '/pr/icon_pr_feature3_light.png', alt: "\uB2E4\uAD6D\uC5B4 \uC9C0\uC6D0" }) }), _jsxs(FeatureContent, { children: [_jsx(FeatureSubtitle, { children: "\uAE00\uB85C\uBC8C \uB2E4\uAD6D\uC5B4 \uC5B8\uC5B4 \uC9C0\uC6D0" }), _jsxs(FeatureText, { children: ["\uB2E4\uAD6D\uC5B4 \uC9C0\uC6D0\uC73C\uB85C \uD574\uC678 \uD300\uC774\uB098 \uD30C\uD2B8\uB108\uC640\uB3C4 ", _jsx("br", {}), "\uB3D9\uC77C\uD55C \uACAC\uC801\uC744 \uC190\uC27D\uAC8C \uACF5\uC720\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4"] })] })] })] }), _jsxs(StatsSection, { children: [_jsxs(StatCard, { children: [_jsx(StatValue, { children: "90%\u2191" }), _jsxs(StatLabel, { children: ["\uACAC\uC801\uBB38\uC758", _jsx("br", {}), "\uC2DC\uAC04\uC808\uC57D"] })] }), _jsxs(StatCard, { children: [_jsx(StatValue, { children: "100%" }), _jsxs(StatLabel, { children: ["AI \uCEE8\uC124\uD305", _jsx("br", {}), " \uBB34\uB8CC \uC9C0\uC6D0"] })] }), _jsxs(StatCard, { children: [_jsx(StatValue, { children: "24H" }), _jsxs(StatLabel, { children: ["\uC26C\uC9C0\uC54A\uB294", _jsx("br", {}), " \uC5F0\uC911\uBB34\uD734"] })] })] }), _jsxs(TestimonialSection, { children: [_jsx(SectionTitle, { children: "\uACE0\uAC1D \uD6C4\uAE30" }), _jsxs(SectionSubtitle, { children: ["\uB2E4\uC591\uD55C \uAE30\uC5C5\uB4E4\uC774 \uC5D0\uC774\uACE0 \"\uACAC\uC801 AI \uC11C\uBE44\uC2A4\"\uB85C", _jsx("br", {}), "\uACAC\uC801 \uBB38\uC758 \uC2DC\uAC04\uC744 \uD68D\uAE30\uC801\uC73C\uB85C \uB2E8\uCD95 \uD588\uC2B5\uB2C8\uB2E4"] }), _jsxs(TestimonialCard, { children: [_jsx(TestimonialImageWrapper, { children: _jsx("img", { src: "/pr/Anna.png", alt: "Anna Lee", width: 48, height: 48, style: { borderRadius: '50%' } }) }), _jsxs(TestimonialMainContent, { children: [_jsx(TestimonialStars, { children: [1, 2, 3, 4, 5].map((n) => (_jsx("img", { src: "/pr/star.png", alt: "star", width: 24, height: 24 }, n))) }), _jsx(TestimonialContent, { children: "\"Managing multilingual quotations was always a challenge, but AIGO made it seamless. It's helped us win more global projects\"" }), _jsx(TestimonialFooter, { children: _jsx(TestimonialInfo, { children: _jsx(TestimonialName, { children: "Anna Lee, Global PR Agency Director" }) }) })] })] }), _jsxs(TestimonialCard, { children: [_jsx(TestimonialImageWrapper, { children: _jsx("img", { src: "/pr/sujeong.png", alt: "\uBC15\uC218\uC815", width: 48, height: 48, style: { borderRadius: '50%' } }) }), _jsxs(TestimonialMainContent, { children: [_jsx(TestimonialStars, { children: [1, 2, 3, 4, 5].map((n) => (_jsx("img", { src: "/pr/star.png", alt: "star", width: 24, height: 24 }, n))) }), _jsx(TestimonialContent, { children: "\"\uC774\uC804\uC5D0\uB294 \uACAC\uC801\uC744 \uBC1B\uC73C\uB824\uBA74 \uC77C\uC8FC\uC77C \uC774\uC0C1\uC774 \uAC78\uB838\uB294\uB370, \uC5D0\uC774\uACE0 \uB355\uBD84\uC5D0 \uB2E8 \uBA87 \uBD84 \uB9CC\uC5D0 \uC608\uC0B0\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC5C8\uC2B5\uB2C8\uB2E4. \uD504\uB85C\uC81D\uD2B8 \uACC4\uD68D\uC774 \uD6E8\uC52C \uBE68\uB77C\uC84C\uC5B4\uC694.\"" }), _jsx(TestimonialFooter, { children: _jsx(TestimonialInfo, { children: _jsx(TestimonialName, { children: "\uBC15\uC218\uC815, IT \uD504\uB85C\uC81D\uD2B8 \uB9E4\uB2C8\uC800" }) }) })] })] }), _jsxs(TestimonialCard, { children: [_jsx(TestimonialImageWrapper, { children: _jsx("img", { src: "/pr/junho.png", alt: "\uAE40\uC900\uD638", width: 48, height: 48, style: { borderRadius: '50%' } }) }), _jsxs(TestimonialMainContent, { children: [_jsx(TestimonialStars, { children: [1, 2, 3, 4, 5].map((n) => (_jsx("img", { src: "/pr/star.png", alt: "star", width: 24, height: 24 }, n))) }), _jsx(TestimonialContent, { children: "\"\uBD80\uC11C\uBCC4\uB85C \uB530\uB85C \uACAC\uC801\uC744 \uC694\uCCAD\uD558\uB290\uB77C \uB298 \uD63C\uB780\uC2A4\uB7EC\uC6E0\uB294\uB370, \uC5D0\uC774\uACE0\uC5D0\uC11C \uD55C \uBC88\uC5D0 \uC815\uB9AC\uB41C \uACAC\uC801\uC744 \uBCF4\uB2C8 \uC758\uC0AC\uACB0\uC815\uC774 \uBE68\uB77C\uC84C\uC2B5\uB2C8\uB2E4. \uC2E4\uC81C\uB85C 30% \uC774\uC0C1 \uC2DC\uAC04\uC744 \uC808\uC57D\uD588\uC5B4\uC694.\"" }), _jsx(TestimonialFooter, { children: _jsx(TestimonialInfo, { children: _jsx(TestimonialName, { children: "\uAE40\uC900\uD638, \uAE30\uC790\uC7AC \uAD6C\uB9E4 \uD300\uC7A5" }) }) })] })] })] }), _jsx(ConsultButton, { onClick: () => navigate('/ai'), children: "AI \uACAC\uC801 \uC0C1\uB2F4\uD558\uAE30" })] }) }));
}
