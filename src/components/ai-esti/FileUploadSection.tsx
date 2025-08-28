'use client';

import React from 'react';
import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FileUploadData } from '@/lib/firebase/firebase.functions';
// import { aiChatDictionary } from '@/lib/i18n/aiChat'; // 더 이상 사용되지 않으므로 제거

// 파일 업로드 관련 스타일 컴포넌트
const UploadedFilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #3f4246;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  max-width: fit-content; /* 내용물 크기에 맞춤 */

  span {
    font-size: 0.8rem;
    color: #ffffff;
    max-width: 150px; /* 파일 이름 최대 너비 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const UploadedFilesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 auto 1rem auto; /* 위아래 마진 추가 및 중앙 정렬 */
  max-width: 48rem; /* InputContainer와 동일 너비 */
  justify-content: center; /* 파일 목록 중앙 정렬 */
  color: #ffffff;
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
  // const t = aiChatDictionary[lang]; // t 변수는 사용되지 않으므로 제거

  return (
    <>
      {uploadedFiles.length > 0 && (
        <UploadedFilesContainer>
          {uploadedFiles.map((file) => (
            <UploadedFilePreview
              key={file.fileUri}
              style={{
                height: file.mimeType.startsWith('image/') ? '100px' : '60px',
                alignItems: 'center',
              }}
            >
              {file.mimeType.startsWith('image/') ? (
                <img
                  src={file.fileUri}
                  alt={file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
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
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </span>
                </div>
              )}
              <IconButton
                onClick={() => onDeleteFile(file.fileUri)}
                size="small"
                style={{ padding: '2px', marginLeft: 'auto' }}
                sx={{ color: '#FFFFFF' }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
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
