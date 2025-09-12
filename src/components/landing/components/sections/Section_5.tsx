export default function Section_5() {
  return (
    <section className="flex w-full flex-col items-center px-[16px] pt-[50px] pb-[25px] sm:bg-gradient-to-b sm:from-[#FFFFFF] sm:to-[#ECEFFE] sm:pt-[0px] sm:pb-[100px] lg:py-[100px]">
      <div className="flex w-full max-w-[960px] flex-col">
        <h2 className="text-mobile-28b-emphasis-title sm:text-center">
          <span className="text-on-bg-a-4 sm:text-pc-20sb-body sm:text-on-bg-e-4">
            에이고 기능
          </span>
          {/* Second line */}
          <span className="mt-2 block sm:mt-4">
            에이고{" "}
            <span className="bg-gradient-to-r from-[#7393FF] to-[#1A1FFF] bg-clip-text text-transparent">
              견적 기능
            </span>{" "}
            의 핵심
          </span>
        </h2>
        <div className="mt-[60px] flex flex-row gap-[20px] overflow-x-auto lg:flex-wrap lg:overflow-visible">
          {/* Card 1 (Top-left, 410x358) */}
          <div className="bg-surface-a relative flex h-[358px] w-[300px] flex-shrink-0 flex-col rounded-[16px] px-[32px] py-[28px] sm:h-[340px] sm:w-[360px] sm:bg-white sm:px-[28px] sm:py-[24px] lg:h-[358px] lg:w-[410px] lg:px-[32px] lg:py-[28px]">
            <img
              src="/images/card_image_1.svg"
              className="h-[190px] w-[264px] self-center object-contain transition-transform duration-300 hover:scale-110"
            />
            <p className="text-mobile-20sb-title2 mt-[32px]">
              PDF/이미지/URL 분석
            </p>
            <p className="text-mobile-16sb-body text-on-surface-a-5 mt-[12px] tracking-tight">
              다양한 매체의 자료를 분석하고 <br /> 빠르고 정확한 결과를 도출
            </p>
            <div className="bg-tag-1 absolute top-[5%] right-[10%] rounded-[20px] px-[10px] py-[4px]">
              <p className="text-mobile-15m-btn text-on-tag-1">공통</p>
            </div>
          </div>
          {/* Card 2 (Top-right, 530x358) */}
          <div className="bg-surface-a relative flex h-[358px] w-[300px] flex-shrink-0 flex-col rounded-[16px] px-[32px] py-[28px] sm:h-[340px] sm:w-[380px] sm:bg-white sm:px-[28px] sm:py-[24px] lg:h-[358px] lg:w-[530px] lg:px-[32px] lg:py-[32px]">
            <img
              src="/images/card_image_2.svg"
              className="h-[190px] w-[264px] self-center object-contain transition-transform duration-300 hover:scale-110"
            />
            <p className="text-mobile-20sb-title2 mt-[32px]">
              견적서 공유링크 보안 설정
            </p>
            <p className="text-mobile-16sb-body text-on-surface-a-5 mt-[12px]">
              유효기간, 비밀번호 설정을 통해 <br className="block sm:hidden" />{" "}
              보안 강화 및 혼선 방지
            </p>
            <div className="bg-tag-1 absolute top-[5%] right-[10%] rounded-[20px] px-[10px] py-[4px]">
              <p className="text-mobile-15m-btn text-on-tag-1">직원 PRO</p>
            </div>
          </div>
          {/* Card 3 (Bottom-left, 530x358) */}
          <div className="bg-surface-a relative flex h-[358px] w-[300px] flex-shrink-0 flex-col rounded-[16px] px-[32px] py-[28px] sm:h-[340px] sm:w-[380px] sm:bg-white sm:px-[28px] sm:py-[24px] lg:h-[358px] lg:w-[530px]">
            <img
              src="/images/card_image_3.svg"
              className="h-[190px] w-[264px] self-center object-contain transition-transform duration-300 hover:scale-110"
            />
            <p className="text-mobile-20sb-title2 mt-[32px]">
              PDF 견적서 다운로드 및 공유
            </p>
            <p className="text-mobile-16sb-body text-on-surface-a-5 mt-[12px] tracking-tight">
              별도 변환 없이 즉시 전달 가능한 자료로 의사소통 시간 단축
            </p>
            <div className="bg-tag-1 absolute top-[5%] right-[10%] rounded-[20px] px-[10px] py-[4px]">
              <p className="text-mobile-15m-btn text-on-tag-1">공통</p>
            </div>
          </div>
          {/* Card 4 (Bottom-right, 410x358) */}
          <div className="bg-surface-a relative flex h-[358px] w-[300px] flex-shrink-0 flex-col rounded-[16px] px-[32px] py-[28px] sm:h-[340px] sm:w-[360px] sm:bg-white sm:px-[28px] sm:py-[24px] lg:h-[358px] lg:w-[410px] lg:px-[32px] lg:py-[28px]">
            <img
              src="/images/card_image_4.svg"
              className="h-[190px] w-[264px] self-center object-contain transition-transform duration-300 hover:scale-110"
            />
            <p className="text-mobile-20sb-title2 mt-[32px] hidden tracking-tight sm:block">
              엑셀 견적서 다운로드 및 수정 가능
            </p>
            <p className="text-mobile-20sb-title2 mt-[32px] block tracking-tight sm:hidden">
              엑셀 견적서 다운로드, 수정가능
            </p>
            <p className="text-mobile-16sb-body text-on-surface-a-5 mt-[12px]">
              최신 데이터를 엑셀로 내려받아 <br className="block sm:hidden" />{" "}
              바로 공유 가능
            </p>
            <div className="bg-tag-1 absolute top-[5%] right-[10%] rounded-[20px] px-[10px] py-[4px]">
              <p className="text-mobile-15m-btn text-on-tag-1">직원 PRO</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
