// src/layout/ResponsiveView.tsx
'use client';

/**
 * ResponsiveView 컴포넌트는 현재 디바이스 타입(mobile, tablet, desktop)에 따라
 * 각각의 뷰를 조건부로 렌더링할 수 있도록 도와줍니다.
 * 각 폰트, 레이아웃은 스타일은 의존하고, ResponsiveView는 디바이스 브레이크포인트에 따라서 UI 형태가 달라지는 경우에 컴포넌트들을 전달 받아서 사용합니다
 *
 * ResponsiveView conditionally renders different views based on the current device type
 * (mobile, tablet, desktop) from DeviceContext.
 * Each font, layout, and style depend on the device type.
 * ResponsiveView takes components as props and renders them when the UI changes based on device breakpoints.
 */

import { useDevice } from '@/contexts/DeviceContext';
import React from 'react';

interface ResponsiveViewProps {
  mobileView?: React.ReactNode;   // 모바일 화면에서 보여줄 컴포넌트 | Component for mobile view
  tabletView?: React.ReactNode;   // 태블릿 화면에서 보여줄 컴포넌트 | Component for tablet view
  desktopView: React.ReactNode;   // 데스크톱 화면에서 기본으로 보여줄 컴포넌트 | Default component for desktop view
}

export default function ResponsiveView({
  mobileView,
  tabletView,
  desktopView,
}: ResponsiveViewProps) {
  const device = useDevice(); // 현재 디바이스 타입 가져오기 | Get current device type

  // 모바일인 경우 mobileView 렌더링 (있을 때만) | Render mobileView if device is mobile and it exists
  if (device === 'mobile' && mobileView) return <>{mobileView}</>;

  // 태블릿인 경우 tabletView 렌더링 (있을 때만) | Render tabletView if device is tablet and it exists
  // if (device === 'tablet' && tabletView) return <>{tabletView}</>;

  // 기본: 데스크톱 뷰 렌더링 | Default: Render desktop view
  return <>{desktopView}</>;
}
