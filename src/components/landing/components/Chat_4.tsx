import Consultant from "./common/Consultant";
import InquireCard from "./common/InquireCard";
import QuoteCard from "./common/QuoteCard";

export default function Chat_4() {
  return (
    <div className="bg-bg-d mt-[40px] flex w-full max-w-[960px] flex-col items-center sm:mt-[0px] sm:mb-[0px]">
      <div className="text-mobile-16r-body-light bg-bg-d flex w-full flex-col px-[16px] py-[40px] sm:max-w-[720px]">
        <Consultant imagePath="ai_consultant_2" label="강태원" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[302px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[598px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            안녕하세요 기자재 AI 컨설턴트 강태원 입니 다. 만나 뵙게 되어서
            반갑습니다.
          </p>
          <p className="mt-[12px] leading-tight">
            산업 기자재 관련 어떤 장비나 시스템에 대해 서 견적을받아 보고 싶은지
            말씀해 주시겠어 요
          </p>
        </div>
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] mb-[20px] w-[280px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:w-[390px] sm:px-[16px] sm:py-[16px]">
          <p>생산현장에 사용할 포장 자동화 기자재 견적을 받고싶어요</p>
        </div>
        <Consultant imagePath="ai_consultant_2" label="강태원" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[302px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[476px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            좋은 선택이십니다! 포장 자동화 기자재는 현 장의 효율을 크게 높여주죠
          </p>
          <p className="mt-[12px] leading-tight">
            정확한 견적을 위해서 몇가지 확인 드리겠습 니다
          </p>
        </div>
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[302px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[476px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>•하루 기준 예상 처리량은 어느 정도인가 요? (예: 5,000박스/일)</p>
          <p className="mt-[12px] leading-tight">
            •자동화 수준은 어느 정도 원하시나요? (예: 단순 박스 씰링 vs. 라벨링
            + 계량 + 포장 풀 자동화)
          </p>
          <p className="mt-[12px] leading-tight">
            •기자재 설치 공간 제약이 있나요?
          </p>
          <p className="mt-[12px] leading-tight">
            •유지보수 계약이나 설치 교육도 함께 필요 하신가요?
          </p>
        </div>
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] mb-[20px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:px-[16px] sm:py-[16px]">
          <p className="leading-tight">하루 5,000박스 처리 기준</p>
          <p className="mt-[12px] leading-tight">
            자동 라벨링 + 씰링 기능만 필요
          </p>
          <p className="mt-[12px] leading-tight">
            설치 공간은 일반 생산라인에 맞춤 가능
          </p>
          <p className="mt-[12px] leading-tight">
            유지보수 계약은 1년 포함 좋겠습니다.
          </p>
        </div>
        <Consultant imagePath="ai_consultant_2" label="강태원" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[302px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[430px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>네, 말씀해주신 조건을 바탕으로 초기 견적을 안내 드리겠습니다.</p>
        </div>
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[248px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[312px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            품목: 포장 자동화 기자재
            <br />
            (라벨링 + 씰링 기능)
          </p>
          <p className="mt-[12px] leading-tight">수량: 2대</p>
          <p className="mt-[12px] leading-tight">단가: 25,000,000원</p>
          <p className="mt-[12px] leading-tight">
            총액: 50,000,000원 (부가세 별도)
          </p>
          <p className="mt-[12px] leading-tight">납기: 발주 후 10주</p>
          <p className="mt-[12px] leading-tight">
            포함: 설치 & 시운전, 1년 무상 A/S
          </p>
          <p className="mt-[12px] leading-tight">👉 옵션:</p>
          <p className="mt-[12px] leading-tight">
            2년차 이후 유지보수 계약
            <br />
            (연 3,000,000원)
          </p>
          <p className="mt-[12px] leading-tight">
            원격 모니터링 시스템
            <br />
            (장비당 2,000,000원)
          </p>
        </div>
        <QuoteCard chat_number={4} price="50,000,000" />
        <InquireCard />
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] w-[118px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:px-[16px] sm:py-[16px]">
          <p>감사합니다 :)</p>
        </div>
      </div>
    </div>
  );
}
