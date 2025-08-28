'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import useAI from '@/hooks/useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import BottomInput from '@/components/ai-esti/BottomInput';
import AiResponseMessage from '@/components/ai-esti/AiResponseMessage';
import PromptSelector from '@/components/ai-esti/PromptSelector';
import { promptTemplates, combinePrompts } from '@/ai/promptTemplates';
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



// ... (나머지 styled-components 및 함수들은 동일)
// Container 스타일 수정: position: relative 추가
const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: calc(276px + env(safe-area-inset-bottom));
  position: relative; /* FileUploadArea를 absolute로 띄우기 위함 */
  min-height: 100vh; /* 드래그 영역을 충분히 확보 */
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

// FileUploadArea 스타일 수정: position: absolute로 Container 전체를 덮도록
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

const UploadedFilesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: ${({ theme }) => theme.surface1};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const UploadedFileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.surface2};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.subtleText};
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;

  &:hover {
    background: ${({ theme }) => theme.border};
  }
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
  max-width: ${({ isFullWidth }) => (isFullWidth ? '100%' : '100%')};
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
  padding: 10px ;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 160%;
  letter-spacing: 0.28px;
  color: ${({ theme }) => theme.subtleText};
  cursor: pointer;
  margin: -20px 0 -20px;
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
`;

const StyledDiv = styled.div`
  font-size: 18px;
  line-height: 2.0;
  color: ${({ theme }) => (theme.body === '#FFFFFF' ? '#333333' : '#dddddd')};
`;

type ModelName = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.0-flash';

const extractEstimateData = (content: string): ProjectEstimate | null => {
  try {
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

const AiMessageContent: React.FC<{ content: string }> = ({ content }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);
  const [projectPeriod, setProjectPeriod] = useState(20);

  const estimateData = extractEstimateData(content);

  const handleItemClick = (item: EstimateItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  if (estimateData && estimateData.categories) {
    return (
      <EstimateContainer>
        {content.split('<script')[0].trim() && (
          <div style={{ marginBottom: '16px' }}>
            {content.split('<script')[0].trim()}
          </div>
        )}

        <TopSection>
          <MainContent>
            <EstimateCard estimate={estimateData} />
            <DetailsToggle onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
              상세견적 보기 {isDetailsVisible ?
                <DetailsToggleIcon><IoChevronUp size={24} /></DetailsToggleIcon> :
                <DetailsToggleIcon><IoChevronDown size={24} /></DetailsToggleIcon>
              }
            </DetailsToggle>
            <PeriodSlider value={projectPeriod} onChange={setProjectPeriod} $isvisible={isDetailsVisible} />
            <AnimatedContainer $isvisible={isDetailsVisible}>
              <EstimateAccordion
                data={estimateData}
                onItemClick={handleItemClick}
              />
            </AnimatedContainer>
          </MainContent>
          <SideContent>
            <EstimateActionButtons
              onConsult={() => console.log('문의하기')}
              onAiEstimate={() => console.log('AI 예산 줄이기')}
              onAiOptimize={() => console.log('AI 맞춤 추천')}
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
    );
  }
  if (content.includes('<script')) {
    return <StyledDiv>견적서를 불러오는 중...</StyledDiv>;
  }

  return <StyledDiv dangerouslySetInnerHTML={{ __html: content }} />;
};

export default function AiChatPage() {
  const { modelName, setModelName, generate, sendChat, resetChat, testModel } = useAI('gemini-2.5-flash-lite');
  const { success, error } = useToast();
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const clear = useChatStore((s) => s.clear);
  const [selectedPromptId, setSelectedPromptId] = useState('default');
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);

  // 파일 업로드 관련 상태
  const [isFirebaseChecking, setIsFirebaseChecking] = useState(true);

  // ⭐️ 1. useRef 훅으로 스크롤을 위한 ref 생성
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  //useChatActions 훅을 사용하여 모든 로직을 가져옵니다.
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

  // ⭐️⭐️⭐️ AI가 먼저 말하는 메시지 설정 ⭐⭐⭐
  const initialAiMessage = `안녕하세요! 저는 AI 프로젝트 매니저입니다. 만나뵙게 되어 반갑습니다. 어떤 종류의 프로젝트를 만들고 싶으신가요? 말씀해주시면 성공적인 프로젝트를 위한 최적의 솔루션과 예상 견적을 함께 논의해 드릴게요.
  
  <strong style="font-size: 20px;">프로젝트의 큰 그림을 알려주세요</strong>
  <ul><li><strong>프로젝트의 핵심 목표는 무엇인가요?</strong> 
  이 프로젝트를 통해 가장 중요하게 달성하고자 하는 비즈니스 목표가 있다면 알려주세요. (예: 신규 고객 확보, 내부 업무 효율화, 브랜드 인지도 향상 등)</li>
<li><strong>주요 사용자층은 누구인가요?</strong> 
  이 서비스를 누가, 어떤 목적으로 사용하게 될까요? (예: 일반 소비자, 기업 고객, 내부 직원 등)</li>
</ul><strong style="font-size: 20px;">핵심 기능과 아이디어를 구체화해 보세요</strong>
  <ul><li><strong>꼭 필요한 핵심 기능은 무엇인가요?</strong> 
  가장 먼저 구현해야 한다고 생각하는 필수 기능을 말씀해 주세요. (예: 회원가입/로그인, 상품 결제, 게시판, 실시간 채팅 등)</li>
<li><strong>참고하고 싶은 서비스나 아이디어가 있나요?</strong> 
  혹시 "네이버 쇼핑처럼 만들고 싶다"거나, "넷플릭스처럼 추천 기능을 넣고 싶다"와 같이 생각하고 계신 레퍼런스가 있다면 알려주세요. URL, 이미지, PDF 파일을 첨부해 주시면 더 좋습니다.</li>
</ul>궁금하신 점이나 추가로 설명하고 싶으신 내용이 있다면 언제든지 편하게 이야기해주세요.`;
  const [hasShownInitialMessage, setHasShownInitialMessage] = useState(false);


  //  컴포넌트 마운트 시 AI 메시지 출력 useEffect 
  useEffect(() => {
    if (messages.length === 0 && !hasShownInitialMessage) {
      const timer = setTimeout(() => {
        addMessage({ role: 'ai', content: initialAiMessage });
        setHasShownInitialMessage(true);
      }, 1000); // 1초 지연

      return () => clearTimeout(timer); // 언마운트 시 타이머 정리
    }
  }, [messages, hasShownInitialMessage, addMessage, initialAiMessage]);

  useEffect(() => {
    devLog('[AiPageContent] Firebase auth listener - MOUNTING');
    setIsFirebaseChecking(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      devLog(
        '[AiPageContent] onAuthStateChanged CALLBACK TRIGGERED. Firebase user:',
        user
      );
      if (user) {
        devLog(
          `[AiPageContent] Firebase user DETECTED (UID: ${user.uid}, Anonymous: ${user.isAnonymous})`
        );
        setIsFirebaseChecking(false);
      } else {
        devLog(
          '[AiPageContent] No Firebase user DETECTED. Attempting anonymous sign-in...'
        );
        try {
          await signInAnonymously(auth);
          devLog(
            '[AiPageContent] Firebase anonymous sign-in attempt successful. Waiting for new auth state.'
          );
        } catch (error) {
          console.error(
            '[AiPageContent] Firebase anonymous sign-in FAILED:',
            error
          );
          setIsFirebaseChecking(false);
        }
      }
    });

    return () => {
      devLog(
        '[AiPageContent] Firebase auth listener - UNMOUNTING. Unsubscribing.'
      );
      unsubscribe();
    };
  }, []);


  // Firebase 인증 상태 리스너 추가
  useEffect(() => {
    // setIsFirebaseChecking(true); // 이 상태가 컴포넌트에 없으므로 제거
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // console.log(`[AiChatPage] Firebase user DETECTED (UID: ${user.uid}, Anonymous: ${user.isAnonymous})`);
      } else {
        // console.log('[AiChatPage] No Firebase user DETECTED. Attempting anonymous sign-in...');
        try {
          await signInAnonymously(auth);
          // console.log('[AiChatPage] Firebase anonymous sign-in attempt successful. Waiting for new auth state.');
        } catch (error) {
          console.error('[AiChatPage] Firebase anonymous sign-in FAILED:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const isEstimateMessage = (content: string) => {
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
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>AI 대화</h1>
      <Controls>
        <Select value={modelName} onChange={handleModelChange}>
          <option value="gemini-2.5-flash">gemini-2.5-flash</option>
          <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
          <option value="gemini-2.0-flash">gemini-2.0-flash</option>
        </Select>
        <Button type="button" onClick={onTestModel}>모델 테스트</Button>
        <Button type="button" onClick={resetChat} style={{ background: '#374151' }}>채팅 세션 초기화</Button>
        <Button type="button" onClick={clear} style={{ background: '#6b7280' }}>메시지 비우기</Button>

        <PromptSelector
          templates={promptTemplates}
          selectedId={selectedPromptId}
          onSelect={setSelectedPromptId}
        />
      </Controls>

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

      {uploadedFiles.length > 0 && (
        <UploadedFilesContainer>
          {uploadedFiles.map((file) => (
            <UploadedFileItem key={file.name}>
              <span>{file.name}</span>
              <RemoveFileButton onClick={() => removeFile(file.name)}>
                ✕
              </RemoveFileButton>
            </UploadedFileItem>
          ))}
        </UploadedFilesContainer>
      )}

      <ChatBox>
        {messages.map((m, idx) => (
          m.role === 'user' ? (
            <UserMessage key={idx}>{m.content}</UserMessage>
          ) : (
            <StyledAiMessage
              key={idx}
              content={<AiMessageContent content={m.content} />}
              profileImage="/ai-estimate/pretty.png"
              name="AI 에이전트"
              isFullWidth={isEstimateMessage(m.content)}
            />
          )
        ))}
        <div ref={endOfMessagesRef} />
      </ChatBox>
      <FileUploadSection
        uploadedFiles={uploadedFiles}
        uploadProgress={uploadProgress}
        onDeleteFile={removeFile}
        lang="ko"
      />
      <BottomInput
        placeholder="메시지를 입력하세요"
        onSubmit={handleSubmit}
      />
    </Container>
  );
}