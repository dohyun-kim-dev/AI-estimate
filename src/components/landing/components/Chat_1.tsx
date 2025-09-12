import Consultant from "./common/Consultant";
import InquireCard from "./common/InquireCard";
import QuoteCard from "./common/QuoteCard";

export default function Chat_1() {
  return (
    <div className="bg-bg-d mt-[40px] flex w-full max-w-[960px] flex-col items-center sm:mt-[0px] sm:mb-[0px]">
      <div className="text-mobile-16r-body-light bg-bg-d flex w-full flex-col px-[16px] py-[40px] sm:max-w-[720px]">
        <Consultant imagePath="ai_consultant_3" label="강유하" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[300px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[446px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:py-[16px]">
          <p>
            안녕하세요 AI 컨설턴트 강유하 입니다. 만
            <br className="block sm:hidden" />나 뵙게 반갑습니다
          </p>
          <p className="mt-[12px] leading-tight">
            IT 프로젝트 관련 어떤 서비스를 만들고 싶은지 말씀 해주시겠어요
          </p>
        </div>
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] mb-[20px] w-[280px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:w-[358px] sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:py-[16px]">
          <p>
            AI 카메라를 통한 중고 시세 조회 앱을 만
            <br className="block sm:hidden" />
            들고 싶어요
          </p>
        </div>
        <Consultant imagePath="ai_consultant_3" label="강유하" />
        <div className="bg-tag-1 text-on-tag-1 mt-[8px] w-[300px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[600px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            AI 카메라를 통해 중고 시세를 조회하는 모바일 앱 아이디어, 정말
            멋지네요!
          </p>
          <p className="mt-[12px]">
            안드로이드(AOS)와 iOS 두 플랫폼 핵심 기능인 'AI 카메라를 통한 중고
            시세 조회'를 <span className="block sm:hidden">중심으로</span>
          </p>
          <p className="mt-[12px] sm:mt-[0px]">
            <span className="hidden sm:inline">중심으로,</span> 앱 개발에 필요한
            기능들 제안 전 체크 항목을 먼저 확인 필요해요
          </p>
          <p className="mt-[36px]">
            1. 시세 정보의 출처는 어디인가요? (예: 특정 중고 거래 사이트 데이터,
            자체 수집 데이터 등) 데이터 연동 방식에 따라 개발 범위가 달라질 수
            있습니다.
          </p>
          <p className="mt-[12px]">
            2. 사용자 간 중고 거래 기능도 앱 내에서 제공할 예정이신가요, 아니면
            단순히 시세 정보만 제공하는 앱인가요?
          </p>
        </div>
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] w-[266px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:w-[474px] sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:py-[16px]">
          <p>
            1.시세 조회 정보 출처는 중고거래
            <span className="block sm:inline">
              사이트 크롤링을 해서 진행 하고싶어요
            </span>
          </p>
        </div>
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] mb-[20px] w-[252px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:w-[459px] sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:py-[16px]">
          <p>
            2.사용자에게 단순하게 거래 되는
            <span className="block sm:inline">
              평균 판매 가격만 보여주는 앱이에요
            </span>
          </p>
        </div>
        <Consultant imagePath="ai_consultant_3" label="강유하" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[300px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[440px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            지금 까지 논의된 내용을 바탕으로
            <span className="inline sm:block">
              주요 기능과 예상 비용을 정리한 견적서를 아래에 제공해 드립니다
            </span>
          </p>
        </div>
        <QuoteCard chat_number={1} price="25,000,000" />
        <InquireCard />
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] mb-[20px] w-[276px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:w-[504px] sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:py-[16px]">
          <p>
            로그인과 관리자 페이지 불필요해요.조금 더 저렴한 금액으로 견적
            안될까요?
          </p>
        </div>
        <Consultant imagePath="ai_consultant_3" label="강유하" />
        <div className="text-on-tag-1 bg-tag-1 mt-[8px] w-[300px] rounded-t-[12px] rounded-br-[12px] px-[14px] py-[8px] leading-tight sm:w-[534px] sm:rounded-t-[20px] sm:rounded-br-[20px] sm:px-[16px] sm:py-[16px]">
          <p>
            말씀 하신 로그인 기능과 관리자 페이지 기능을 제외한 견적을 다시 안내
            드립니다
          </p>
        </div>
        <QuoteCard chat_number={1} price="18,000,000" />
        <InquireCard />
        <div className="bg-tag-2 text-on-tag2 text-on-tag-2 mt-[20px] w-[114px] self-end rounded-t-[12px] rounded-bl-[12px] px-[14px] py-[6px] leading-tight sm:rounded-t-[20px] sm:rounded-bl-[20px] sm:py-[16px]">
          <p>감사합니다 :)</p>
        </div>
      </div>
    </div>
  );
}
