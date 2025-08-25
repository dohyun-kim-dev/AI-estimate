import React from 'react';
/**
 * 공통 Props 타입 정의
 */
type DataContainerProps = {
    message: string;
    successChild: React.ReactNode;
    noDataChild?: React.ReactNode;
};
/**
 * PhotoDataContainer는 이미지 데이터를 위한 데이터 렌더링 컨테이너입니다.
 * 데이터가 없을 경우 산 아이콘과 함께 기본 안내 문구를 표시합니다.
 */
export declare function PhotoDataContainer({ message, successChild, noDataChild }: DataContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
