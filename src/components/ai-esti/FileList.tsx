import React from 'react';
import styled from 'styled-components';
import { FileData } from '@/store/chatStore';
import { getFileUrl } from '@/lib/api/user/userApi';
import { devLog } from '../../utils/devLogger';

interface FileListProps {
  files: FileData[];
}

const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
  max-width: 80%;
`;

const FileItem = styled.a`
  display: flex;
  align-items: center;
  width: 300px;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  transition: all 0.2s ease;


  &:active {
    transform: translateY(0);
  }
`;

const FileIcon = styled.div<{ $fileType: string }>`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  
  ${({ $fileType }) => {
    if ($fileType === 'application/pdf') {
      return `background: linear-gradient(135deg, #FF5722, #FF7043);`;
    }
    if ($fileType === 'text/plain') {
      return `background: linear-gradient(135deg, #607D8B, #78909C);`;
    }
    return `background: linear-gradient(135deg, #9E9E9E, #BDBDBD);`;
  }}
`;

const FileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.subtleText};
`;

const DownloadIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    stroke: ${({ theme }) => theme.accent};
    stroke-width: 2;
    fill: none;
  }
`;

// 파일 아이콘 텍스트 (확장자 표시)
const getFileIconText = (mimeType: string): string => {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType === 'text/plain') return 'TXT';
  return 'FILE';
};

// 파일 크기 포맷팅
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 파일 다운로드 핸들러
const handleFileDownload = (file: FileData) => {
  // 이미 전체 URL인 경우 그대로 사용, 아니면 getFileUrl로 변환
  const downloadUrl = file.url
  devLog('⬇️ [FileList] 파일 다운로드 시도:', {
    fileName: file.fileName,
    downloadUrl,
    file
  });
  // 새 창에서 열어 다운로드 트리거
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = file.fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const FileList: React.FC<FileListProps> = ({ files }) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <FileListContainer>
      {files.map((file, index) => (
        <FileItem
          key={`${file.url}-${index}`}
          onClick={(e) => {
            e.preventDefault();
            handleFileDownload(file);
          }}
          href="#"
        >
          <FileIcon $fileType={file.mimeType}>
            {getFileIconText(file.mimeType)}
          </FileIcon>
          <FileInfo>
            <FileName title={file.fileName}>{file.fileName}</FileName>
            {file.size && <FileSize>{formatFileSize(file.size)}</FileSize>}
          </FileInfo>
          <DownloadIcon>
            <svg viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </DownloadIcon>
        </FileItem>
      ))}
    </FileListContainer>
  );
};

export default FileList;
