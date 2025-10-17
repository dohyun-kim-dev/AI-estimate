
import useAI from '@/hooks/useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore, ImageData } from '@/store/chatStore';
import BottomInput from '@/components/ai-esti/BottomInput';
import AiResponseMessage from '@/components/ai-esti/AiResponseMessage';
import EstimateCard from '@/components/ai-esti/EstimateCard';
import EstimateAccordion from '@/components/ai-esti/EstimateAccordion';
import { calculateEstimatedPeriod } from '@/utils/estimateCalculator';
import DetailModal from '@/components/ai-esti/DetailModal';
import EstimateActionButtons from '@/components/ai-esti/EstimateActionButtons';
import ImageGrid from '@/components/ai-esti/ImageGrid';
import PeriodSlider from '@/components/ai-esti/PeriodSlider';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import type { EstimateItem } from '@/app/ai-estimate/types';
import { uploadFiles, FileUploadData } from '@/firebase.functions';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import FileUploadSection from '@/components/ai-esti/FileUploadSection';
import { devLog } from '../../utils/devLogger';
import { useChatActions } from '@/hooks/useChatActions';
import { getAllUnitPrices, requestEstimateConsult, getAiPrompts, getChatSessions, transferChatSessionToUser, getChatSessionMessages, ChatMessage } from '@/lib/api/user/userApi';
import { getEstimateIdFromContent } from '@/hooks/estimate';
import { v4 as uuidv4 } from 'uuid';
import { usePromptStore } from '@/store/promptStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { transformMessageForDisplay } from '@/utils/messageTransform';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useUsageStore } from '@/store/usageStore';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';
import { useCompanyStore } from '@/store/companyStore';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
// --- Gradient Text Animation ---
const gradientText = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 기존 그라데이션 텍스트는 보류
// const GradientText = styled.span`
//   font-size: 16px;
//   font-weight: 500;
//   background: linear-gradient(90deg, #D1D1F3,#ADADCF , #8383A6, #6A6ABB, #5E5E7E);
//   background-size: 300% 300%;
//   background-clip: text;
//   -webkit-background-clip: text;
//   color: transparent;
//   -webkit-text-fill-color: transparent;
//   animation: ${gradientText} 1.6s linear infinite;
// `;

// 5가지 단일색이 시간차로 변하는 애니메이션
const colorCycle = keyframes`
  0% { color: #D1D1F3; }
  20% { color: #ADADCF; }
  40% { color: #8383A6; }
  60% { color: #6A6ABB; }
  80% { color: #5E5E7E; }
  100% { color: #D1D1F3; }
`;

const GradientText = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #D1D1F3;
  animation: ${colorCycle} 5s linear infinite;
`;

// --- Spinner Animation ---
const rotate = keyframes`
  100% { transform: rotate(360deg); }
`;
const dash = keyframes`
  0% { stroke-dasharray: 30, 140; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 140; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 30, 140; stroke-dashoffset: -150; }
`;

const SpinnerWrapper = styled.div`
  position: relative;
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
`;
const SpinnerSvg = styled.svg`
  position: absolute; top: 0; left: 0;
  width: 56px; height: 56px;
  transform: rotate(-90deg);
  animation: ${rotate} 3s linear infinite;
`;
const SpinnerCircle = styled.circle`
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke: url(#spinner-gradient);
  animation: ${dash} 3s ease-in-out infinite;
`;
const ProfileImg = styled.img`
  width: 44px; height: 44px; border-radius: 50%;
  z-index: 1;
`;

function ProfileSpinner({ src }: { src: string }) {
  return (
    <SpinnerWrapper>
      <SpinnerSvg viewBox="0 0 56 56">
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6014FF" />
            <stop offset="50%" stopColor="#5C73D9" />
            <stop offset="100%" stopColor="#8D55A5" />
          </linearGradient>
        </defs>
        <SpinnerCircle cx="28" cy="28" r="24" />
      </SpinnerSvg>
      <ProfileImg src={src} alt="profile" />
    </SpinnerWrapper>
  );
}

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0px 16px 16px 16px;
  padding-bottom: calc(0px + env(safe-area-inset-bottom));
  position: relative;
  // height: 100dvh;
  // max-height: 80dvh;

  @media (max-width: 400px) {
  padding: 0px;
  padding-bottom: calc(0px + env(safe-area-inset-bottom));

  }
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 8px;
  padding: 12px;
  min-height: 320px;
`;

const UserMessageContainer = styled.div<{ hasImages?: boolean }>`
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 80%;
  gap: 8px;
`;

const UserMessage = styled.div`
  align-self: flex-end;
  background: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 100%;
  white-space: pre-line;
  word-break: break-word;
  font-size: 18px;
  line-height: 2.0;
`;


const FileUploadArea = styled.div<{ $isDragOver: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${({ $isDragOver }) => ($isDragOver ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed ${({ theme }) => theme.accent};
  background: ${({ theme }) => `${theme.accent}10`};
  z-index: 1000;
  pointer-events: auto;
  border-radius: 8px;
  backdrop-filter: blur(1px);
`;

const FileUploadText = styled.div`
  color: ${({ theme }) => theme.subtleText};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;;
`;

const FileUploadSubtext = styled.div`
  color: ${({ theme }) => theme.subtleText};
  font-size: 18px;
  opacity: 0.8;
`;

const FilePreviewArea = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: 80%;
  height: 8px;
  background: ${({ theme }) => theme.border};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: ${({ theme }) => theme.accent};
    transition: width 0.3s ease;
  }
`;

const StyledAiMessage = styled(AiResponseMessage)<{ isFullWidth?: boolean }>`
  padding: 0;
  max-width: 100%;
  // align-self: flex-start;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  height: 36px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 0 8px;
`;

const Button = styled.button`
  height: 44px;
  padding: 0 16px;
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.body};
  border-radius: 8px;
  font-weight: 600;
`;

const EstimateContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
`;

const MainContent = styled.div<{ $isWideLayout?: boolean }>`
  flex: 1;
  min-width: 320px;
  width: 100%;
  padding-bottom: 20px;

  @media (min-width: 1024px) {
    width: ${({ $isWideLayout }) => $isWideLayout ? '860px' : '560px'};
  }
`;

const SideContent = styled.div`
  width: 100%;

  @media (min-width: 1024px) {
    width: 320px;
    position: sticky;
    top: 120px;
  }
`;

const DetailsToggle = styled.div<{ $isShare?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 160%;
  letter-spacing: 0.28px;
  color: ${({ theme }) => theme.subtleText};
  cursor: pointer;
  margin: ${({ $isShare }) => $isShare ? '0' : '-20px 0 -20px'};

  @media (min-width: 1024px) {
    display: none;
  }
`;

const DetailsToggleIcon = styled.div`
  margin-top: 4px;
  margin-left: 10px;
`;

const AnimatedContainer = styled.div<{ $isvisible: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isvisible }) => ($isvisible ? '1fr' : '0fr')};
  transition: grid-template-rows 0.5s ease-in-out;
  overflow: hidden;

  > * {
    min-height: 0;
  }

  @media (min-width: 1024px) {
    grid-template-rows: 1fr;
  }
`;

const StyledDiv = styled.div`
  font-size: 18px;
  line-height: 2.0;
  color: ${({ theme }) => (theme.body === '#FFFFFF' ? '#333333' : '#dddddd')};
`;

// 스크롤 다운 버튼 스타일
const ScrollDownButton = styled.button<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 120px;
  right: 20px;
  display: flex;
  padding: 6px;
  align-items: center;
  gap: 10px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: ${({ $isVisible }) => ($isVisible ? 'translateY(0)' : 'translateY(20px)')};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
  
  /* 다크모드 스타일 */
  background: ${({ theme }) => (theme.body === '#FFFFFF' ? '#FFF' : '#343435')};
  box-shadow: ${({ theme }) => 
    theme.body === '#FFFFFF' 
      ? '-2px -2px 10px 0 rgba(144, 144, 144, 0.25), 2px 2px 10px 0 rgba(144, 144, 144, 0.25)'
      : '-2px -2px 10px 0 rgba(60, 60, 60, 0.25), 2px 2px 10px 0 rgba(60, 60, 60, 0.25)'
  };
`;

const ScrollDownIcon = styled.div<{ $isDark: boolean }>`
  width: 24px;
  height: 24px;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg path {
    fill: ${({ $isDark }) => $isDark ? '#E4E4E4' : '#6C6C6C'};
  }
`;

type ModelName = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.0-flash';


function ensureClientUuid(estimate: any) {
  if (!estimate.uuid) {
    estimate.uuid = uuidv4(); // 클라에서 미리 박음
  }
  return estimate;
}

const extractEstimateData = (content: string): ProjectEstimate | null => {
  try {
    if(typeof content !== 'string') { console.log('string이 아닌 content', typeof content,content);}
    
    // 1. 먼저 <script> 태그에서 JSON 찾기 (기존 로직)
    const scriptMatch = content.match(/<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const data = JSON.parse(scriptMatch[1]);
      if (data && typeof data === 'object' && Array.isArray(data.categories)) {
        return data as ProjectEstimate;
      }
    }
    
    // 2. <script> 태그가 없으면 마크다운 코드블록에서 JSON 찾기
    const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const data = JSON.parse(codeBlockMatch[1]);
      if (data && typeof data === 'object' && Array.isArray(data.categories)) {
        return data as ProjectEstimate;
      }
    }
    
    // 3. 위 두 방법이 안되면 JSON 형태인지 먼저 확인 후 파싱 시도
    const trimmedContent = content.trim();
    
    // JSON 형태일 가능성이 높은 패턴만 체크 (객체나 배열로 시작/끝)
    if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
        (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
      
      try {
        const data = JSON.parse(trimmedContent);
        if (data && typeof data === 'object' && Array.isArray(data.categories)) {
          return data as ProjectEstimate;
        }
      } catch (jsonErr) {
        // JSON 파싱 실패는 정상적인 경우 (일반 텍스트)이므로 에러 로그 없이 넘어감
        devLog("Raw JSON parsing failed - likely normal text content");
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse estimate data:', error);
    return null;
  }
};

const parseMessageContent = (content: string, images?: ImageData[]) => {
  // devLog('🔍 parseMessageContent 호출:', { content, images });

  // content가 undefined나 null인 경우 처리
  if (!content || typeof content !== 'string') {
    const result = {
      text: '',
      images: images || [],
      hasImages: (images && images.length > 0) || false
    };
    // devLog('🔍 parseMessageContent 결과 (빈 content):', result);
    return result;
  }
  
  // AI 프롬프트와 명령어 제거 및 액션별 메시지 변환
  const stripAiPrompt = (text: string) => {
    // 액션 버튼 메시지 변환을 먼저 수행
    const transformedText = transformMessageForDisplay(text);
    
    // [현재 견적 정보] ~ 위 견적을 기반으로 ... 패턴만 제거 (기존 로직)
    let cleanedText = transformedText.replace(/\[현재 견적 정보][\s\S]*?위 견적을 기반으로 [^\n]*를 진행해주세요\./g, '').trim();
    
    return cleanedText;
  };
  
  // 첨부파일 패턴을 찾아서 제거하되, 이미지는 images 배열로 처리
  const fileMatches = content.match(/\[첨부파일: (.+?)\]/g);
  let textContent = content;
  const extractedImages: ImageData[] = [];
  
  if (fileMatches) {
    fileMatches.forEach(match => {
      const fileName = match.match(/\[첨부파일: (.+?)\]/)?.[1];
      if (fileName) {
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
        if (isImage) {
          // 환경에 따른 이미지 URL 생성
          const getImageUrl = (fileName: string) => {
            // 이미 full URL인 경우 (http로 시작)
            if (fileName.startsWith('http')) {
              return fileName;
            }
            
            // 개발 환경에서는 프록시 설정에 의해 /api/file/로 접근
            if (process.env.NODE_ENV === 'development') {
              return `/api/file/${fileName}`;
            }
            
            // 프로덕션 환경에서는 file 경로로 직접 접근
            const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
            return `${apiHost}/file/${fileName}`;
          };
          
          const imageUrl = getImageUrl(fileName);
          
          extractedImages.push({
            url: imageUrl,
            fileName: fileName,
            mimeType: `image/${fileName.split('.').pop()?.toLowerCase() || 'png'}`
          });
        }
      }
      // 텍스트에서 첨부파일 태그 제거
      textContent = textContent.replace(match, '').trim();
    });
  }
  
  // images prop과 추출된 이미지를 합치기
  const allImages = [...(images || []), ...extractedImages];
  
  const result = {
    text: stripAiPrompt(textContent),
    images: allImages,
    hasImages: allImages.length > 0
  };
  // console.log('🔍 parseMessageContent 결과 (일반):', result);
  return result;
};

// URL 체크 함수
const checkWideLayout = () => {
  if (typeof window !== 'undefined') {
    const url = `${window.location.pathname}${window.location.search}${window.location.hash}`.toLowerCase();
    return url.includes('share') || url.includes('superadmin') || url.includes('cms');
  }
  return false;
};

export const AiMessageContent: React.FC<{ 
  content: string; 
  chatSessionId?: string; 
  estimateDataForConsult?: ProjectEstimate;
  onSubmit?: (value: string, options?: { displayMessage?: string; abortSignal?: AbortSignal }) => Promise<void>;
}> = ({ content, chatSessionId, estimateDataForConsult, onSubmit }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);
  const [loadingStep, setLoadingStep] = useState(0); // 0: 생각 중, 1: 깊게 생각 중, 2: 더 좋은 답변 고민 중
  const [isEstimateGenerating, setIsEstimateGenerating] = useState(false); // 견적서 생성 중 상태
  const [estimateData, setEstimateData] = useState<ProjectEstimate | null>(() => extractEstimateData(content));
  const estimateId = estimateData?.uuid;
  const effectiveChatSessionId = chatSessionId || localStorage.getItem('chatSessionId') || '';
  const updateLastMessage = useChatStore((s) => s.updateLastMessage); // ⭐️ 추가: updateLastMessage 가져오기
  const messages = useChatStore((s) => s.messages); // ⭐️ 추가: messages 배열 가져오기
  
  // URL에 superadmin이 포함되면 항상 다크모드, 그렇지 않으면 테마 스토어 값 사용
  const location1 = useLocation();
  const pathname = location1.pathname;
  const { isDarkMode: themeIsDarkMode } = useThemeStore();
  const isDarkMode = pathname?.includes('superadmin') ? true : themeIsDarkMode;

  // content 변경 시 estimateData 업데이트
  useEffect(() => {
    const newEstimateData = extractEstimateData(content);
    setEstimateData(newEstimateData);
  }, [content]);


//   window.addEventListener('message', (event) => {
//   if (event.data?.type === 'aiw:userInfo') {
//     if (event.data.token) localStorage.setItem('token', event.data.token);
//     if (event.data.userInfo) localStorage.setItem('userInfo', JSON.stringify(event.data.userInfo));
//     console.log('Received user info from parent:', event.data.userInfo);
//   }
// });

  const getUserId = () => {
    // 1) 회원 여부 확인 (auth-storage 최우선)
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const userId = authData.state?.user?._id || authData.state?.user?.id;
        if (userId) return userId;
      } catch {
        /* ignore */
      }
    }
  
    // 2) 비회원일 경우 guest-uuid 확인
    let guest = localStorage.getItem('guest-uuid');
    if (!guest) {
      guest = uuidv4();
      localStorage.setItem('guest-uuid', guest);
    }
    return guest;
  };


const userId = getUserId() || '';


  const { total_amount: basePrice, total_period: basePeriod, calculatedPeriod, updatedEstimateData } = useMemo(() => {
  if (!estimateData || !Array.isArray(estimateData.categories)) {
    return { total_amount: 0, total_period: 0, calculatedPeriod: null, updatedEstimateData: null };
  }

  // 새로운 계산 로직 사용 (화면설계/UI디자인 가격 자동 업데이트 포함)
  let calculationResult;
  try {
    calculationResult = calculateEstimatedPeriod(estimateData);
  } catch (error) {
    console.error('견적 기간 계산 실패, 기본값 사용:', error);
    calculationResult = {
      totalPages: 10,
      planningDesignWeeks: 4,
      totalFeDays: 10,
      totalBeDays: 10,
      pureDevelopmentDays: 10,
      developmentWeeks: 2,
      finalWeeks: 8,
      estimatedPeriodText: '8주 (약 2개월)',
      updatedEstimate: estimateData
    };
  }
  
  // 디버깅용 로그
  devLog('🔍 계산 결과:', {
    totalPages: calculationResult.totalPages,
    planningDesignWeeks: calculationResult.planningDesignWeeks,
    totalFeDays: calculationResult.totalFeDays,
    totalBeDays: calculationResult.totalBeDays,
    pureDevelopmentDays: calculationResult.pureDevelopmentDays,
    developmentWeeks: calculationResult.developmentWeeks,
    finalWeeks: calculationResult.finalWeeks,
    estimatedPeriodText: calculationResult.estimatedPeriodText
  });

  // 업데이트된 견적 데이터 사용 (화면설계/UI디자인 가격이 자동 계산됨)
  const total_amount = calculationResult.updatedEstimate.categories.reduce((sum, category) => {
    if (!category.sub_categories || !Array.isArray(category.sub_categories)) {
      return sum;
    }
    
    const categoryTotal = category.sub_categories.reduce((subSum, subCategory) => {
      if (!subCategory.items || !Array.isArray(subCategory.items)) {
        return subSum;
      }
      
      const subTotal = subCategory.items.reduce((itemSum, item) => {
        // ⭐️ 수정: is_deleted가 true인 항목은 합산에서 제외
        if (item.is_deleted) return itemSum;

        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
        return itemSum + (isNaN(itemPrice) ? 0 : itemPrice);
      }, 0);
      return subSum + subTotal;
    }, 0);
    return sum + categoryTotal;
  }, 0);
    
    const total_period = estimateData.categories.reduce((sum, category) => {
      if (!category.sub_categories || !Array.isArray(category.sub_categories)) {
        return sum;
      }
      
      const categoryPeriod = category.sub_categories.reduce((subSum, subCategory) => {
        if (!subCategory.items || !Array.isArray(subCategory.items)) {
          return subSum;
        }
        
        const subPeriod = subCategory.items.reduce((itemSum, item) => {
          // 삭제된 항목은 기간 합산에서 제외
          if (item.is_deleted) return itemSum;
          // 예전 데이터에서는 fe, be 필드가 없을 수 있으므로 안전하게 처리
          const feMatch = item.fe?.match?.(/(\d+)/);
          const beMatch = item.be?.match?.(/(\d+)/);
          const frontPeriod = feMatch ? parseFloat(feMatch[1]) : 0;
          const backPeriod = beMatch ? parseFloat(beMatch[1]) : 0;
          return itemSum + (isNaN(frontPeriod) ? 0 : frontPeriod) + (isNaN(backPeriod) ? 0 : backPeriod);
        }, 0);
        return subSum + subPeriod;
      }, 0);
      return sum + categoryPeriod;
    }, 0);

    return { total_amount, total_period, calculatedPeriod: calculationResult, updatedEstimateData: calculationResult.updatedEstimate };
  }, [estimateData]);

  // 계산된 기간이 있으면 사용, 없으면 기존 basePeriod 사용
  const effectiveBasePeriod = calculatedPeriod?.finalWeeks || basePeriod;
  const [projectPeriod, setProjectPeriod] = useState(effectiveBasePeriod);
  const [discountedPrice, setDiscountedPrice] = useState(basePrice);

  // 로딩 텍스트 가져오기 함수
  const getLoadingText = () => {
    switch (loadingStep) {
      case 0:
        return '생각 중...';
      case 1:
        return '깊게 생각 중...';
      case 2:
        return '더 좋은 답변 고민 중...';
      default:
        return '생각 중...';
    }
  };

  useEffect(() => {
    // 계산된 기간이 있으면 사용, 없으면 basePeriod 사용
    const newBasePeriod = calculatedPeriod?.finalWeeks || basePeriod;
    if (newBasePeriod > 0) {
      setProjectPeriod(newBasePeriod);
    }
    setDiscountedPrice(basePrice);
  }, [basePeriod, basePrice, calculatedPeriod]);

  useEffect(() => {
    // 💡 `estimateData`가 null이거나 undefined일 경우 바로 종료
    if (!estimateData) {
      return;
    }

    // 할인 제외 항목 배열
    const NON_DISCOUNT_ITEMS = [
      '화면설계', '화면디자인', '화면퍼블리싱', '퍼블리싱', 'UI/UX디자인',
      '화면 설계', '화면 퍼블리싱', 'UI/UX 디자인', '스토리보드', '스토리 보드'
    ];

    // `flatMap`을 사용하여 모든 `items`를 단일 배열로 만들고 필터링합니다.
    const nonDiscountableItems = estimateData.categories
      .flatMap(category => category.sub_categories)
      .flatMap(subCategory => subCategory.items)
      .filter(item => NON_DISCOUNT_ITEMS.some(excludeItem => 
        item.name.includes(excludeItem) || excludeItem.includes(item.name)
      ));

    const nonDiscountableSum = nonDiscountableItems.reduce((sum, item) => {
      // 삭제된 항목은 비할인 대상 합산에서도 제외
      if (item.is_deleted) return sum;
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
      return sum + (price || 0);
    }, 0) || 0;

    const discountableBase = basePrice - nonDiscountableSum;

    let discountPercentage = 0;
    // 계산된 기간이 있으면 사용, 없으면 basePeriod 사용
    const effectiveBasePeriod = calculatedPeriod?.finalWeeks || basePeriod;
    const maxPeriod = effectiveBasePeriod + 8;
    const periodDiff = projectPeriod - effectiveBasePeriod;
    const maxPeriodDiff = maxPeriod - effectiveBasePeriod;

    if (periodDiff > 0 && maxPeriodDiff > 0) {
      // 슬라이더 위치에 비례하여 0%부터 최대 10%까지 할인율 적용
      discountPercentage = (periodDiff / maxPeriodDiff) * 0.1;
    }

    const newDiscountedPrice = discountableBase * (1 - discountPercentage) + nonDiscountableSum;
    setDiscountedPrice(newDiscountedPrice);
  }, [projectPeriod, basePeriod, basePrice, estimateData]); // 💡 `estimateData`를 디펜던시 배열에 추가


  const handleItemClick = (item: { name: string; price: string; description: string }) => {
    // EstimateItem 타입으로 변환
    const estimateItem: EstimateItem = {
      id: item.name, // 임시로 name을 id로 사용
      name: item.name,
      price: item.price,
      category: '', // 빈 문자열로 설정
      task: item.name,
      description: item.description,
      people: 1, // 기본값
      days: 1, // 기본값
      cost: typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : parseFloat(item.price),
      fe: '0일', // 기본값
      be: '0일', // 기본값
      page_count: 0, // 기본값
      is_deleted: false
    };
    setSelectedItem(estimateItem);
  };

  // const handleSubmit = () => {
  //   console.log('견적서 제출');
  //   // TODO: 견적서 제출 로직 구현
  // };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // 견적 데이터 변경 핸들러
  const handleEstimateChange = useCallback((updatedEstimate: ProjectEstimate) => {
    devLog('견적 데이터 변경됨:', updatedEstimate);
    setEstimateData(updatedEstimate);
  }, []);

  // 메시지 내용을 견적서와 일반 텍스트로 분리
  if (typeof content !== 'string') {
    return null;
  }
  
  // JSON 데이터와 텍스트 분리 (다양한 형태 지원)
  let textContent = content;
  let hasIncompleteJson = false;
  
  // JSON 시작 직전의 불필요한 텍스트를 제거하는 함수
  const cleanUnnecessaryText = (text: string): string => {
    const unnecessaryPatterns = [
      /\b[a-zA-Z0-9_]*uuid[a-zA-Z0-9_]*\b/gi,
      /\b[a-zA-Z0-9_]*estimate[a-zA-Z0-9_]*\b/gi,
      /\b[a-zA-Z0-9_]*recommended[a-zA-Z0-9_]*\b/gi,
      /\b[a-zA-Z0-9_]*features?[a-zA-Z0-9_]*\b/gi,
      /\b[a-zA-Z0-9_]*data[a-zA-Z0-9_]*\b/gi,
      /\bnew_[a-zA-Z0-9_]+\b/gi,
      /\b[a-zA-Z0-9_]+_for_[a-zA-Z0-9_]+\b/gi,
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    ];
    
    let cleaned = text;
    unnecessaryPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '').trim();
    });
    
    return cleaned
  };
  
  // 1. <script> 태그 형태 처리
  const scriptMatch = content.match(/<script[^>]*id="invoiceData"[^>]*>[\s\S]*?<\/script>/);
  if (scriptMatch) {
    textContent = cleanUnnecessaryText(content.replace(scriptMatch[0], '')).replace(/\\n/g, '<br/>').trim();
  } else {
    // 2. 마크다운 코드블록 형태 처리
    const codeBlockMatch = content.match(/```json\s*\n[\s\S]*?\n```/);
    if (codeBlockMatch) {
      textContent = cleanUnnecessaryText(content.replace(codeBlockMatch[0], '')).replace(/\\n/g, '<br/>').trim();
    } else {
      // 3. 불완전한 <script> 태그 확인
      const jsonStartPattern = /<script[^>]*id="invoiceData"[^>]*>/;
      if (jsonStartPattern.test(content) && !content.includes('</script>')) {
        hasIncompleteJson = true;
        // 불완전한 JSON 부분을 제거하고 텍스트만 추출
        textContent = cleanUnnecessaryText(content.replace(/<script[^>]*id="invoiceData"[^>]*>[\s\S]*$/, '')).replace(/\\n/g, '<br/>').trim();
      } else {
        // 4. 순수 JSON 형태인지 확인 (전체 content가 JSON인 경우)
        try {
          const trimmed = content.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.categories)) {
              // 전체가 견적서 JSON이면 텍스트는 빈 문자열
              textContent = '';
            } else {
              // 견적서 JSON이 아니면 원본을 정리해서 표시
              textContent = cleanUnnecessaryText(content).replace(/\\n/g, '<br/>').trim();
            }
          } else {
            textContent = cleanUnnecessaryText(content).replace(/\\n/g, '<br/>').trim();
          }
        } catch {
          // JSON 파싱 실패하면 일반 텍스트로 처리 (불필요한 텍스트 제거 후)
          textContent = cleanUnnecessaryText(content).replace(/\\n/g, '<br/>').trim();
        }
      }
    }
  }
  
  const hasEstimate = estimateData && estimateData.categories;

  // 불완전한 JSON이 있을 때 로딩 단계 타이머 설정
  useEffect(() => {
    if (hasIncompleteJson) {
      // 견적서 생성 중 상태 설정
      setIsEstimateGenerating(true);
      
      const timer1 = setTimeout(() => setLoadingStep(1), 10000); // 10초 후
      const timer2 = setTimeout(() => setLoadingStep(2), 20000); // 20초 후
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setLoadingStep(0); // 완료되면 초기화
      setIsEstimateGenerating(false); // 견적서 생성 완료
    }
  }, [hasIncompleteJson]);
  
  return (
    <div>
      {/* 일반 텍스트 메시지 표시 */}
      {textContent && (
        <StyledDiv 
          style={{ 
            marginBottom: hasEstimate || hasIncompleteJson ? '24px' : '0',
            fontSize: '18px',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ __html: textContent }} 
        />
      )}

      {/* 불완전한 JSON이 있는 경우 로딩 텍스트 표시 */}
      {hasIncompleteJson && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '16px' }}>
          <ProfileSpinner src="/ai-estimate/pretty.png" />
          <GradientText>
            {isEstimateGenerating ? '견적서 만드는 중...' : getLoadingText()}
          </GradientText>
        </div>
      )}

      {/* 견적서가 있는 경우 표시 */}
      {hasEstimate && (
        <EstimateContainer>
          <TopSection>
            <MainContent $isWideLayout={checkWideLayout()}>
              <EstimateCard 
                estimate={updatedEstimateData || estimateData} 
                discountedPrice={discountedPrice || 0} 
                projectPeriod={projectPeriod || 0}
                calculatedPeriod={calculatedPeriod}
              />
              <DetailsToggle
                onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                $isShare={typeof window !== 'undefined' && window.location.pathname.includes('share')}
              >
                상세견적 보기 {isDetailsVisible ?
                  <DetailsToggleIcon><IoChevronUp size={24} /></DetailsToggleIcon> :
                  <DetailsToggleIcon><IoChevronDown size={24} /></DetailsToggleIcon>
                }
              </DetailsToggle>
              <PeriodSlider 
                value={Math.max(0, (projectPeriod || 0) - (effectiveBasePeriod || 0))}  // 0~8
                onChange={(sliderValue) => setProjectPeriod((effectiveBasePeriod || 0) + sliderValue)}
                $isvisible={isDetailsVisible}
                min={0}     
                max={8}     
                discountedPrice={discountedPrice || 0} // ⭐️ 수정: 기본값 0 추가
                basePrice={basePrice || 0}    // ⭐️ 수정: 기본값 0 추가
              />            
 {/* 할인율 계산: discountableBase, discountPercentage */}
              {(() => {
                // 할인 제외 항목
                  const NON_DISCOUNT_ITEMS = [
                  '화면설계', '화면디자인', '화면퍼블리싱', '퍼블리싱', 'UI/UX디자인',
                  '화면 설계', '화면 퍼블리싱', 'UI/UX 디자인', '스토리보드', '스토리 보드'
                ];

                let nonDiscountableSum = 0;
                let discountableBase = basePrice;
                if (estimateData && Array.isArray(estimateData.categories)) {
                  const allItems = estimateData.categories
                    .flatMap(category => category.sub_categories)
                    .flatMap(subCategory => subCategory.items);
                  nonDiscountableSum = allItems
                    .filter(item => NON_DISCOUNT_ITEMS.some(excludeItem => 
                      item.name.includes(excludeItem) || excludeItem.includes(item.name)
                    ) && !item.is_deleted)
                    .reduce((sum, item) => {
                      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
                      return sum + (price || 0);
                    }, 0);
                  discountableBase = basePrice - nonDiscountableSum;
                }
                let discountPercentage = 0;
                // 계산된 기간이 있으면 사용, 없으면 basePeriod 사용
                const effectiveBasePeriod = calculatedPeriod?.finalWeeks || basePeriod;
                const maxPeriod = effectiveBasePeriod + 8;
                const periodDiff = projectPeriod - effectiveBasePeriod;
                const maxPeriodDiff = maxPeriod - effectiveBasePeriod;
                if (periodDiff > 0 && maxPeriodDiff > 0) {
                  discountPercentage = (periodDiff / maxPeriodDiff) * 0.1;
                }
                return (
                  <AnimatedContainer $isvisible={isDetailsVisible}>
                    <EstimateAccordion
                      data={updatedEstimateData || estimateData}
                      onItemClick={handleItemClick}
                      estimateId={estimateId}
                      userId={userId}
                      title={(updatedEstimateData || estimateData)?.project_name || '견적서'}
                      discountRate={discountPercentage}
                      periodValue={Math.max(0, (projectPeriod || 0) - (effectiveBasePeriod || 0))}
                      onEstimateChange={handleEstimateChange}
                    />
                  </AnimatedContainer>
                );
              })()}
            </MainContent>
            
            <SideContent>
              <EstimateActionButtons
              estimate={estimateData}
                onConsult={() => console.log('문의하기')}
                onSubmit={(action) => {
                  // 견적 데이터를 포함해서 AI에게 요청
                  const aiPrompt = estimateData 
                    ? `${action}\n아래 견적을 기반으로 ${action}를 진행해주세요.\n[현재 견적 정보]\n프로젝트명: ${estimateData.project_name}\n총 금액: ${estimateData.categories?.reduce((sum, cat) => 
                        sum + cat.sub_categories?.reduce((subSum, sub) => 
                          subSum + sub.items?.reduce((itemSum, item) => 
                            itemSum + (item.is_deleted ? 0 : parseFloat(item.price?.replace(/,/g, '') || '0')), 0) || 0, 0) || 0, 0)?.toLocaleString()}원\n\n[세부 항목]\n${estimateData.categories?.map(cat => 
                      `${cat.category_name}:\n${cat.sub_categories?.map(sub => 
                        `  ${sub.sub_category_name}:\n${sub.items?.filter(item => !item.is_deleted).map(item => 
                          `    - ${item.name}: ${item.price}원 (FE: ${item.fe || '0일'}/BE: ${item.be || '0일'})`).join('\n')}`).join('\n')}`).join('\n\n')}\n\n`
                    : action;
                  
                  // 디버깅용 로그
                  devLog('EstimateActionButtons - estimateData:', estimateData);
                  devLog('EstimateActionButtons - project_name:', estimateData?.project_name);
                  devLog('EstimateActionButtons - project_name type:', typeof estimateData?.project_name);
                  devLog('EstimateActionButtons - project_name length:', estimateData?.project_name?.length);
                  devLog('EstimateActionButtons - action:', action);
                  
                  // 사용자 메시지는 프로젝트명과 액션으로 직접 생성
                  const projectName = estimateData?.project_name;
                  devLog('projectName 확인:', projectName);
                  devLog('조건 확인:', !!projectName);
                  
                  const displayMessage = projectName 
                    ? `${projectName} - ${action}`
                    : transformMessageForDisplay(aiPrompt);
                  
                  devLog('최종 displayMessage:', displayMessage);
                  
                  // prop으로 받은 onSubmit 사용
                  if (onSubmit) {
                    onSubmit(aiPrompt, { displayMessage });
                  }
                }}
              />
            </SideContent>
          </TopSection>
          {selectedItem && (
            <DetailModal
              item={selectedItem}
              onClose={handleCloseModal}
            />
          )}
        </EstimateContainer>
      )}
    </div>
  );
};

export default function AiChatPage() {
  const { modelName, setModelName, generate, sendChat, resetChat, startChatWithHistory, testModel } = useAI('gemini-2.5-flash');
  const { success, error } = useToast();
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const clear = useChatStore((s) => s.clear);
  const [selectedPromptId, setSelectedPromptId] = useState('default');
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);
  const isCrawlingUrl = useChatStore((s) => s.isCrawlingUrl); // 추가: URL 크롤링 상태 가져오기
  const { isAuthenticated, user } = useAuthStore(); // user 상태도 가져오기
  
  // 회사 정보 훅 사용
  const { companyInfo, isLoading: isCompanyLoading, fetchCompanyInfo } = useCompanyInfo();
  
  // 게스트 사용량 관리
  const { fetchGuestUsage } = useUsageStore();
  
  // URL에 superadmin이 포함되면 항상 다크모드, 그렇지 않으면 테마 스토어 값 사용
  const location2 = useLocation();
  const pathname = location2.pathname;
  const { isDarkMode: themeIsDarkMode } = useThemeStore();
  const isDarkMode = pathname?.includes('superadmin') ? true : themeIsDarkMode;

  const [isFirebaseChecking, setIsFirebaseChecking] = useState(true);
  const [globalLoadingStep, setGlobalLoadingStep] = useState(0); // 글로벌 로딩 단계
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // 글로벌 로딩 텍스트 가져오기 함수
  const getGlobalLoadingText = () => {
    switch (globalLoadingStep) {
      case 0:
        return '생각 중...';
      case 1:
        return '깊게 생각 중...';
      case 2:
        return '더 좋은 답변 고민 중...';
      default:
        return '생각 중...';
    }
  };

  // 견적서 생성 중인지 확인하는 함수
  const isEstimateGenerationInProgress = () => {
    // 현재 로딩 중인 메시지가 있는지 확인
    const loadingMessage = messages.find(m => m.isLoading);
    if (!loadingMessage) return false;
    
    // AI 메시지 중에 불완전한 견적서 데이터가 있는지 확인
    const aiMessages = messages.filter(m => m.role === 'ai' && !m.isLoading);
    return aiMessages.some(msg => {
      if (typeof msg.content !== 'string') return false;
      
      // 1. script 태그가 시작되었지만 끝나지 않은 경우
      const scriptStartPattern = /<script[^>]*id="invoiceData"[^>]*>/;
      const hasScriptStart = scriptStartPattern.test(msg.content);
      const hasScriptEnd = msg.content.includes('</script>');
      if (hasScriptStart && !hasScriptEnd) return true;
      
      // 2. 마크다운 코드 블록이 시작되었지만 끝나지 않은 경우
      const markdownJsonPattern = /```json\s*\n/;
      const hasMarkdownStart = markdownJsonPattern.test(msg.content);
      const hasMarkdownEnd = msg.content.includes('\n```');
      if (hasMarkdownStart && !hasMarkdownEnd) return true;
      
      // 3. 직접 JSON이 시작되었지만 끝나지 않은 경우
      const jsonStartPattern = /[{"](?:.*"uuid"|.*"project_name")/;
      const hasJsonStart = jsonStartPattern.test(msg.content);
      const hasJsonEnd = msg.content.includes('}');
      if (hasJsonStart && !hasJsonEnd) return true;
      
      return false;
    });
  };
  
  // 스크롤 버튼 관련 상태
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const {
    handleSubmit: originalHandleSubmit,
    handlePaste, // 🔥 이미지 붙여넣기 함수 추가
    stopStreaming: originalStopStreaming,
    isProcessing,
    uploadedFiles,
    isDragOver,
    uploadProgress,
    isUploading,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile,
  } = useChatActions({ modelName, selectedPromptId });

  const handleSubmit = async (value: string, options?: { displayMessage?: string; abortSignal?: AbortSignal }) => {
    await originalHandleSubmit(value, options);
    // 입력 완료 시 파일 미리보기 사라지게 하기
    uploadedFiles.forEach(file => removeFile(file.fileUri));
  };

  const stopStreaming = () => {
    originalStopStreaming();
    // 정지 버튼 시 파일 미리보기 사라지게 하기
    uploadedFiles.forEach(file => removeFile(file.fileUri));
  };

  // 로딩 상태 감지 및 타이머 설정
  useEffect(() => {
    const hasLoadingMessage = messages.some(m => m.isLoading);
    
    if (hasLoadingMessage) {
      setGlobalLoadingStep(0); // 초기화
      
      const timer1 = setTimeout(() => setGlobalLoadingStep(1), 10000); // 10초 후
      const timer2 = setTimeout(() => setGlobalLoadingStep(2), 20000); // 20초 후
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setGlobalLoadingStep(0); // 로딩이 끝나면 초기화
    }
  }, [messages]);

  // 인풋 복원용 state
  const [restoreInput, setRestoreInput] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      // 회사 정보 불러오기
      // if (!companyInfo && !isCompanyLoading) {
        devLog('회사정보 fetch 호출 - 테마 모드 적용 예정');
        await fetchCompanyInfo();
        
        // fetchCompanyInfo 완료 후 최신 회사정보로 테마 적용
        const latestCompanyInfo = useCompanyStore.getState().companyInfo;
        if (latestCompanyInfo && latestCompanyInfo.mode) {
          devLog('fetchCompanyInfo 완료 - 테마 모드 적용:', latestCompanyInfo.mode);
          if (latestCompanyInfo.mode === 'LIGHT') {
            useThemeStore.setState({ isDarkMode: false });
          } else if (latestCompanyInfo.mode === 'DARK') {
            useThemeStore.setState({ isDarkMode: true });
          }
        }
      // }
    };

    initializeData();
  }, []);

  // 회사 정보 및 게스트 사용량 불러오기 - 페이지 진입 시 한 번만 실행
  useEffect(() => {
    const initializeData = async () => {
      // 회사 정보 불러오기
      if (!companyInfo && !isCompanyLoading) {
        devLog('회사정보 fetch 호출 - 테마 모드 적용 예정');
        await fetchCompanyInfo();
        
        // fetchCompanyInfo 완료 후 최신 회사정보로 테마 적용
        const latestCompanyInfo = useCompanyStore.getState().companyInfo;
        if (latestCompanyInfo && latestCompanyInfo.mode) {
          devLog('fetchCompanyInfo 완료 - 테마 모드 적용:', latestCompanyInfo.mode);
          if (latestCompanyInfo.mode === 'LIGHT') {
            useThemeStore.setState({ isDarkMode: false });
          } else if (latestCompanyInfo.mode === 'DARK') {
            useThemeStore.setState({ isDarkMode: true });
          }
        }
      }

      // 게스트 사용량 불러오기 (로그인하지 않은 경우에만)
      if (!isAuthenticated) {
        const companyCode = getCompanyCodeFromUrl();
        const guestUuid = localStorage.getItem('guest-uuid');
        devLog('초기화 - companyCode:', companyCode, 'guestUuid:', guestUuid);
        if (guestUuid && companyCode) {
          devLog('게스트 사용량을 불러옵니다.');
          await fetchGuestUsage(companyCode);
        }
      }
    };

    initializeData();
  }, [companyInfo, isCompanyLoading, fetchCompanyInfo, isAuthenticated, fetchGuestUsage]);

  // 정지 버튼 핸들러: ai 메시지 정리 + 인풋 복원
  const handleRestoreInput = (input: string) => {
    setRestoreInput(input);
    stopStreaming();
  };
  
  // 스크롤 버튼 관련 함수
  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 스크롤 감지 useEffect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 현재 스크롤 위치가 문서 높이에서 2페이지(2 * windowHeight) 이상 위에 있으면 버튼 표시
      const showButton = (documentHeight - currentScrollY - windowHeight) > (2 * windowHeight);
      
      setShowScrollButton(showButton);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const [estimateDataForConsult, setEstimateDataForConsult] = useState<ProjectEstimate | null>(null);
  const [chatSessionId, setChatSessionId] = useState('');

// 페이지 진입 시 단가표 불러와서 promptStore에 저장
useEffect(() => {
  (async () => {
    try {
      const aiPromptsResponse = await getAiPrompts();
      devLog('AI 프롬프트 API 응답:', aiPromptsResponse);

      if (aiPromptsResponse && aiPromptsResponse.statusCode === 200 && aiPromptsResponse.data.length > 0) {
        ('AI 프롬프트 데이터를 불러왔습니다.');
        const promptsData = aiPromptsResponse.data as any[];
        const greetingItem = promptsData.find(item => item.name === 'GREETING');
        if (greetingItem && greetingItem.content) {
          usePromptStore.getState().setGreeting(greetingItem.content);
          setInitialAiMessage(greetingItem.content);
        }
        
        const instructionItem = promptsData.find(item => item.name === 'INSTRUCTION');
        devLog('instructionItem', instructionItem);
        const otherPrompts = promptsData.filter(item => item.name !== 'GREETING' && item.name !== 'INSTRUCTION' && item.content);
        const aiPromptsContent = [
          ...(instructionItem && instructionItem.content ? [instructionItem.content] : []),
          ...otherPrompts.map(item => item.content)
        ].join('\n\n');
        
        usePromptStore.getState().setAiPrompts(aiPromptsContent);
        devLog('AI 프롬프트 데이터를 불러왔습니다.',aiPromptsContent);
      } else {
        console.warn('AI 프롬프트 데이터를 불러오는데 실패했습니다.');
      }

      const res = await getAllUnitPrices();
      devLog('단가표 API 응답:', res);

      if (res && res.statusCode === 200 && res.data && Array.isArray(res.data.data)) {
        const priceList = res.data.data;
        const columns = res.data.columns || []; // ⭐️ columns 정보 추가
        usePromptStore.getState().setPriceList(priceList);

        const convertPriceListToMarkdown = (priceList: any[], columns: any[]): string => {
          if (!priceList || priceList.length === 0) {
            return '단가표 데이터를 불러오는데 실패했습니다.';
          }
          
          let markdown = '# 단가표 정보\n\n';
          markdown += '다음은 프로젝트 견적 산출에 사용되는 단가표 정보입니다.\n\n';

          // ⭐️ 동적 컬럼 생성 로직
          const activeColumns = (columns || [])
            .filter(colName => colName !== 'id' && colName !== '메모') // 불필요한 컬럼 제외
            .map(colName => ({
              name: colName,
              type: ['금액', '기간'].some(key => colName.includes(key)) ? 'number' : 'string'
            }));

          const categories = priceList.reduce((acc, item) => {
            const category = item.분류 || item.카테고리 || item.category || item.category_name || '기타';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(item);
            return acc;
          }, {} as Record<string, any[]>);

          Object.entries(categories).forEach(([categoryName, items]) => {
            markdown += `## ${categoryName}\n\n`;
            
            const headers = activeColumns.map(col => col.name);
            markdown += `| ${headers.join(' | ')} |\n`;
            markdown += `|${headers.map(() => '--------').join('|')}|\n`;

            (items as any[]).forEach((item) => {
              const rowData: string[] = [];
              activeColumns.forEach((column) => {
                const value = item[column.name] !== undefined && item[column.name] !== null ? item[column.name] : '-';
                rowData.push(
                  column.type === 'number' && !isNaN(Number(value))
                    ? Number(value).toLocaleString('ko-KR')
                    : String(value)
                );
              });
              markdown += `| ${rowData.join(' | ')} |\n`;
            });
            markdown += '\n';
          });

          markdown += '---\n\n';
          markdown += '**참고사항:**\n';
          markdown += '- 위 단가는 기본 단가이며, 프로젝트 복잡도에 따라 조정될 수 있습니다.\n';
          markdown += '- 실제 견적은 상세 요구사항 분석 후 산출됩니다.\n';
          markdown += '- 단가는 VAT 별도 금액입니다.\n';
          markdown += '- 기간은 프론트엔드(FE)와 백엔드(BE) 개발 기간을 합산한 기준입니다.\n';

          return markdown;
        };
        
        // ⭐️ 수정된 함수에 columns 정보 전달
        const markdown = convertPriceListToMarkdown(priceList, columns); 
        usePromptStore.getState().setPriceListMarkdown(markdown);
        usePromptStore.getState().setPriceDataReady(true);
      } else {
        console.warn('단가표 데이터를 불러오는데 실패했습니다.');
        usePromptStore.getState().setPriceDataReady(true);
      }
    } catch (e) {
      console.error('API 호출 실패', e);
      usePromptStore.getState().setPriceDataReady(true);
    }
  })();
}, []);

  // 🔥 페이지 진입 시 사용자 정보 및 사용량 초기화
  useEffect(() => {
    const initializeUserInfoAndUsage = async () => {
      const { isAuthenticated, fetchAndUpdateUserInfo } = useAuthStore.getState();
      const { fetchGuestUsage, fetchUserUsage } = useUsageStore.getState();
      const companyCode = getCompanyCodeFromUrl();
      
      console.log('초기화 시작 - companyCode:', companyCode);
      console.log('companyInfo:', companyInfo);
      console.log('isAuthenticated:', isAuthenticated());

      if (isAuthenticated()) {
        // 🟢 로그인한 사용자
        console.log('로그인 사용자 - 사용자 정보 업데이트 중...');
        
        try {
          // 사용자 정보 업데이트
          await fetchAndUpdateUserInfo();
          console.log('사용자 정보 업데이트 완료');
          
          // 회사 정보가 있고 사용자 정보가 업데이트되면 회원 사용량 조회
          if (companyInfo?._id) {
            console.log('회원 사용량 조회 시작 - companyId:', companyInfo._id);
            await fetchUserUsage(companyInfo._id);
            console.log('회원 사용량 조회 완료');
          } else {
            console.log('회사 정보가 없어 회원 사용량 조회를 건너뜁니다.');
          }
        } catch (error) {
          console.error('사용자 정보 업데이트 실패:', error);
        }
      } else {
        // 🟡 비로그인 사용자 (게스트)
        console.log('게스트 사용자 - 게스트 사용량 조회 중...');
        
        if (companyCode) {
          try {
            await fetchGuestUsage(companyCode);
            console.log('게스트 사용량 조회 완료');
          } catch (error) {
            console.error('게스트 사용량 조회 실패:', error);
          }
        } else {
          console.log('회사 코드가 없어 게스트 사용량 조회를 건너뜁니다.');
        }
      }
      
      console.log('초기화 프로세스 완료');
    };

    console.log('초기화 useEffect 시작');
    // 초기화 함수 실행 (await 사용)
    initializeUserInfoAndUsage().catch(error => {
      console.error('초기화 중 오류 발생:', error);
    });
  }, [companyInfo]); // companyInfo 변화를 감지하도록 의존성 배열에 추가

  useEffect(() => {
    // 메시지 목록을 역순으로 순회하여 가장 최근의 견적서를 찾습니다.
    const lastEstimateMessage = messages.slice().reverse().find(m => m.estimateId);
    
    if (lastEstimateMessage) {
      // 견적서 메시지를 찾으면 content에서 데이터를 추출합니다.
      let extractedData = extractEstimateData(lastEstimateMessage.content);
      if (extractedData) {
        // 클라이언트에서 uuid를 보장합니다.
        extractedData = ensureClientUuid(extractedData);
        setEstimateDataForConsult(extractedData);
      }
    } else {
      // 견적서 메시지가 없으면 상태를 초기화합니다.
      setEstimateDataForConsult(null);
    }
  }, [messages]); // messages 배열이 변경될 때마다 실행됩니다.

  useEffect(() => {
      // ⭐️ 추가: 로컬 스토리지에서 채팅 세션 ID 가져오기
      const storedChatSessionId = localStorage.getItem('chatSessionId');
      if (storedChatSessionId) {
        setChatSessionId(storedChatSessionId);
      }
  }, []);

  const handleInfoSubmit = useCallback(async (
    userInfo: { name: string; email: string; cellphone: string }, 
    estimateData: ProjectEstimate | null, // ⭐️ 인자로 받음
    chatSessionId: string // ⭐️ 인자로 받음
  ) => {
    if (!estimateData) {
      error('견적 정보가 없습니다. 다시 시도해주세요.');
      return;
    }
    const { project_name, uuid } = estimateData;

    if (!uuid || !chatSessionId) {
      error('필수 정보가 누락되었습니다.');
      return;
    }

    const userForApi = {
      id: localStorage.getItem('guest-uuid') || 'anonymous',
      name: userInfo.name,
      email: userInfo.email,
      cellphone: userInfo.cellphone,
    };
    
    try {
      const response = await requestEstimateConsult(
        uuid,
        project_name,
        chatSessionId,
        userForApi
      );
      if (response && response.statusCode === 200) {
        success('성공적으로 견적 요청이 접수되었습니다. 곧 연락드리겠습니다.');
      } else {
        error(`견적 요청에 실패했습니다: ${response?.error?.message || '알 수 없는 오류'}`);
      }
    } catch (e) {
      console.error(e);
      error('네트워크 오류로 견적 요청에 실패했습니다.');
    }
  }, [error, success]);
  
  const [initialAiMessage, setInitialAiMessage] = useState(`안녕하세요, AI 에이전트입니다.
견적 발행을 위해 프로젝트의 큰 그림을 한 줄로 알려주시겠어요?`)
  const [hasShownInitialMessage, setHasShownInitialMessage] = useState(false);

  // 세션 관리 로직 추가

  useEffect(() => {
    // URL에서 세션ID 파싱
    const searchParams = new URLSearchParams(location.search);
    const urlSessionId = searchParams.get('sessionId');

    const handleSessionManagement = async () => {
      const localChatSessionId = localStorage.getItem('chatSessionId')||sessionStorage.getItem('chatSessionId');
      let effectiveSessionId = urlSessionId || localChatSessionId;

      if (urlSessionId) {
        localStorage.setItem('chatSessionId', urlSessionId);
        setChatSessionId(urlSessionId);
        try {
          const messagesResponse = await getChatSessionMessages(urlSessionId) as any;
          if (messagesResponse && messagesResponse.statusCode === 200 && messagesResponse.data) {
            const chatMessages = messagesResponse.data.map((msg: any) => ({
              role: msg.role === 'USER' ? 'user' as const : 'ai' as const,
              content: msg.content.value || msg.content.content || '',
              messageId: msg._id,
              title: msg.title,
              estimateId: msg.content?.estimateId
            }));
            
            // AI 세션에 과거 대화 이력 전달
            const chatHistory = chatMessages.map((msg: any) => ({
              role: msg.role === 'user' ? 'user' as const : 'model' as const,
              content: msg.content
            }));
            startChatWithHistory(chatHistory);
            
            // 기존 메시지가 1개 이하이면(AI 첫 인사말만 있거나 없으면) DB에서 로드
            const currentMessages = useChatStore.getState().messages;
            if (currentMessages.length <= 1 || !hasShownInitialMessage) {
              clear();
              addMessage({ role: 'ai', content: initialAiMessage });
              chatMessages.forEach((msg: any) => addMessage(msg));
              setHasShownInitialMessage(true);
            }
          }
        } catch (error) {
          console.error('URL 세션 메시지 조회 실패:', error);
        }
        return;
      }

      if (isAuthenticated()) {
        if (localChatSessionId) {
          try {
            await transferChatSessionToUser(localChatSessionId);
            devLog("방 소유권 이전 성공, 세션 ID:", localChatSessionId);
            setChatSessionId(localChatSessionId);
            const messagesResponse = await getChatSessionMessages(localChatSessionId) as any;
            if (messagesResponse && messagesResponse.statusCode === 200 && messagesResponse.data) {
              const chatMessages = messagesResponse.data.map((msg: any) => ({
                role: msg.role === 'USER' ? 'user' as const : 'ai' as const,
                content: msg.content.value || msg.content.content || '',
                messageId: msg._id,
                title: msg.title,
                estimateId: msg.content?.estimateId
              }));
              
              // AI 세션에 과거 대화 이력 전달
              const chatHistory = chatMessages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' as const : 'model' as const,
                content: msg.content
              }));
              startChatWithHistory(chatHistory);
              
              // 기존 메시지가 있으면 clear하지 않고, 없을 때만 DB에서 로드
              const currentMessages = useChatStore.getState().messages;
              if (currentMessages.length === 0 || !hasShownInitialMessage) {
                clear();
                addMessage({ role: 'ai', content: initialAiMessage });
                chatMessages.forEach((msg: any) => addMessage(msg));
                setHasShownInitialMessage(true);
              }
            }
          } catch (error) {
            console.error('세션 소유권 이전 실패:',localChatSessionId, error);
          }
        } else {
          try {
            const sessionsResponse = await getChatSessions() as any;
            if (sessionsResponse && sessionsResponse.statusCode === 200 && sessionsResponse.data && sessionsResponse.data.length > 0) {
              const latestSession = sessionsResponse.data.sort((a: any, b: any) => 
                new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
              )[0];
              localStorage.setItem('chatSessionId', latestSession._id);
              setChatSessionId(latestSession._id);
              const messagesResponse = await getChatSessionMessages(latestSession._id) as any;
              if (messagesResponse && messagesResponse.statusCode === 200 && messagesResponse.data) {
                const chatMessages = messagesResponse.data.map((msg: any) => {
                  // 🔥 서버에서 files 정보를 가져와서 이미지 생성
                  let images: ImageData[] = [];
                  if (msg.content.files && Array.isArray(msg.content.files)) {
                    // 파일 배열에서 이미지 파일만 필터링
                    images = msg.content.files
                      .filter((fileName: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName))
                      .map((fileName: string) => {
                        // 환경에 따른 이미지 URL 생성
                        const getImageUrl = (fileName: string) => {
                          // 개발 환경에서는 프록시 설정에 의해 /api/file/로 접근
                          if (process.env.NODE_ENV === 'development') {
                            return `/api/file/${fileName}`;
                          }
                          
                          // 프로덕션 환경에서는 file 경로로 직접 접근
                          const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
                          return `${apiHost}/file/${fileName}`;
                        };
                        
                        return {
                          url: getImageUrl(fileName),
                          fileName: fileName,
                          mimeType: `image/${fileName.split('.').pop()?.toLowerCase() || 'png'}`
                        };
                      });
                  }
                  
                  return {
                    role: msg.role === 'USER' ? 'user' as const : 'ai' as const,
                    content: msg.content.value || msg.content.content || '',
                    images: images.length > 0 ? images : undefined, // 🔥 이미지 정보 추가
                    messageId: msg._id,
                    title: msg.title,
                    estimateId: msg.content?.estimateId
                  };
                });
                
                // 기존 메시지가 1개 이하이면(AI 첫 인사말만 있거나 없으면) DB에서 로드
                const currentMessages = useChatStore.getState().messages;
                if (currentMessages.length <= 1 || !hasShownInitialMessage) {
                  clear();
                  addMessage({ role: 'ai', content: initialAiMessage });
                  chatMessages.forEach((msg: any) => addMessage(msg));
                  setHasShownInitialMessage(true);
                }
              }
            }
          } catch (error) {
            console.error('세션 목록 조회 실패:', error);
          }
        }
      } else {
        if (localChatSessionId) {
          try {
            setChatSessionId(localChatSessionId);
            const messagesResponse = await getChatSessionMessages(localChatSessionId) as any;
            if (messagesResponse && messagesResponse.statusCode === 200 && messagesResponse.data) {
              const chatMessages = messagesResponse.data.map((msg: any) => {
                // 🔥 서버에서 files 정보를 가져와서 이미지 생성
                let images: ImageData[] = [];
                if (msg.content.files && Array.isArray(msg.content.files)) {
                  // 파일 배열에서 이미지 파일만 필터링
                  images = msg.content.files
                    .filter((fileName: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName))
                    .map((fileName: string) => {
                      // 환경에 따른 이미지 URL 생성
                      const getImageUrl = (fileName: string) => {
                        // 개발 환경에서는 프록시 설정에 의해 /api/file/로 접근
                        if (process.env.NODE_ENV === 'development') {
                          return `/api/file/${fileName}`;
                        }
                        
                        // 프로덕션 환경에서는 file 경로로 직접 접근
                        const apiHost = process.env.VITE_API_HOST || 'https://aigopartners.com';
                        return `${apiHost}/file/${fileName}`;
                      };
                      
                      return {
                        url: getImageUrl(fileName),
                        fileName: fileName,
                        mimeType: `image/${fileName.split('.').pop()?.toLowerCase() || 'png'}`
                      };
                    });
                }
                
                return {
                  role: msg.role === 'USER' ? 'user' as const : 'ai' as const,
                  content: msg.content.value || msg.content.content || '',
                  images: images.length > 0 ? images : undefined, // 🔥 이미지 정보 추가
                  messageId: msg._id,
                  title: msg.title,
                  estimateId: msg.content?.estimateId
                };
              });
              
              // 기존 메시지가 1개 이하이면(AI 첫 인사말만 있거나 없으면) DB에서 로드
              const currentMessages = useChatStore.getState().messages;
              if (currentMessages.length <= 1 || !hasShownInitialMessage) {
                clear();
                addMessage({ role: 'ai', content: initialAiMessage });
                chatMessages.forEach((msg: any) => addMessage(msg));
                setHasShownInitialMessage(true);
              }
            }
          } catch (error) {
            console.error('세션 메시지 조회 실패:', error);
          }
        }
      }
    };
    handleSessionManagement();
  }, [user, addMessage, clear, initialAiMessage, location.search]);

  useEffect(() => {
    if (messages.length === 0 && !hasShownInitialMessage) {
      const timer = setTimeout(() => {
        addMessage({ role: 'ai', content: initialAiMessage });
        setHasShownInitialMessage(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    // 메시지가 없고 이전에 인사말을 표시했던 경우 (새로운 채팅 시작)
    if (messages.length === 0 && hasShownInitialMessage) {
      setHasShownInitialMessage(false);
    }
  }, [messages, hasShownInitialMessage, addMessage, initialAiMessage]);

  useEffect(() => {
    devLog('[AiPageContent] Firebase auth listener - MOUNTING');
    setIsFirebaseChecking(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      devLog('[AiPageContent] onAuthStateChanged CALLBACK TRIGGERED. Firebase user:', user);
      if (user) {
        devLog(`[AiPageContent] Firebase user DETECTED (UID: ${user.uid}, Anonymous: ${user.isAnonymous})`);
        setIsFirebaseChecking(false);
      } else {
        devLog('[AiPageContent] No Firebase user DETECTED. Attempting anonymous sign-in...');
        try {
          await signInAnonymously(auth);
          devLog('[AiPageContent] Firebase anonymous sign-in attempt successful. Waiting for new auth state.');
        } catch (error) {
          console.error('[AiPageContent] Firebase anonymous sign-in FAILED:', error);
          setIsFirebaseChecking(false);
        }
      }
    });
    return () => {
      devLog('[AiPageContent] Firebase auth listener - UNMOUNTING. Unsubscribing.');
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('[AiChatPage] Firebase anonymous sign-in FAILED:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (endOfMessagesRef.current && messages.length >= 2) {
      const lastMessage = messages[messages.length - 1];
      const isLastMessageEstimate = lastMessage && isEstimateMessage(lastMessage.content);
      const isCurrentlyStreaming = isProcessing || messages.some(m => m.isLoading);
      
      // 스트리밍 중이면서 마지막 메시지가 견적서가 아닌 경우에만 스크롤
      if (isCurrentlyStreaming && !isLastMessageEstimate) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isProcessing]); // isProcessing도 의존성에 추가하여 스트리밍 상태 변화 감지

  const isEstimateMessage = (content: string) => {
    // console.log('content', content);
    if(typeof content !== 'string') return false;
    
    // 1. script 태그 형식
    if (content.includes('<script type="application/json" id="invoiceData">')) return true;
    
    // 2. 마크다운 코드 블록 형식
    if (/```json\s*\n[\s\S]*?"uuid"[\s\S]*?\n```/.test(content)) return true;
    
    // 3. 직접 JSON 형식 (uuid나 project_name 포함)
    if (/^[\s]*{[\s\S]*"(uuid|project_name)"[\s\S]*}[\s]*$/.test(content.trim())) return true;
    
    return false;
  };

  const onTestModel = async () => {
    const r = await testModel();
    if (r.ok) success(`[${modelName}] OK: ${r.message}`);
    else error(`[${modelName}] ERROR: ${r.message}`);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModelName(e.target.value as ModelName);
  };

  return (
    <Container
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 🔥 파일 미리보기 영역 제거 - 드래그앤드롭만 지원 */}
      <FileUploadArea
        $isDragOver={isDragOver}
      >
        <FileUploadText>
          {isUploading ? '파일 업로드 중...' : '여기에 파일을 드래그하여 업로드'} 
        </FileUploadText>
        <FileUploadSubtext>
          지원 형식: 이미지, PDF 한정
        </FileUploadSubtext>
        {isUploading && <ProgressBar $progress={uploadProgress} />}
      </FileUploadArea>
      <ChatBox>
        {messages.map((m, idx) => {
          if (m.role === 'user') {
            // 이미지와 텍스트를 분리해서 처리
            const parsedContent = parseMessageContent(m.content, m.images);
            
            // console.log('🔍 사용자 메시지 파싱:', {
            //   originalContent: m.content,
            //   originalImages: m.images,
            //   parsedContent,
            //   hasImages: parsedContent.hasImages
            // });
            
            return (
              <UserMessageContainer key={idx} hasImages={parsedContent.hasImages}>
                {/* 이미지가 있으면 그리드로 표시 */}
                {parsedContent.hasImages && (
                  <ImageGrid images={parsedContent.images} />
                )}
                {/* 텍스트가 있으면 말풍선으로 표시 */}
                {parsedContent.text && (
                  <UserMessage>
                    {parsedContent.text}
                  </UserMessage>
                )}
                {/* 기존 파일 첨부 표시는 제거 (새로운 이미지 시스템으로 대체됨) */}
              </UserMessageContainer>
            );
          } else {

                 if (m.isLoading) {
              const isEstimateGen = isEstimateGenerationInProgress();
              
              // 크롤링 중일 때 특별한 메시지 표시
              let loadingMessage = '';
              if (isCrawlingUrl) {
                loadingMessage = '보내주신 URL 탐색중... (최대 2분정도 소요됩니다.)';
              } else if (isEstimateGen) {
                loadingMessage = '견적서 만드는 중...';
              } else {
                loadingMessage = getGlobalLoadingText();
              }
              
              return (
                <StyledAiMessage
                  key={idx}
                  content={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <ProfileSpinner src={
                        companyInfo?.aiProfile 
                          ? (companyInfo.aiProfile.startsWith('/ai-estimate/') 
                              ? companyInfo.aiProfile 
                              : `/api/file/${companyInfo.aiProfile}`)
                          : "/ai-estimate/pretty.png"
                      } />
                      <GradientText>
                        {loadingMessage}
                      </GradientText>
                    </div>
                  }
                  profileImage={null}
                  name={companyInfo?.aiName || "AI 에이전트"}
                  isFullWidth={false}
                />
              );
            }
            return (
              <StyledAiMessage
                key={idx}
                content={<AiMessageContent 
                  content={m.content} 
                  chatSessionId={chatSessionId} 
                  onSubmit={handleSubmit}
                />} 
                profileImage={
                  companyInfo?.aiProfile 
                    ? (companyInfo.aiProfile.startsWith('/ai-estimate/') 
                        ? companyInfo.aiProfile 
                        : `/api/file/${companyInfo.aiProfile}`)
                    : "/ai-estimate/pretty.png"
                }
                name={companyInfo?.aiName || "AI 에이전트"}
                isFullWidth={isEstimateMessage(m.content)}
              />
            );
          }
          // 필요하다면 system 등 다른 role도 분기 가능
          return null;
        })}
        <div ref={endOfMessagesRef} />
      </ChatBox>
      
      {/* 스크롤 다운 버튼 */}
      <ScrollDownButton 
        $isVisible={showScrollButton}
        onClick={scrollToBottom}
        aria-label="맨 아래로 스크롤"
      >
        <ScrollDownIcon $isDark={isDarkMode}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0_scroll_down)">
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M12.707 15.7073C12.5194 15.8948 12.2651 16.0001 12 16.0001C11.7348 16.0001 11.4805 15.8948 11.293 15.7073L5.63598 10.0503C5.54047 9.9581 5.46428 9.84775 5.41188 9.72575C5.35947 9.60374 5.33188 9.47252 5.33073 9.33974C5.32957 9.20697 5.35487 9.07529 5.40516 8.95239C5.45544 8.82949 5.52969 8.71784 5.62358 8.62395C5.71747 8.53006 5.82913 8.4558 5.95202 8.40552C6.07492 8.35524 6.2066 8.32994 6.33938 8.33109C6.47216 8.33225 6.60338 8.35983 6.72538 8.41224C6.84739 8.46465 6.95773 8.54083 7.04998 8.63634L12 13.5863L16.95 8.63634C17.1386 8.45418 17.3912 8.35339 17.6534 8.35567C17.9156 8.35795 18.1664 8.46312 18.3518 8.64852C18.5372 8.83393 18.6424 9.08474 18.6447 9.34694C18.6469 9.60914 18.5461 9.86174 18.364 10.0503L12.707 15.7073Z"
              />
            </g>
            <defs>
              <clipPath id="clip0_scroll_down">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </ScrollDownIcon>
      </ScrollDownButton>
      <BottomInput
        placeholder="메시지를 입력하세요"
        onSubmit={handleSubmit}
        onPaste={handlePaste} // 🔥 이미지 붙여넣기 함수 전달
        onFileInput={handleFileInput}
        isUploading={isUploading}
        uploadedFiles={uploadedFiles}
        uploadProgress={uploadProgress}
        onDeleteFile={removeFile}
        onInfoSubmit={handleInfoSubmit}
        estimateDataForConsult={estimateDataForConsult}
        chatSessionId={chatSessionId}
        onRestoreInput={handleRestoreInput}
        onStopStreaming={stopStreaming}
        key={restoreInput !== null ? `restore-${restoreInput}` : undefined}
      />
    </Container>
  );
} 