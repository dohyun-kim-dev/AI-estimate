import Consultant from "./common/Consultant";
import InquireCard from "./common/InquireCard";
import QuoteCard from "./common/QuoteCard";

export default function Chat_3() {
  return (
    <div className="bg-bg-d mt-[40px] flex w-full max-w-[960px] flex-col items-center sm:mt-[0px] sm:mb-[0px]">
      <div className="text-mobile-16r-body-light bg-bg-d flex w-full flex-col px-[16px] py-[40px] sm:max-w-[720px]">
        <Consultant imagePath="ai_consultant_1" label="강상희" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[300px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[526px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            안녕하세요 2차전지 배터리팩 AI 컨설턴트 강상희 입니다. 만나 뵙게
            반갑습니다
          </p>
          <p className="mt-[12px] leading-tight">
            어떤 배터리 팩을 만들고싶으신지 말씀해 주 시겠어요?
          </p>
        </div>
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] mb-[20px] w-[280px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:w-[468px] sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            https://aigopartners.com/1 에 표기된 전기 카트 모델에 150개 정도
            배터리 팩 구매가 필요합니다. 관련해서 견적 가능 할까요?
          </p>
        </div>
        <Consultant imagePath="ai_consultant_1" label="강상희" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[302px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[600px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            해당 사이트 확인 결과 전기 카트 BA100 모 델에 들어 가는 배터리팩을
            찾으시는것 같네 요.
          </p>
          <p className="mt-[12px] leading-tight">
            관련해서 배터리팩 스팩은 3S 20P로 확인 됩니다 관련 모델로 견적
            산출해 드리면 될까 요?
          </p>
        </div>
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] mb-[20px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:px-[16px] sm:py-[16px]">
          <p>네 견적 산출해 주세요</p>
        </div>
        <Consultant imagePath="ai_consultant_1" label="강상희" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[300px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[384px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>3S 20P 기준으로 150개 수량으로 견적서 전달 드립니다</p>
        </div>
        <QuoteCard chat_number={3} price="25,000,000" />
        <InquireCard />
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] w-[118px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:px-[16px] sm:py-[16px]">
          <p>감사합니다 :)</p>
        </div>
      </div>
    </div>
  );
}
