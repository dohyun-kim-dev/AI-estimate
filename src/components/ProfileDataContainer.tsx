import React from 'react';
import { Person} from '@mui/icons-material'; // 기본 아이콘 사용

/**
 * 공통 Props 타입 정의
 */
type DataContainerProps = {
  message: string;               // API 응답 메시지
  successChild: React.ReactNode; // 성공 시 보여줄 UI
  noDataChild?: React.ReactNode; // 데이터 없을 때 사용자 정의 UI (선택)
};

/**
 * ProfileDataContainer는 프로필 정보를 위한 데이터 렌더링 컨테이너입니다.
 * 데이터가 없을 경우 사람 아이콘과 함께 기본 안내 문구를 표시합니다.
 */
export function ProfileDataContainer({ message, successChild, noDataChild }: DataContainerProps) {
  const isSuccess = message === 'success';

  return (
    <div style={{ flex: 1 }}>
      {isSuccess ? (
        successChild
      ) : (
        noDataChild ?? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            <Person style={{ fontSize: 48, marginBottom: 12 }} />
            <p>등록된 프로필 정보가 없습니다.</p>
          </div>
        )
      )}
    </div>
  );
}
