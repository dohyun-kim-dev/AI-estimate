import Button from "../common/Button";
import { useNavigate } from "react-router-dom";

function CompletedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#ECEFFE] px-[16px] py-[40px] sm:px-[160px] sm:py-[50px]">
      <div className="flex flex-1 items-center justify-center sm:-mt-[150px]">
        <div className="text flex flex-col items-center">
          <img
            src="/images/envelope.svg"
            className="h-[160px] w-[160px] sm:h-[240px] sm:w-[240px]"
          />
          <p className="text-mobile-20sb-title2 text-on-bg-e-1 sm:text-pc-32b-emphasis-title mt-[8px]">
            가입 문의 주셔서 감사합니다
          </p>
          <p className="text-mobile-16sb-body text-on-bg-e-2 sm:text-pc-16r-subtext mt-[8px]">
            영업일 기준 1일내 연락 드리겠습니다
          </p>
        </div>
      </div>
      <Button
        onClick={() => navigate("/", { replace: true })}
        customStyle="text-on-btn-a text-mobile-15m-btn rounded-2xl items-center justify-center gap-[8px] w-full sm:max-w-[880px] py-[12px] bg-[linear-gradient(to_right,#7393FF_0%,#1A1FFF_50%,#1A1FFF_100%)]"
        hasArrow
      >
        메인으로 돌아가기
      </Button>
    </div>
  );
}

export default CompletedPage;
