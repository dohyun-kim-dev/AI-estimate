'use client';

import React from 'react';

interface GradientButtonProps {
  title: string;
  gradient?: string; // 배경 그라데이션
  href?: string;
  onClick?: () => void;
  titleColor?: string; // 제목 글자 색상
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  gradient = 'linear-gradient(to bottom, #e6dcc9, #ddc180)',
  href,
  onClick,
  titleColor = '#333', // ✅ 기본 텍스트 색
}) => {
  const commonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    minWidth: 220,
    fontSize: 16,
    fontWeight: 500,
    color: titleColor, // ✅ 여기에 반영
    textDecoration: 'none',
    borderRadius: 8,
    background: gradient,
    transition: 'opacity 0.2s',
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',     
    outline: 'none',     
    appearance: 'none',     
  };

  const content = (
    <>
      <span>{title}</span>
      <span style={{ fontSize: 18, marginLeft: 8 }}>›</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" style={commonStyle} onClick={onClick}>
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={commonStyle}>
        {content}
      </a>
    );
  }

  return <div style={{ ...commonStyle, opacity: 0.6, pointerEvents: 'none' }}>{content}</div>;
};
