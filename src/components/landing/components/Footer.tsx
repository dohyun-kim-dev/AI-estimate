export default function Footer() {
  return (
    <footer className="bg-bg-b mx-auto flex w-full flex-col items-center px-[16px] pt-[20px] pb-[40px] sm:pt-[40px] lg:px-[120px]">
      <div className="flex w-full max-w-[960px] flex-col gap-[40px]">
        <div className="flex flex-row items-center gap-[12px]">
          <img src="/images/footer_logo.svg" />
          <p className="text-mobile-14m-subtext text-bg-b-1">
            글로벌 AI 견적 상담사
          </p>
        </div>
        <div className="text-bg-b-1 text-mobile-12r-tag flex w-full flex-row justify-between">
          <div className="flex flex-col gap-[6px]">
            <p className="block sm:hidden">
              <span>이용약관</span>
              <span className="ml-3 inline">개인정보취급방침</span>
            </p>
            <p>상호명 주식회사 여기닷</p>
            <p>
              <span>대표자명 강태원</span>
              <span className="ml-3">사업자 등록번호 289-86-03278</span>
            </p>
            <p className="tracking-tighter">
              사업장 주소 경기 성남시 수정고 대왕판교로 815, 기업지원허브 777호
            </p>
            <p>통신판매업신고증 2025-성남 수정-0138호</p>
            <p
              className="block sm:hidden"
              onClick={() => (window.location.href = "tel: 031-8039-7981")}
            >
              고객센터 031-8039-7981
            </p>
            <p className="hidden sm:block">고객센터 031-8039-7981</p>
            <p className="mt-[12px]">
              Copyright ⓒ 2025 여기닷 All right reserved.
            </p>
          </div>
          <div className="hidden flex-row sm:block">
            <p>
              <span>이용약관</span>
              <span className="ml-3 inline">개인정보취급방침</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
