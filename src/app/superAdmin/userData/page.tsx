import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function UserDataRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/superAdmin/userData/proposal');
  }, [navigate]);

  return null; // 로딩 메시지나 스피너를 추가할 수도 있음
}
