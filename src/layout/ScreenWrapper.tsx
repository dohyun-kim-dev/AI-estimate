// src/components/layout/ScreenWrapper.tsx
"use client";

/**
 * ScreenWrapper 컴포넌트는 화면 크기(DeviceContext)에 따라
 * 상하좌우 여백(padding)을 자동으로 적용해주는 반응형 레이아웃 래퍼입니다.
 * 필요에 따라 여백을 오버라이드할 수 있습니다.
 *
 * ScreenWrapper is a responsive layout wrapper that applies default paddings
 * (top, bottom, horizontal) based on the current device type via DeviceContext.
 * You can override the paddings through props if needed.
 */

import { LayoutConstants } from "@/constants/layoutConstants";
import { useDevice } from "@/contexts/DeviceContext";
import type { DeviceType } from "@/types/device";
import React from "react";

interface ScreenWrapperProps {
  children: React.ReactNode;              // 내부에 감쌀 콘텐츠 | Content to render inside
  className?: string;                     // 선택적 커스텀 클래스 | Optional custom class
  paddingTop?: string;                    // 상단 여백 오버라이드 | Override top padding
  paddingBottom?: string;                 // 하단 여백 오버라이드 | Override bottom padding
  paddingHorizontal?: string;             // 좌우 여백 오버라이드 | Override horizontal padding
}

export default function ScreenWrapper({
  children,
  className,
  paddingTop,
  paddingBottom,
  paddingHorizontal,
}: ScreenWrapperProps) {
  const device = useDevice(); // 현재 디바이스 타입 가져오기 | Get current device type

  // 기본 여백 계산 (디바이스별) | Get default paddings based on device
  const defaultTop = LayoutConstants.screenPadding.top[device];
  const defaultBottom = LayoutConstants.screenPadding.bottom[device];
  const defaultHorizontal = LayoutConstants.screenPadding.horizontal[device];

  return (
    <div
      style={{
        paddingTop: paddingTop ?? defaultTop,                   // 상단 여백 설정 | Top padding
        paddingBottom: paddingBottom ?? defaultBottom,          // 하단 여백 설정 | Bottom padding
        paddingLeft: paddingHorizontal ?? defaultHorizontal,    // 좌측 여백 설정 | Left padding
        paddingRight: paddingHorizontal ?? defaultHorizontal,   // 우측 여백 설정 | Right padding
      }}
      className={className}
    >
      {children}
    </div>
  );
}
