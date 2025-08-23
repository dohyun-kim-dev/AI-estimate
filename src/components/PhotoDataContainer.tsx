import React from 'react';
import {Image } from '@mui/icons-material'; // 기본 아이콘 사용

/**
 * 공통 Props 타입 정의
 */
type DataContainerProps = {
  message: string;               // API 응답 메시지
  successChild: React.ReactNode; // 성공 시 보여줄 UI
  noDataChild?: React.ReactNode; // 데이터 없을 때 사용자 정의 UI (선택)
};


/**
 * PhotoDataContainer는 이미지 데이터를 위한 데이터 렌더링 컨테이너입니다.
 * 데이터가 없을 경우 산 아이콘과 함께 기본 안내 문구를 표시합니다.
 */
export function PhotoDataContainer({ message, successChild, noDataChild }: DataContainerProps) {
    const isSuccess = message === 'success';
  
    return (
      <div style={{ flex: 1 }}>
        {isSuccess ? (
          successChild
        ) : (
          noDataChild ?? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              <Image style={{ fontSize: 48, marginBottom: 12 }} />
              <p>이미지가 존재하지 않습니다.</p>
            </div>
          )
        )}
      </div>
    );
  }
  