import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { ImageData } from '@/store/chatStore';
 
interface ImageGridProps {
  images: ImageData[];
  maxRows?: number;
}

// 파일 타입 확인 유틸리티
const isImageFile = (mimeType?: string): boolean => {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
};

const isDocumentFile = (mimeType?: string): boolean => {
  if (!mimeType) return false;
  return mimeType === 'application/pdf' || mimeType === 'text/plain';
};
 
const GridContainer = styled.div<{ imageCount: number; totalRows: number }>`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
  width: 80%; /* 전체 너비의 80%만 사용 */
  max-width: 80%; /* 최대 너비도 80%로 제한 */
  
  /* 이미지 개수에 따른 정렬 방식 조정 */
  justify-content: ${({ imageCount }) => {
    if (imageCount === 1) return 'center'; // 1개일 때는 중앙 정렬
    if (imageCount === 2) return 'space-between'; // 2개일 때는 양쪽 정렬
    return 'flex-start'; // 3개 이상일 때는 왼쪽 정렬
  }};
  
  /* iOS Safari 호환성 개선 - display: flex 강제 적용 */
  display: -webkit-box !important;
  display: -webkit-flex !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  
  /* iOS Safari Box Model 호환성 */
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  
  /* iOS Safari에서 강제 렌더링 */
  min-height: 100px;
  position: relative;
  z-index: 1;
`;
 
const ImageContainer = styled.div<{ isFirst?: boolean; imageCount: number }>`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  
  /* 간단한 크기 설정 - 부모 컨테이너 내에서만 계산 */
  ${({ imageCount }) => {
    if (imageCount === 1) return `
      flex: 0 0 100%;
      max-width: 100%;
    `;
    if (imageCount === 2) return `
      flex: 0 0 calc(50% - 4px);
      max-width: calc(50% - 4px);
    `;
    return `
      flex: 0 0 calc(33.333% - 6px);
      max-width: calc(33.333% - 6px);
    `;
  }}
  
  /* 1:1 비율 유지 - 간단하게 aspect-ratio 사용 */
  aspect-ratio: 1;
  
  /* iOS Safari 호환성을 위한 fallback */
  @supports not (aspect-ratio: 1) {
    height: 0;
    padding-bottom: 100%;
  }
  
  /* iOS Safari Box Model 호환성 */
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  
  /* iOS Safari GPU 가속 최적화 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  
  &:hover {
    transform: scale(1.02) translateZ(0);
    transition: transform 0.2s ease;
  }
`;
 
const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  cursor: pointer;
  
  /* aspect-ratio 미지원 시 절대 포지셔닝 */
  @supports not (aspect-ratio: 1) {
    position: absolute;
    top: 0;
    left: 0;
  }
  
  /* iOS Safari 이미지 렌더링 최적화 */
  -webkit-filter: brightness(1) contrast(1) saturate(1);
  filter: brightness(1) contrast(1) saturate(1);
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  
  /* iOS Safari 이미지 최적화 설정 */
  -webkit-optimize-contrast: auto;
  image-rendering: auto;
  
  /* iOS Safari 강제 표시 */
  opacity: 1 !important;
  visibility: visible !important;
  
  /* iOS Safari 터치 최적화 */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05) translateZ(0);
  }
`;
 
const MoreIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  backdrop-filter: blur(2px);
  cursor: pointer;
  
  /* iOS Safari 필터 문제 방지 */
  -webkit-filter: brightness(1) contrast(1);
  filter: brightness(1) contrast(1);
`;
 
// iOS 최적화된 이미지 컴포넌트 (로딩 속도 개선)
const OptimizedModalImage = ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 디버깅용 로그
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 OptimizedModalImage 초기화:', { src, currentSrc, isLoaded, hasError });
    }
  }, [src, currentSrc, isLoaded, hasError]);
  
  const handleLoad = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 OptimizedModalImage 로드 성공:', currentSrc);
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 15);
  };
  
  const handleError = () => {
    if (process.env.NODE_ENV === 'development') {
      console.error('🔍 OptimizedModalImage 로드 실패:', { currentSrc, hasError });
    }
    if (!hasError && !src.startsWith("data:image/svg+xml")) {
      setHasError(true);
      setCurrentSrc("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyIDEyQzIyIDEzLjk3NzggMjEuNDE0IDE1Ljg2NjYgMjAuMzcxNCAxNy40ODI5QzE5LjMyODkgMTkuMDk5MiAxNy44NzQ0IDIwLjM3MjYgMTYuMjAyOCAyMS4xNzU2QzE0LjUzMTMgMjEuOTc4NyAxMi43MTA2IDIyLjI5NTQgMTAuOTAzNyAyMi4wOTc2QzkuMDk2NzIgMjEuODk5OCA3LjM4NDMzIDIxLjE5NTMgNiAyMC4wOTEyQzQuNjE1NjcgMTguOTg3MSAzLjUzNzI1IDE3LjUxNjkgMi44NjMwNyAxNS44NDM3QzIuMTg4OSAxNC4xNzA0IDEuOTQ2NDMgMTIuMzQ2NSAyLjE3OTY3IDEwLjU1MDNDMi40MTI5MSA4Ljc1NDEzIDMuMTEzODUgNy4wNDcxOSA0LjIxNDcgNS42MTE4QzUuMzE1NTUgNC4xNzY0IDYuNzcyNjEgMy4wNjQ4MiA4LjQzNDMgMi4zNzQ3NyIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K");
      setIsLoaded(true);
    }
  };
  
  return (
    <img
      src={currentSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      loading="eager" /* 모달에서는 즉시 로딩 */
      style={{
        objectFit: 'contain',
        objectPosition: 'center',
        width: '100%',
        height: '100%',
        display: isLoaded ? 'block' : 'none',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.2s ease',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        /* iOS Safari 이미지 어두운 필터 문제 해결 */
        WebkitFilter: 'brightness(1) contrast(1) saturate(1)',
        filter: 'brightness(1) contrast(1) saturate(1)',
        /* iOS Safari 추가 최적화 */
        WebkitOptimizeContrast: 'auto',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        /* 강제 표시를 위한 최소 크기 */
        minWidth: '50px',
        minHeight: '50px',
        ...props.style
      }}
      {...props}
    />
  );
};
 
// 전체화면 모달
const FullScreenModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999999;
  display: flex;
  align-items: center;
  justify-content: center;
  
  isolation: isolate;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  
  touch-action: pan-x pan-y;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
`;
 
// 모달 컨테이너
const ModalContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  touch-action: pan-x pan-y;
  -webkit-touch-callout: none;
`;
 
// 슬라이더 컨테이너
const SliderContainer = styled.div`
  width: 100vw;
  height: 90%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;
 
// 슬라이더 래퍼
const SliderWrapper = styled.div<{ $currentIndex: number }>`
  display: flex;
  height: 100%;
  width: 100%;
  transition: transform 0.3s ease;
  transform: translateX(-${({ $currentIndex }) => $currentIndex * 100}%);
`;
 
// 슬라이드 아이템
const SlideItem = styled.div`
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 20px;
  box-sizing: border-box;
  
  /* iOS Safari 최적화 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  
  /* 이미지 컨테이너로서의 역할 강화 */
  position: relative;
  overflow: hidden;
`;
 
// 모달 이미지
const ModalImage = styled(OptimizedModalImage)`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  user-select: none;
  display: block !important; /* iOS Safari에서 강제 표시 */
  
  /* iOS Safari 이미지 렌더링 최적화 */
  -webkit-filter: brightness(1) contrast(1) saturate(1);
  filter: brightness(1) contrast(1) saturate(1);
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  
  /* iOS Safari 터치 및 최적화 설정 */
  touch-action: pan-x pan-y pinch-zoom;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -webkit-optimize-contrast: auto;
  image-rendering: auto;
  
  /* 이미지가 보이지 않을 때를 위한 최소 크기 보장 */
  min-width: 50px;
  min-height: 50px;
  width: auto;
  height: auto;
`;
 
// 닫기 버튼
const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  z-index: 99999999;
  
  /* 강제 원형 만들기 */
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
  min-height: 50px !important;
  max-width: 50px !important;
  max-height: 50px !important;
  border-radius: 50% !important;
  box-sizing: border-box !important;
  padding: 0 !important;
  
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
  
  /* 텍스트나 콘텐츠가 버튼을 늘이지 않도록 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 56px !important;
    height: 56px !important;
    min-width: 56px !important;
    min-height: 56px !important;
    max-width: 56px !important;
    max-height: 56px !important;
    font-size: 36px;
    top: 16px;
    right: 16px;
  }
`;
 
// 네비게이션 버튼
const NavButton = styled.button<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  ${({ $direction }) => $direction === 'prev' ? 'left: 20px;' : 'right: 20px;'}
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  z-index: 999998;
  
  /* 강제 원형 만들기 */
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
  min-height: 50px !important;
  max-width: 50px !important;
  max-height: 50px !important;
  border-radius: 50% !important;
  box-sizing: border-box !important;
  padding: 0 !important;
  
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 24px;
  font-weight: normal;
  flex-shrink: 0 !important;
  
  /* 텍스트 중심 정렬을 위한 추가 설정 */
  line-height: 1 !important;
  font-family: Arial, sans-serif;
  text-align: center !important;
  vertical-align: middle;
  
  /* 텍스트나 콘텐츠가 버튼을 늘이지 않도록 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  
  /* 좌우 화살표의 시각적 중심 보정 */
  ${({ $direction }) => $direction === 'prev'
    ? 'padding-right: 2px !important;'
    : 'padding-left: 2px !important;'
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  /* 모바일 및 터치 디바이스에서 숨기기 */
  @media (max-width: 768px) {
    display: none !important;
  }
  
  @media (hover: none) and (pointer: coarse) {
    display: none !important;
  }
  
  /* 작은 화면에서도 숨기기 */
  @media (max-width: 1024px) and (orientation: portrait) {
    display: none !important;
  }
`;
 
// 페이지네이션
const Pagination = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 999998;
`;
 
const PaginationDot = styled.button<{ $isActive: boolean }>`
  /* 강제 원형 만들기 */
  width: 10px !important;
  height: 10px !important;
  min-width: 10px !important;
  min-height: 10px !important;
  max-width: 10px !important;
  max-height: 10px !important;
  border-radius: 50% !important;
  box-sizing: border-box !important;
  padding: 0 !important;
  
  border: none;
  background: ${({ $isActive }) => $isActive ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0 !important;
  
  /* 텍스트나 콘텐츠가 버튼을 늘이지 않도록 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  
  &:hover {
    background: white;
  }
`;
 
const DocumentListContainer = styled.div`
  width: 80%;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// 문서 파일 아이템
const DocumentItem = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #333333;
  border: 1px solid #666666;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  
  
  &:active {
    transform: translateY(0);
  }
`;

// 파일 아이콘
const FileIcon = styled.div<{ fileType: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: bold;
  background: ${({ fileType }) => {
    if (fileType === 'pdf') return '#E74C3C';
    if (fileType === 'txt') return '#3498DB';
    return '#95A5A6';
  }};
  color: white;
`;

// 파일 정보
const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

// 파일 이름
const FileName = styled.span`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 파일 크기
const FileSize = styled.span`
  font-size: 12px;
  opacity: 0.6;
`;

// 다운로드 아이콘
const DownloadIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  
  ${DocumentItem}:hover & {
    opacity: 1;
  }
`;
 

const ImageGrid: React.FC<ImageGridProps> = ({ images, maxRows = 3 }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());
  
  // 터치 이벤트 상태
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  
  // iOS 감지
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // 이미지와 문서 파일 분리
  const imageFiles = images.filter(img => isImageFile(img.mimeType));
  const documentFiles = images.filter(img => isDocumentFile(img.mimeType));
  
  // 파일 크기 포맷 함수
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };
  
  // 파일 확장자 추출
  const getFileExtension = (fileName: string, mimeType?: string): string => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'text/plain') return 'TXT';
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };
  
  // 디버깅용 로그 추가
  console.log('🔍 ImageGrid 렌더링:', {
    totalFiles: images?.length,
    imageFiles: imageFiles.length,
    documentFiles: documentFiles.length,
    maxRows,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    isIOS,
    loadedImagesCount: loadedImages.size,
    errorImagesCount: errorImages.size
  });
  
  if (!images || images.length === 0) {
    console.log('🔍 ImageGrid: 파일이 없음');
    return null;
  }
 
  // 최대 표시할 이미지 개수는 maxRows * 3 (3열)
  const maxImages = maxRows * 3;
  const displayImages = imageFiles.slice(0, maxImages);
  const remainingCount = imageFiles.length - maxImages;
  const totalRows = Math.min(Math.ceil(imageFiles.length / 3), maxRows);
  
  console.log('🔍 ImageGrid 계산된 값:', {
    maxImages,
    displayImagesLength: displayImages.length,
    remainingCount,
    totalRows,
    documentFilesCount: documentFiles.length
  });
 
  const handleImageLoad = (index: number) => {
    console.log(`🔍 이미지 로드 성공 ${index}:`, displayImages[index]?.url);
    setLoadedImages(prev => new Set([...prev, index]));
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };
 
  const handleImageError = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('🔍 이미지 로드 실패:', {
      index,
      src: e.currentTarget.src,
      error: e,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      isIOS
    });
    
    setErrorImages(prev => new Set([...prev, index]));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    
    // iOS Safari에서 이미지 로드 재시도
    if (isIOS && !e.currentTarget.src.includes('data:image/svg+xml')) {
      setTimeout(() => {
        const img = e.currentTarget;
        const originalSrc = img.src;
        img.src = '';
        setTimeout(() => {
          img.src = originalSrc;
        }, 100);
      }, 1000);
    }
  };
 
  const openModal = (index: number) => {
    setModalIndex(index);
    setShowModal(true);
    // 모바일에서 스크롤 방지
    document.body.style.overflow = 'hidden';
  };
 
  const closeModal = () => {
    setShowModal(false);
    setModalIndex(0);
    // 스크롤 복구
    document.body.style.overflow = '';
  };
 
  const goToPrevious = () => {
    setModalIndex(prev => (prev > 0 ? prev - 1 : imageFiles.length - 1));
  };
 
  const goToNext = () => {
    setModalIndex(prev => (prev < imageFiles.length - 1 ? prev + 1 : 0));
  };
 
  const goToSlide = (index: number) => {
    setModalIndex(index);
  };
  
  // 파일 다운로드 핸들러
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, fileUrl: string, fileName: string) => {
    e.preventDefault();
    
    // URL에서 직접 다운로드
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  // 터치 이벤트 핸들러 (모달용)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.touches;
    if (touches.length === 1) {
      const touch = touches[0];
      startX.current = touch.clientX;
      isDragging.current = true;
      hasMoved.current = false;
    }
  };
 
  const handleTouchMove = (e: React.TouchEvent) => {
    const touches = e.touches;
    
    if (touches.length === 1 && isDragging.current) {
      const touch = touches[0];
      
      if (startX.current !== null) {
        const deltaX = touch.clientX - startX.current;
        
        if (Math.abs(deltaX) > 3) {
          hasMoved.current = true;
          e.preventDefault();
          e.stopPropagation();
        }
        
        if (Math.abs(deltaX) > 50) {
          e.preventDefault();
          e.stopPropagation();
          
          if (deltaX > 0) {
            goToPrevious();
          } else {
            goToNext();
          }
          
          startX.current = null;
          isDragging.current = false;
        }
      }
    }
  };
 
  const handleTouchEnd = () => {
    isDragging.current = false;
    hasMoved.current = false;
    startX.current = null;
  };
 
  // 모달 배경 클릭 시 닫기
  const handleModalBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === e.currentTarget) {
      closeModal();
    }
  };
 
  // 키보드 네비게이션
  React.useEffect(() => {
    if (!showModal) return;
 
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };
 
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);
 
  return (
    <>
      {/* 이미지 그리드 */}
      {imageFiles.length > 0 && (
        <GridContainer imageCount={displayImages.length} totalRows={totalRows}>
          {displayImages.map((image, index) => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`🔍 렌더링 이미지 ${index}:`, image.url);
            }
            return (
              <ImageContainer
                key={`${image.url}-${index}`}
                isFirst={index === 0}
                imageCount={displayImages.length}
                onClick={() => openModal(index)}
              >
                <Image
                  src={image.url}
                  alt={image.fileName || `이미지 ${index + 1}`}
                  onError={(e) => handleImageError(index, e)}
                  onLoad={() => handleImageLoad(index)}
                  loading={isIOS ? "eager" : "lazy"} // iOS에서는 즉시 로딩
                  style={{
                    opacity: loadedImages.has(index) ? 1 : 0.8,
                    transition: 'opacity 0.2s ease',
                    display: errorImages.has(index) ? 'none' : 'block'
                  }}
                />
                {/* 로딩 인디케이터 */}
                {!loadedImages.has(index) && !errorImages.has(index) && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    로딩중...
                  </div>
                )}
                {/* 마지막 이미지에 남은 개수 표시 */}
                {index === maxImages - 1 && remainingCount > 0 && (
                  <MoreIndicator onClick={() => openModal(index)}>
                    +{remainingCount}
                  </MoreIndicator>
                )}
              </ImageContainer>
            );
          })}
        </GridContainer>
      )}
      
      {/* 문서 파일 목록 */}
      {documentFiles.length > 0 && (
        <DocumentListContainer>
          {documentFiles.map((doc, index) => {
            const fileExt = getFileExtension(doc.fileName, doc.mimeType);
            return (
              <DocumentItem
                key={`doc-${doc.url}-${index}`}
                href={doc.url}
                onClick={(e) => handleDownload(e, doc.url, doc.fileName)}
                download={doc.fileName}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileIcon fileType={fileExt.toLowerCase()}>
                  {fileExt}
                </FileIcon>
                <FileInfo>
                  <FileName title={doc.fileName}>{doc.fileName}</FileName>
                  {doc.size && <FileSize>{formatFileSize(doc.size)}</FileSize>}
                </FileInfo>
                <DownloadIcon>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </DownloadIcon>
              </DocumentItem>
            );
          })}
        </DocumentListContainer>
      )}
 
      {/* 전체화면 모달 (이미지만) */}
      {showModal && imageFiles.length > 0 && (
        <FullScreenModal onClick={handleModalBackgroundClick}>
          <ModalContainer>
            <SliderContainer
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <SliderWrapper $currentIndex={modalIndex}>
                {imageFiles.map((image, index) => (
                  <SlideItem key={index}>
                    <ModalImage
                      src={image.url}
                      alt={image.fileName || `이미지 ${index + 1}`}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                  </SlideItem>
                ))}
              </SliderWrapper>
            </SliderContainer>
 
            {/* 네비게이션 버튼 */}
            {imageFiles.length > 1 && (
              <>
                <NavButton
                  $direction="prev"
                  onClick={goToPrevious}
                >
                  ‹
                </NavButton>
                <NavButton
                  $direction="next"
                  onClick={goToNext}
                >
                  ›
                </NavButton>
              </>
            )}
 
            {/* 페이지네이션 */}
            {imageFiles.length > 1 && (
              <Pagination>
                {imageFiles.map((_, index) => (
                  <PaginationDot
                    key={index}
                    $isActive={index === modalIndex}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </Pagination>
            )}
 
            {/* 닫기 버튼 */}
            <CloseButton onClick={closeModal}>
              ×
            </CloseButton>
          </ModalContainer>
        </FullScreenModal>
      )}
    </>
  );
};
 
export default ImageGrid;
 