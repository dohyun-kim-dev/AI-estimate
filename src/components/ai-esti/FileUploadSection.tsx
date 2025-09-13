'use client';

import React from 'react';
import styled, { useTheme } from 'styled-components';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FileUploadData } from '@/firebase.functions';
// import { aiChatDictionary } from '@/lib/i18n/aiChat'; // 더 이상 사용되지 않으므로 제거

// 파일 업로드 관련 스타일 컴포넌트
const UploadedFilePreview = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  min-width: 100px;
  width: 100px;
  height: 100px;

  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text};
    max-width: 150px; /* 파일 이름 최대 너비 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const UploadedFilesContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin: 0 auto 1rem auto; /* 위아래 마진 추가 및 중앙 정렬 */
  max-width: 48rem; /* InputContainer와 동일 너비 */
  justify-content: flex-start; /* 파일 목록 왼쪽 정렬 */
  color: ${({ theme }) => theme.text};
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.border} transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.subtleText};
  }
`;

interface FileUploadSectionProps {
  uploadedFiles: FileUploadData[];
  uploadProgress: number;
  onDeleteFile: (fileUri: string) => void;
  lang: 'ko' | 'en';
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  uploadedFiles,
  uploadProgress,
  onDeleteFile,
  // lang, // lang prop은 사용되지 않으므로 주석 처리 또는 제거
}) => {
  const theme = useTheme();
  // const t = aiChatDictionary[lang]; // t 변수는 사용되지 않으므로 제거

  return (
    <>
      {uploadedFiles.length > 0 && (
        <UploadedFilesContainer>
          {uploadedFiles.map((file) => (
            <UploadedFilePreview
              key={file.fileUri}
              style={{
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={() => onDeleteFile(file.fileUri)}
                size="small"
                style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  right: '2px', 
                  padding: '2px',
                  backgroundColor: theme.surface1,
                  borderRadius: '50%'
                }}
                sx={{ color: theme.text }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
              {file.mimeType.startsWith('image/') ? (
                <img
                  src={file.fileUri}
                  alt={file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <span
                    title={file.name}
                    style={{
                      display: 'block',
                      maxWidth: '80px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </span>
                </div>
              )}
            </UploadedFilePreview>
          ))}
        </UploadedFilesContainer>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div
          style={{
            width: '100%',
            maxWidth: '48rem',
            margin: '0 auto 0.5rem auto',
          }}
        >
          <progress
            value={uploadProgress}
            max="100"
            style={{ width: '100%' }}
          />
        </div>
      )}
    </>
  );
};

export default FileUploadSection;
