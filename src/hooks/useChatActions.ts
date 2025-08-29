// src/hooks/useChatActions.ts

import { useState } from 'react';
import useAI from './useAI';
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import { combinePrompts } from '@/ai/promptTemplates';
import { uploadFiles, FileUploadData } from '@/firebase.functions';
import type { ModelName } from '@/app/ai-estimate/types';
import { createChatSession, sendChatMessage } from '@/lib/api/user/userApi';
import { generateAndUploadPdf } from '@/hooks/pdfUtils';
import type { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';

// 견적서 데이터를 추출하는 유틸리티 함수
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

interface UseChatActionsProps {
  modelName: ModelName;
  selectedPromptId: string;
}

export function useChatActions({ modelName, selectedPromptId }: UseChatActionsProps) {
  const { sendChat } = useAI(modelName);
  const { success, error } = useToast();
  const { addMessage, updateLastMessage, chatSessionId, setChatSessionId } = useChatStore((s) => ({
    addMessage: s.addMessage,
    updateLastMessage: s.updateLastMessage,
    chatSessionId: s.chatSessionId,
    setChatSessionId: s.setChatSessionId,
  }));

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // 파일 업로드 관련 함수들... (생략)
  const handleFileUpload = (fileData: FileUploadData) => { /* ... */ };
  const handleFileUploadProgress = (progress: number) => { /* ... */ };
  const removeFile = (fileName: string) => { /* ... */ };
  const handleDragOver = (e: React.DragEvent) => { /* ... */ };
  const handleDragLeave = (e: React.DragEvent) => { /* ... */ };
  const handleDrop = (e: React.DragEvent) => { /* ... */ };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

  const handleSubmit = async (input: string) => {
    if ((!input.trim() && uploadedFiles.length === 0) || isProcessing) return;

    setIsProcessing(true);

    let userMessageContent = input;
    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map((file) => `[파일: ${file.name}]`).join('\n');
      userMessageContent = `${input}\n\n첨부된 파일:\n${fileInfo}`;
    }
    
    addMessage({ role: 'user', content: userMessageContent });
    addMessage({ role: 'ai', content: '', isLoading: true });
    
    let currentSessionId = chatSessionId;
    if (!currentSessionId) {
      try {
        const createResponse = await createChatSession(input.slice(0, 20) || '새로운 채팅');
        
        if (createResponse && createResponse.statusCode === 200 && createResponse.data && createResponse.data._id) {
          currentSessionId = createResponse.data._id;
          setChatSessionId(currentSessionId);
        } else {
          throw new Error(createResponse.error?.message || '채팅방 생성에 실패했습니다.');
        }
      } catch (e) {
        error(`채팅방 생성 실패: ${(e as Error).message}`);
        setIsProcessing(false);
        return;
      }
    }

    try {
      await sendChatMessage(currentSessionId, { 
        role: 'USER', 
        content: { type: 'text', value: input }
      });
      
      const filesForGemini = uploadedFiles.map((file) => ({
        name: file.name,
        fileUri: file.fileUri,
        mimeType: file.mimeType,
      }));

      const combinedPrompt = combinePrompts(selectedPromptId, input);
      const reply = await sendChat(combinedPrompt, filesForGemini);

      // ⭐️ 핵심 수정 부분: 여기서 견적서 데이터를 추출하고 PDF 함수를 호출합니다.
      const estimateData = extractEstimateData(reply);
      if (estimateData) {
        console.log('견적서 JSON을 감지했습니다. PDF 변환 및 업로드를 시작합니다.');
        try {
          const invoiceTitle = estimateData.project_name || '새로운 견적서';
          // 추출한 estimateData를 generateAndUploadPdf 함수에 전달
          await generateAndUploadPdf(estimateData, currentSessionId, invoiceTitle, success, error);
        } catch (pdfError) {
          console.error('PDF 생성 또는 업로드 중 오류 발생:', pdfError);
          error(`견적서 업로드 실패: ${(pdfError as Error).message}`);
        }
      }

      await sendChatMessage(currentSessionId, {
        role: 'AI',
        content: { type: 'text', value: reply }
      });

      updateLastMessage(reply);
      setUploadedFiles([]);

    } catch (e) {
      error(`메시지 전송 실패: ${(e as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleSubmit,
    isProcessing,
    uploadedFiles,
    isDragOver,
    isUploading,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile,
    uploadProgress,
  };
}