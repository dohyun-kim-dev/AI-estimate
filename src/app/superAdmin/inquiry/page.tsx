import { useEffect, useState } from 'react';
import { devError } from '@/lib/utils/devLogger';
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from '@/contexts/AdminAuthContext';

type DataContainerProps = {
  message: string;
  successChild: React.ReactNode;
  noDataChild?: React.ReactNode;
};

function DataContainer({ message, successChild, noDataChild }: DataContainerProps) {
  const isSuccess = message === 'success';
  return (
    <div style={{ flex: 1 }}>
      {isSuccess ? successChild : noDataChild ?? <p>No data available.</p>}
    </div>
  );
}

type ProductDetailContentProps = {
  title: string;
  data: any;
  color?: string;
};

function ProductDetailContent({ title, data, color }: ProductDetailContentProps) {
  return (
    <div style={{ backgroundColor: color, padding: '1rem', borderRadius: '8px' }}>
      <h3>{title}</h3>
      <pre style={{ fontSize: '13px', overflowX: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [productDetail1, setProductDetail1] = useState<any>(null);
  const [productDetail9999, setProductDetail9999] = useState<any>(null);

  const navigate = useNavigate(); // Next.js의 useRouter 훅 사용

  ;

  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout(); // ✅ context 상태까지 동기화
    navigate('/cms'); // 로그인 페이지로 이동
  };

  return (
      <ScreenWrapper>
        <main style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <h1>📊 관리자 대시보드</h1>

          <button
            onClick={handleLogout}
            style={{
              marginBottom: '1rem',
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            로그아웃
          </button>

          {dashboardError && <p style={{ color: 'red' }}>{dashboardError}</p>}
          {!dashboardData && !dashboardError && <p>대시보드 데이터 불러오는 중...</p>}

          {dashboardData && (
            <section
              style={{
                margin: '2rem 0',
                padding: '1rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <h2>📈 대시보드 원본 데이터</h2>
              <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
            </section>
          )}

          <section style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            <DataContainer
              message={productDetail1?.[0]?.message ?? ''}
              successChild={
                <ProductDetailContent
                  title="✅ 구독자 있음 (productIndex: 25)"
                  data={productDetail1}
                  color="#e0f7fa"
                />
              }
              noDataChild={
                <ProductDetailContent
                  title="❌ 구독자 없음 (productIndex: 25)"
                  data={productDetail1}
                  color="#ffe0b2"
                />
              }
            />

            <DataContainer
              message={productDetail9999?.[0]?.message ?? ''}
              successChild={
                <ProductDetailContent
                  title="✅ 구독자 있음 (productIndex: 9999)"
                  data={productDetail9999}
                  color="#e0f7fa"
                />
              }
              noDataChild={
                <ProductDetailContent
                  title="❌ 구독자 없음 (productIndex: 9999)"
                  data={productDetail9999}
                  color="#ffe0b2"
                />
              }
            />
          </section>
        </main>
      </ScreenWrapper>
  );
}