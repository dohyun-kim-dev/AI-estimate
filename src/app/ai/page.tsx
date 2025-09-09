"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import useAI from '@/hooks/useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import BottomInput from '@/components/ai-esti/BottomInput';
import AiResponseMessage from '@/components/ai-esti/AiResponseMessage';
import EstimateCard from '@/components/ai-esti/EstimateCard';
import EstimateAccordion from '@/components/ai-esti/EstimateAccordion';
import DetailModal from '@/components/ai-esti/DetailModal';
import EstimateActionButtons from '@/components/ai-esti/EstimateActionButtons';
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
import { requestEstimateConsult } from '@/lib/api/user/userApi';
import { getEstimateIdFromContent } from '@/hooks/estimate';
import { v4 as uuidv4 } from 'uuid';


const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: calc(0px + env(safe-area-inset-bottom));
  position: relative;
  // min-height: 100vh;

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

const UserMessage = styled.div`
  align-self: flex-end;
  background: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 80%;
  white-space: pre-wrap;
  font-size: 18px;
  line-height: 2.0;
`;

const FileUploadArea = styled.div<{ $isDragOver: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed ${({ $isDragOver, theme }) => ($isDragOver ? theme.accent : 'transparent')};
  background: ${({ $isDragOver, theme }) => ($isDragOver ? `${theme.accent}10` : 'transparent')};
  transition: all 0.3s ease;
  z-index: ${({ $isDragOver }) => ($isDragOver ? 1000 : -1)};
  pointer-events: ${({ $isDragOver }) => ($isDragOver ? 'auto' : 'none')};
  border-radius: 8px;
`;

const FileUploadText = styled.div`
  color: ${({ theme }) => theme.subtleText};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const FileUploadSubtext = styled.div`
  color: ${({ theme }) => theme.subtleText};
  font-size: 18px;
  opacity: 0.8;
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
  align-self: flex-start;
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

const MainContent = styled.div`
  flex: 1;
  min-width: 320px;
  width: 100%;
  padding-bottom: 20px;

  @media (min-width: 1024px) {
    width: 560px;
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

const DetailsToggle = styled.div`
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
  margin: -20px 0 -20px;

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
    const match = content.match(/<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/);
    if (!match) return null;

    const jsonStr = match[1];
    const data = JSON.parse(jsonStr);

    if (!data || typeof data !== 'object' || !Array.isArray(data.categories)) {
      console.error('Invalid estimate data structure:', data);
      return null;
    }

    return data as ProjectEstimate;
  } catch (error) {
    console.error('Failed to parse estimate data:', error);
    return null;
  }
};

const parseMessageContent = (content: string) => {
  const fileMatch = content.match(/\[첨부파일: (.+?)\]/);
  if (fileMatch) {
    const fileName = fileMatch[1];
    const textContent = content.replace(/\[첨부파일: .+?\]/, '').trim();
    const imageUrl = `/api/file/${fileName}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
    return {
      text: textContent,
      fileName,
      imageUrl,
      isImage
    };
  }
  return {
    text: content,
    fileName: null,
    imageUrl: null,
    isImage: false
  };
};

export const AiMessageContent: React.FC<{ content: string; chatSessionId?: string; estimateDataForConsult?: ProjectEstimate }> = ({ content, chatSessionId, estimateDataForConsult }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);
  const estimateData = estimateDataForConsult || extractEstimateData(content);
  const { handleSubmit } = useChatActions({ modelName: 'gemini-2.5-flash-lite', selectedPromptId: 'default' });
  const estimateId = estimateData?.uuid;
  const effectiveChatSessionId = chatSessionId || localStorage.getItem('chatSessionId') || '';
  const updateLastMessage = useChatStore((s) => s.updateLastMessage); // ⭐️ 추가: updateLastMessage 가져오기
  const messages = useChatStore((s) => s.messages); // ⭐️ 추가: messages 배열 가져오기


  

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


  const { total_amount: basePrice, total_period: basePeriod } = useMemo(() => {
  if (!estimateData || !Array.isArray(estimateData.categories)) {
    return { total_amount: 0, total_period: 0 };
  }

  const total_amount = estimateData.categories.reduce((sum, category) => {
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
          const frontPeriod = typeof item.front_end_period === 'string' ? parseFloat(item.front_end_period) : (item.front_end_period || 0);
          const backPeriod = typeof item.back_end_period === 'string' ? parseFloat(item.back_end_period) : (item.back_end_period || 0);
          return itemSum + (isNaN(frontPeriod) ? 0 : frontPeriod) + (isNaN(backPeriod) ? 0 : backPeriod);
        }, 0);
        return subSum + subPeriod;
      }, 0);
      return sum + categoryPeriod;
    }, 0);

    return { total_amount, total_period };
  }, [estimateData]);

  const [projectPeriod, setProjectPeriod] = useState(basePeriod);
  const [discountedPrice, setDiscountedPrice] = useState(basePrice);

  useEffect(() => {
    if (basePeriod > 0) {
      setProjectPeriod(basePeriod);
    }
    setDiscountedPrice(basePrice);
  }, [basePeriod, basePrice]);

  useEffect(() => {
    const baseCommonCategory = estimateData?.categories
    .flatMap(category => category.sub_categories)
    .find(subCategory => subCategory.sub_category_name === '기반 공통');

  const nonDiscountableSum = baseCommonCategory?.items.reduce((sum, item) => {
    // 삭제된 항목은 비할인 대상 합산에서도 제외
    if (item.is_deleted) return sum;
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
    return sum + (price || 0);
  }, 0) || 0;

  const discountableBase = basePrice - nonDiscountableSum;

  let discountPercentage = 0;
  const maxPeriod = basePeriod + 8;
  const periodDiff = projectPeriod - basePeriod;
  const maxPeriodDiff = maxPeriod - basePeriod;

  if (periodDiff > 0 && maxPeriodDiff > 0) {
    // 슬라이더 위치에 비례하여 0%부터 최대 20%까지 할인율 적용
    discountPercentage = (periodDiff / maxPeriodDiff) * 0.1;
  }

  const newDiscountedPrice = discountableBase * (1 - discountPercentage) + nonDiscountableSum;
  setDiscountedPrice(newDiscountedPrice);
  }, [projectPeriod, basePeriod, basePrice]);

  const handleItemClick = (item: { name: string; price: string; description: string }) => {
    // EstimateItem 타입으로 변환
    const estimateItem: EstimateItem = {
      id: item.name, // 임시로 name을 id로 사용
      category: '', // 빈 문자열로 설정
      task: item.name,
      description: item.description,
      people: 1, // 기본값
      days: 1, // 기본값
      cost: typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : parseFloat(item.price),
      // const: item.price,
      front_end_period: 0, // 기본값
      back_end_period: 0 // 기본값
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

  // 메시지 내용을 견적서와 일반 텍스트로 분리
  if (typeof content !== 'string') {
    return null;
  }
  const parts = content.split('<script');  const textContent = parts[0].replace(/\\n/g, '<br/>').trim();  // \n을 <br/>로 변환
  const hasEstimate = estimateData && estimateData.categories;


  
  return (
    <div>
      {/* 일반 텍스트 메시지 표시 */}
      {textContent && (
        <StyledDiv 
          style={{ 
            marginBottom: hasEstimate ? '24px' : '0',
            fontSize: '18px',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ __html: textContent }} 
        />
      )}

      {/* 견적서가 있는 경우 표시 */}
      {hasEstimate && (
        <EstimateContainer>
          <TopSection>
            <MainContent>
              <EstimateCard 
                estimate={estimateData} 
                discountedPrice={discountedPrice || 0} // ⭐️ 수정: 기본값 0 추가
                projectPeriod={projectPeriod || 0}   // ⭐️ 수정: 기본값 0 추가
              />
              <DetailsToggle onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
                상세견적 보기 {isDetailsVisible ?
                  <DetailsToggleIcon><IoChevronUp size={24} /></DetailsToggleIcon> :
                  <DetailsToggleIcon><IoChevronDown size={24} /></DetailsToggleIcon>
                }
              </DetailsToggle>
              <PeriodSlider 
                value={projectPeriod || 0}  // ⭐️ 수정: 기본값 0 추가
                onChange={setProjectPeriod}
                $isvisible={isDetailsVisible}
                min={basePeriod || 0}         // ⭐️ 수정: 기본값 0 추가
                max={(basePeriod || 0) + 8}   // ⭐️ 수정: 기본값 0 추가
                discountedPrice={discountedPrice || 0} // ⭐️ 수정: 기본값 0 추가
                basePrice={basePrice || 0}    // ⭐️ 수정: 기본값 0 추가
              />            

              <AnimatedContainer $isvisible={isDetailsVisible}>
                <EstimateAccordion
                  data={estimateData}
                  onItemClick={handleItemClick}
                  chatSessionId={effectiveChatSessionId}
                  estimateId={estimateId}
                  userId={userId}
                  title={estimateData?.project_name || '견적서'}
                />
              </AnimatedContainer>
            </MainContent>
            <SideContent>
              <EstimateActionButtons
                onConsult={() => console.log('문의하기')}
                onSubmit={() => handleSubmit(content)}
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
  const { modelName, setModelName, generate, sendChat, resetChat, testModel } = useAI('gemini-2.5-flash-lite');
  const { success, error } = useToast();
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const clear = useChatStore((s) => s.clear);
  const [selectedPromptId, setSelectedPromptId] = useState('default');
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);

  const [isFirebaseChecking, setIsFirebaseChecking] = useState(true);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    isProcessing,
    uploadedFiles,
    isDragOver,
    uploadProgress,
    isUploading,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile,
  } = useChatActions({ modelName, selectedPromptId });
  
  const [estimateDataForConsult, setEstimateDataForConsult] = useState<ProjectEstimate | null>(null);
  const [chatSessionId, setChatSessionId] = useState('');

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
        project_name,
        uuid,
        chatSessionId,
        userForApi
      );
      if (response.statusCode === 200) {
        success('성공적으로 견적 요청이 접수되었습니다. 곧 연락드리겠습니다.');
      } else {
        error(`견적 요청에 실패했습니다: ${response.error?.message || '알 수 없는 오류'}`);
      }
    } catch (e) {
      console.error(e);
      error('네트워크 오류로 견적 요청에 실패했습니다.');
    }
  }, [error, success]);
  
  const initialAiMessage = `AI 컨설턴트 강유하 입니다 만나 뵙게 되어 반갑습니다
어떤 종류의 프로젝트를 만들고 싶으신가요?

  프로젝트의 큰 그림을 알려주세요
  <ul style="padding-left: 30px;"><li>프로젝트의 핵심 목표는 무엇인가요?</li><li>주요 사용자층은 누구인가요?
</li><li>꼭 필요한 핵심 기능은 무엇인가요?</li></ul>
궁금하신 점이나 추가로 설명하고 싶으신 내용이 있다면 언제든지 편하게 이야기해주세요.`;
  const [hasShownInitialMessage, setHasShownInitialMessage] = useState(false);

  useEffect(() => {
    if (messages.length === 0 && !hasShownInitialMessage) {
      const timer = setTimeout(() => {
        addMessage({ role: 'ai', content: initialAiMessage });
        setHasShownInitialMessage(true);
      }, 1000);
      return () => clearTimeout(timer);
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
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const isEstimateMessage = (content: string) => {
    // console.log('content', content);
    if(typeof content !== 'string') return false;
    return content.includes('<script type="application/json" id="invoiceData">');
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
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <FileUploadArea
        $isDragOver={isDragOver}
      >
        <FileUploadText>
          {isUploading ? '파일 업로드 중...' : '여기에 파일을 드래그하여 업로드'}
        </FileUploadText>
        <FileUploadSubtext>
          지원 형식: 이미지, PDF, 문서 파일
        </FileUploadSubtext>
        {isUploading && <ProgressBar $progress={uploadProgress} />}
        {!isUploading && !isProcessing && (
          <Button
            onClick={() => document.getElementById('file-input')?.click()}
            style={{ marginTop: '20px', zIndex: 1001, pointerEvents: 'auto' }}
          >
            파일 선택
          </Button>
        )}
      </FileUploadArea>
      <input
        id="file-input"
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInput}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.hwp"
      />
      <ChatBox>
        {messages.map((m, idx) => {
          if (m.role === 'user') {
            const parsedContent = parseMessageContent(m.content);
            return (
              <UserMessage key={idx}>
                {parsedContent.text}
                {parsedContent.fileName && (
                  <div style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }}>
                    📎 {parsedContent.fileName}
                  </div>
                )}
              </UserMessage>
            );
          } else {
            
            return (
              <StyledAiMessage
                key={idx}
                content={<AiMessageContent content={m.content} chatSessionId={chatSessionId}/>}
                profileImage="/ai-estimate/pretty.png"
                name="강유하"
                isFullWidth={isEstimateMessage(m.content)}
              />
            );
          }
        })}
        <div ref={endOfMessagesRef} />
      </ChatBox>
      <BottomInput
        placeholder="메시지를 입력하세요"
        onSubmit={handleSubmit}
        onFileInput={handleFileInput}
        isUploading={isUploading}
        isProcessing={isProcessing}
        uploadedFiles={uploadedFiles}
        uploadProgress={uploadProgress}
        onDeleteFile={removeFile}
        onInfoSubmit={handleInfoSubmit}
        estimateDataForConsult={estimateDataForConsult}
        chatSessionId={chatSessionId} 
      />
    </Container>
  );
}