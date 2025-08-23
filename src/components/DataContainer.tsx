import React from 'react';

/**
 * DataContainer는 API 응답 메시지(`message`)를 기반으로
 * 성공 / 실패(또는 no data) 시 서로 다른 UI를 명확히 구분하여 렌더링합니다.
 *
 * 일반적으로 API 호출 결과를 처리하는 화면에서는 이 컴포넌트를 사용해
 * 응답 상태에 따른 UI 분기를 명시적으로 수행해야 합니다.
 *
 * ---
 *
 * DataContainer renders different UI based on API response `message`.
 * It separates UI for success and failure (`no data`) explicitly.
 *
 * This component is **required** when rendering data from API responses,
 * to enforce clear separation between success and fallback views.
 */

type Props = {
  message: string;               // API 응답 메시지 ("success", "no data", etc.) / API response message
  successChild: React.ReactNode; // 성공 시 표시할 UI / UI to render on success
  noDataChild?: React.ReactNode; // 실패 또는 데이터 없음 시 표시할 UI / UI to render on failure (optional)
};

export default function DataContainer({ message, successChild, noDataChild }: Props) {
  const isSuccess = message === 'success';

  return (
    <div style={{ flex: 1 }}>
      {isSuccess ? successChild : noDataChild ?? <p>데이터가 없습니다.</p>}
    </div>
  );
}
