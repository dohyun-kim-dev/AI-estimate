import { jsx as _jsx } from "react/jsx-runtime";
// src/app/ai-estimate/components/Icon.tsx
import { useState } from 'react';
import styled from 'styled-components';
import { IoImage, IoMoon, IoSunny, IoLogoGithub, IoChatbubbleEllipses, IoDocument, IoSettings, IoExpand } from 'react-icons/io5';
const ImageWrapper = styled.img `
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
const IconWrapper = styled.div `
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
const getFallbackIcon = (type = 'image') => {
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
const Icon = ({ src, width, height, angle, className, onClick, fallbackIcon = 'image' }) => {
    const [imageError, setImageError] = useState(false);
    const FallbackIconComponent = getFallbackIcon(fallbackIcon);
    if (imageError) {
        return (_jsx(IconWrapper, { width: width, height: height, className: className, onClick: onClick, children: _jsx(FallbackIconComponent, { size: width || height || 24 }) }));
    }
    return (_jsx(ImageWrapper, { src: src, width: width, height: height, angle: angle, className: className, onClick: onClick, onError: () => setImageError(true) }));
};
export default Icon;
