export default function Section_7() {
  return (
    <section
      id="video"
      className="items-centerpx-[16px] flex w-full flex-col py-[25px] sm:py-[80px] lg:py-[100px]"
    >
      <div className="flex flex-col items-center">
        <p className="text-mobile-14m-subtext sm:text-pc-20sb-body text-on-bg-a-2 sm:text-on-bg-a-3">
          에이고 효과
        </p>
        <h2 className="text-mobile-28b-emphasis-title sm:text-pc-32b-emphasis-title text-on-bg-a-1 mt-[16px]">
          폭발적인 매출 성장
        </h2>
        <img
          src="/images/thumbnail.png"
          className="mt-[20px] h-[200px] w-full object-cover sm:mt-[80px] sm:h-[450px] sm:w-[720px] lg:h-[600px] lg:w-[960px]"
        />
      </div>
    </section>
  );
}
