export default function Section_9() {
  return (
    <section className="mb-[25px] flex w-full flex-col items-center px-[16px] py-[25px] sm:py-[80px]">
      {/* <div className="flex w-full max-w-[1200px] flex-col items-center"> */}
      <div className="sm:bg-surface-a flex w-full max-w-[960px] flex-col rounded-[20px] sm:py-[40px]">
        <h2 className="text-mobile-28b-emphasis-title sm:text-pc-32b-emphasis-title sm:self-center sm:text-center">
          <span className="text-on-bg-a-9 sm:text-on-surface-a-5 sm:text-pc-20sb-body">
            추천 대상
          </span>

          <span className="mt-2 block sm:mt-4">
            이런 분들께 <span className="sm:text-on-surface-a-1">추천</span>{" "}
            드립니다
          </span>
        </h2>
        {/* Card 1 - Mobile */}
        <div className="bg-surface-a mt-[60px] flex h-[108px] w-full flex-row items-center gap-[20px] rounded-[12px] px-[12px] py-[16px] sm:hidden">
          <img src="/images/uptrend_icon.svg" className="h-[50px] w-[50px]" />
          <div className="flex flex-col">
            <p className="text-mobile-20sb-title2 text-on-surface-a-7">
              AIGO <span className="text-on-surface-a-1">고객용</span>
            </p>
            <p>
              우리 회사 영업 사정에 따라 <br />
              <span className="font-semibold">매출이 시급 할</span> 때
            </p>
          </div>
        </div>
        {/* Card 2 - Mobile */}
        <div className="bg-surface-a mt-[16px] flex h-[108px] w-full flex-row items-center gap-[20px] rounded-[12px] px-[12px] py-[16px] sm:hidden">
          <img src="/images/lock_icon.svg" className="h-[50px] w-[50px]" />
          <div className="flex flex-col">
            <p className="text-mobile-20sb-title2 text-on-surface-a-7">
              AIGO <span className="text-on-surface-a-1">직원용</span>
            </p>
            <p>
              우리 회사 단가표를 오픈하는게 <br />
              <span className="font-semibold">부담스러울</span> 때
            </p>
          </div>
        </div>
        <p className="text-on-surface-a-7 text-mobile-14m-subtext mt-[60px] block self-center sm:hidden">
          다양한 상황에 맞춰 사용하세요
        </p>
        <div className="mt-[12px] grid grid-cols-2 gap-[12px]">
          {/* 1 - Mobile */}
          <div className="bg-surface-a flex h-[78px] w-full flex-col rounded-[12px] p-[12px] sm:hidden">
            <div className="bg-on-surface-a-2 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-on-surface-a-1 text-lg font-bold">1</span>
            </div>
            <p>
              <span className="font-semibold">외부 고객</span>용
            </p>
          </div>
          {/* 2 - Mobile */}
          <div className="border-line-1 flex h-[78px] w-full flex-col rounded-[12px] border-1 p-[12px] sm:hidden">
            <div className="bg-on-surface-b-1 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-on-surface-b-7 text-lg font-bold">2</span>
            </div>
            <p>
              <span className="font-semibold">내부 직원</span>용
            </p>
          </div>
          {/* 3 - Mobile */}
          <div className="border-line-1 flex h-[104px] w-full flex-col rounded-[12px] border-1 p-[12px] sm:hidden">
            <div className="bg-on-surface-b-1 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-surface-b text-lg font-bold">3</span>
            </div>
            <p>
              <span className="font-semibold">둘 다 </span>
              <br /> 사용하는 경우
            </p>
          </div>
          {/* 4 - Mobile */}
          <div className="bg-surface-a flex h-[104px] w-full flex-col rounded-[12px] p-[12px] sm:hidden">
            <div className="bg-on-surface-a-2 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-on-surface-a-1 text-lg font-bold">4</span>
            </div>
            <p>
              <span className="font-semibold">맞춤 개발이 필요한</span>
              <br /> 기업
            </p>
          </div>
        </div>
        <div className="mt-[80px] hidden flex-row gap-[24px] px-[40px] sm:flex">
          {/* Card 1 - PC */}
          <div className="relative h-[200px] w-full overflow-hidden rounded-[12px] px-[40px] py-[32px]">
            <img
              src="/images/banner_image_1.png"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="text-on-surface-a-2 relative z-10 flex flex-col">
              <p className="text-pc-20sb-body">
                AIGO <span className="text-on-surface-a-8">고객용</span>
              </p>
              <p className="text-pc-16r-subtext">
                우리 회사 영업 사정에 따라 <br />
                매출이 시급할 때
              </p>
            </div>
          </div>
          {/* Card 2 - PC */}
          <div className="relative h-[200px] w-full overflow-hidden rounded-[12px] px-[40px] py-[32px]">
            <img
              src="/images/banner_image_2.png"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="text-on-surface-a-2 relative z-10 flex flex-col">
              <p className="text-pc-20sb-body">
                AIGO <span className="text-on-surface-a-8">직원용</span>
              </p>
              <p className="text-pc-16r-subtext">
                우리 회사 단가표를 오픈하는게 <br /> 부담스러울 때
              </p>
            </div>
          </div>
        </div>
        <div className="mt-[80px] hidden w-full flex-row justify-between px-[40px] sm:flex">
          <p className="text-pc-26sb-title lg:text-pc-26sb-title text-on-surface-a-7">
            다양한 상황에 <br /> 맞춰 사용하세요
          </p>
          {/* 1 */}
          <div className="flex h-[128px] w-[158px] flex-col items-center justify-center rounded-[12px] bg-white sm:h-[96px] sm:w-[118px] lg:h-[128px] lg:w-[158px]">
            <div className="bg-on-surface-b-1 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-surface-b text-lg font-bold">1</span>
            </div>
            <p className="text-pc-20sb-body">외부 고객용</p>
          </div>
          {/* 2 */}
          <div className="flex h-[128px] w-[158px] flex-col items-center justify-center rounded-[12px] bg-white sm:h-[96px] sm:w-[118px] lg:h-[128px] lg:w-[158px]">
            <div className="bg-on-surface-b-1 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-surface-b text-lg font-bold">2</span>
            </div>
            <p className="text-pc-20sb-body">내부 직원용</p>
          </div>
          {/* 3 */}
          <div className="flex h-[128px] w-[158px] flex-col items-center justify-center rounded-[12px] bg-white sm:h-[96px] sm:w-[118px] lg:h-[128px] lg:w-[158px]">
            <div className="bg-on-surface-b-1 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-surface-b text-lg font-bold">3</span>
            </div>
            <p className="text-pc-20sb-body text-center">
              둘 다
              <br />
              사용하는 경우
            </p>
          </div>
          {/* 4 */}
          <div className="flex h-[128px] w-[158px] flex-col items-center justify-center rounded-[12px] bg-white sm:h-[96px] sm:w-[118px] lg:h-[128px] lg:w-[158px]">
            <div className="bg-on-surface-b-1 mb-2 flex h-[24px] w-[24px] items-center justify-center rounded-full">
              <span className="text-surface-b text-lg font-bold">4</span>
            </div>
            <p className="text-pc-20sb-body text-center">
              맞춤 개발이
              <br />
              필요한 기업
            </p>
          </div>
        </div>
      </div>
      {/* </div> */}
    </section>
  );
}
