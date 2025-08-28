import { useState, useEffect } from 'react';
import useAI from './useAI'; // 기존 useAI 훅 경로
import { useToast } from '@/components/common/ToastProvider';
import { useChatStore } from '@/store/chatStore';
import { combinePrompts } from '@/ai/promptTemplates';
import { uploadFiles, FileUploadData } from '@/firebase.functions';
import type { ModelName } from '@/app/ai-estimate/types'; // ModelName 타입 경로
import { createChatSession, sendChatMessage } from '@/lib/api/user/userApi'; // ⭐️ 추가된 API import

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

  // 파일 업로드 관련 함수
  const handleFileUpload = (fileData: FileUploadData) => {
    setUploadedFiles((prev) => [...prev, fileData]);
    setUploadProgress(0);
    setIsUploading(false);
    success(`파일 "${fileData.name}"이 업로드되었습니다.`);
  };

  const handleFileUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading && !isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setIsUploading(true);
      uploadFiles(files, {
        onUpload: handleFileUpload,
        progress: handleFileUploadProgress,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      uploadFiles(files, {
        onUpload: handleFileUpload,
        progress: handleFileUploadProgress,
      });
    }
  };

  // 핵심 로직: handleSubmit
  const handleSubmit = async (input: string) => {
    if ((!input.trim() && uploadedFiles.length === 0) || isProcessing) return;

    setIsProcessing(true);

    let userMessageContent = input;
    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map((file) => `[파일: ${file.name}]`).join('\n');
      userMessageContent = `${input}\n\n첨부된 파일:\n${fileInfo}`;
    }
    
    // ⭐️ 사용자 메시지를 먼저 화면에 표시
    addMessage({ role: 'user', content: userMessageContent });
    addMessage({ role: 'ai', content: '', isLoading: true });
    
    // ⭐️ API 로직: 채팅 세션 ID가 없으면 새로 생성
    let currentSessionId = chatSessionId;
    if (!currentSessionId) {
      try {
        const createResponse = await createChatSession(input.slice(0, 20) || '새로운 채팅');
        if (createResponse && createResponse.data && createResponse.data.sessionId) {
          currentSessionId = createResponse.data.sessionId;
          setChatSessionId(currentSessionId);
          console.log(`새로운 채팅방이 생성되었습니다: ${currentSessionId}`);
        } else {
          // 서버에서 유효한 세션 ID를 반환하지 않았을 경우
          throw new Error('채팅방 생성에 실패했습니다.');
        }
      } catch (e) {
        error(`채팅방 생성 실패: ${(e as Error).message}`);
        setIsProcessing(false);
        return;
      }
    }

    try {
      // ⭐️ 메시지 전송 API 호출
      await sendChatMessage(currentSessionId, { role: 'user', content: input });
      
      const filesForGemini = uploadedFiles.map((file) => ({
        name: file.name,
        fileUri: file.fileUri,
        mimeType: file.mimeType,
      }));

      const combinedPrompt = combinePrompts(selectedPromptId, input);
      const reply = await sendChat(combinedPrompt, filesForGemini);

      updateLastMessage(reply);
      setUploadedFiles([]);
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
