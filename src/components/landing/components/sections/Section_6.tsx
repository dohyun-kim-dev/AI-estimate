export default function Section_6() {
  return (
    <section className="flex min-h-[690px] w-full flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#ECEFFE] px-[16px] py-[25px] sm:mt-[100px]">
      <div className="flex w-full max-w-[960px] flex-col">
        <h2 className="text-mobile-28b-emphasis-title text-on-bg-e-4 sm:text-pc-20sb-body sm:text-center">
          <span>관리자 전용</span>
          <span className="text-on-bg-a-1 sm:text-pc-32b-emphasis-title mt-2 block sm:mt-4">
            효율적 견적 관리 도우미
          </span>
        </h2>
        <div className="mt-[70px] grid gap-[52px] sm:grid-cols-2 sm:gap-[40px] md:gap-[80px]">
          {/* Item 1 */}
          <div className="flex flex-col gap-[11px]">
            <div className="text-mobile-20sb-title2 sm:text-pc-26sb-title flex flex-row items-center">
              <img
                src="/images/icon_1.svg"
                className="mr-[4px] h-[32px] w-[32px] sm:h-[36px] sm:w-[36px]"
              />
              <p className="bg-gradient-to-r from-[#7393FF] to-[#1A1FFF] bg-clip-text text-transparent">
                대시보드
              </p>
            </div>
            <p className="text-mobile-16sb-body text-on-bg-a-2 sm:text-pc-20sb-body">
              관리자용 대시보드로 한 눈에 각종 트래픽을 추적,{" "}
              <br className="hidden sm:block" /> 비교하기 쉽습니다.
            </p>
          </div>
          {/* Item 2 */}
          <div className="flex flex-col gap-[11px]">
            <div className="text-mobile-20sb-title2 sm:text-pc-26sb-title flex flex-row items-center sm:justify-end">
              <img
                src="/images/icon_2.svg"
                className="mr-[4px] h-[32px] w-[32px] sm:h-[36px] sm:w-[36px]"
              />
              <p className="bg-gradient-to-r from-[#7393FF] to-[#1A1FFF] bg-clip-text text-transparent">
                대화 이력 보기
              </p>
            </div>
            <p className="text-mobile-16sb-body text-on-bg-a-2 sm:text-pc-20sb-body sm:text-end">
              서비스를 끝까지 사용하지 않더라도, 대화이력
              <br className="hidden sm:block" />
              (채팅 및 파일) 모두 확인 가능합니다
            </p>
          </div>
          {/* Item 3 */}
          <div className="flex flex-col gap-[11px]">
            <div className="text-mobile-20sb-title2 sm:text-pc-26sb-title flex flex-row items-center">
              <img
                src="/images/icon_3.svg"
                className="mr-[4px] h-[32px] w-[32px] sm:h-[36px] sm:w-[36px]"
              />
              <p className="bg-gradient-to-r from-[#7393FF] to-[#1A1FFF] bg-clip-text text-transparent">
                견적 다운로드
              </p>
            </div>
            <p className="text-mobile-16sb-body text-on-bg-a-2 sm:text-pc-20sb-body">
              맞춤 견적을 받고, <br className="hidden sm:block" /> PDF 파일로
              견적을 다운로드 할 수 있습니다.
            </p>
          </div>
          {/* Item 4 */}
          <div className="flex flex-col gap-[11px]">
            <div className="text-mobile-20sb-title2 sm:text-pc-26sb-title flex flex-row items-center sm:justify-end">
              <img
                src="/images/icon_4.svg"
                className="mr-[4px] h-[32px] w-[32px] sm:h-[36px] sm:w-[36px]"
              />
              <p className="bg-gradient-to-r from-[#7393FF] to-[#1A1FFF] bg-clip-text text-transparent">
                단가표 관리
              </p>
            </div>
            <p className="text-mobile-16sb-body text-on-bg-a-2 sm:text-pc-20sb-body sm:text-end">
              단가표를 확인하고 내용을 수정할 수 있습니다
            </p>
          </div>
          {/* Item 5 */}
          <div className="flex flex-col gap-[11px] sm:hidden">
            <div className="text-mobile-20sb-title2 sm:text-pc-26sb-title flex flex-row items-center">
              <img
                src="/images/icon_5.svg"
                className="mr-[4px] h-[32px] w-[32px] sm:h-[36px] sm:w-[36px]"
              />
              <p className="bg-gradient-to-r from-[#7393FF] to-[#1A1FFF] bg-clip-text text-transparent">
                견적 문의
              </p>
            </div>
            <p className="text-mobile-16sb-body text-on-bg-a-2 sm:text-pc-20sb-body">
              AI답변을 기반으로 고객 견적에 대한 문의를 빠르게 응대할 수
              있습니다.
            </p>
          </div>
        </div>
        <div className="mt-[80px] hidden flex-col gap-[11px] self-center sm:flex">
          <div className="text-mobile-20sb-title2 sm:text-pc-26sb-title flex flex-row items-center justify-center">
            <img
              src="/images/icon_5.svg"
              className="mr-[4px] h-[32px] w-[32px] sm:h-[36px] sm:w-[36px]"
            />
            <p className="bg-gradient-to-r from-[#7393FF] to-[#1A1FFF] bg-clip-text text-transparent">
              견적 문의
            </p>
          </div>
          <p className="text-mobile-16sb-body text-on-bg-a-2 sm:text-pc-20sb-body">
            AI답변을 기반으로 고객 견적에 대한 문의를 빠르게 응대할 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
