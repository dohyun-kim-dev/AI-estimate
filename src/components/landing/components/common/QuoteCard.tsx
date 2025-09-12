export default function QuoteCard({
  chat_number,
  price,
}: Readonly<{
  chat_number: number;
  price: string;
}>) {
  return (
    <div className="mt-[20px] h-[196px] w-[328px] rounded-[12px] bg-white px-[16px] pt-[16px]">
      <div className="flex flex-row items-center justify-between">
        {chat_number === 1 && (
          <p className="text-mobile-16sb-body text-[#3E3E3E3]">
            중고 시세조회 앱 <br />
            (안드/아이폰)
          </p>
        )}
        {chat_number === 2 && (
          <p className="text-mobile-16sb-body text-[#3E3E3E3]">
            미니 선풍기 A100
          </p>
        )}
        {chat_number === 3 && (
          <p className="text-mobile-16sb-body text-[#3E3E3E3]">3S 20P</p>
        )}
        {chat_number === 4 && (
          <p className="text-mobile-16sb-body text-[#3E3E3E3]">
            포장 자동화 기자재
          </p>
        )}
        <div className="flex flex-row items-center gap-4">
          <img src="/images/share_icon.svg" className="h-[30px] w-[30px]" />
          <img src="/images/download_icon.svg" className="h-[30px] w-[30px]" />
        </div>
      </div>
      <p className="mt-[32px] text-[19px] font-bold text-[#3E3E3E]">
        KRW {price}{" "}
        <span className="text-mobile-14m-subtext font-normal">
          (부가세 별도)
        </span>
      </p>
      <div className="mt-[20px] flex h-[44px] w-full flex-row items-center justify-center gap-[4px]">
        <p className="text-[14px] text-[#949090]">상세견적 보기</p>
        <img
          src="/images/icon_chevron_down.svg"
          className="h-[30px] w-[30px]"
        />
      </div>
    </div>
  );
}
