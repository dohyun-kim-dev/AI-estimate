
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AiSettingRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/superAdmin/aiSetting/companyInfo");
  }, [navigate]);

  return null; // 로딩 메시지나 스피너를 추가할 수도 있음
}
