// src/app/ai-estimate/components/Icon.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  IoImage, 
  IoMoon, 
  IoSunny, 
  IoLogoGithub,
  IoChatbubbleEllipses,
  IoDocument,
  IoSettings,
  IoExpand
} from 'react-icons/io5';

export type IconName = 'image' | 'moon' | 'sun' | 'logo' | 'chat' | 'document' | 'settings' | 'expand'

interface IconProps {
  src: string;
  width?: number;
  height?: number;
  angle?: number;
  className?: string;
  onClick?: () => void;
  fallbackIcon?: IconName;
}

const ImageWrapper = styled.img<{ width?: number; height?: number; angle?: number }>`
  width: ${({ width }) => (width ? `${width}px` : 'auto')};
  height: ${({ height }) => (height ? `${height}px` : 'auto')};
  transform: ${({ angle }) => (angle ? `rotate(${angle}deg)` : 'none')};
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  padding: 0;
  margin: 0;
  &:hover {
    transform: ${({ angle }) => (angle ? `rotate(${angle}deg)` : 'none')} scale(1.1);
  }
`;

const IconWrapper = styled.div<{ width?: number; height?: number }>`
  width: ${({ width }) => (width ? `${width}px` : '24px')};
  height: ${({ height }) => (height ? `${height}px` : '24px')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

const getFallbackIcon = (type: IconName = 'image') => {
  switch (type) {
    case 'moon':
      return IoMoon;
    case 'sun':
      return IoSunny;
    case 'logo':
      return IoLogoGithub;
    case 'chat':
      return IoChatbubbleEllipses;
    case 'document':
      return IoDocument;
    case 'settings':
      return IoSettings;
    case 'expand':
      return IoExpand;
    case 'image':
    default:
      return IoImage;
  }
};

const Icon: React.FC<IconProps> = ({ 
  src, 
  width, 
  height, 
  angle, 
  className, 
  onClick,
  fallbackIcon = 'image'
}) => {
  const [imageError, setImageError] = useState(false);
  const FallbackIconComponent = getFallbackIcon(fallbackIcon);

  if (imageError) {
    return (
      <IconWrapper 
        width={width} 
        height={height} 
        className={className} 
        onClick={onClick}
      >
        <FallbackIconComponent size={width || height || 24} />
      </IconWrapper>
    );
  }

  return (
    <ImageWrapper
      src={src}
      width={width}
      height={height}
      angle={angle}
      className={className}
      onClick={onClick}
      onError={() => setImageError(true)}
    />
  );
};

export default Icon;