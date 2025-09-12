export default function InquireCard() {
  return (
    <div className="mt-[20px] flex h-[96px] w-[328px] flex-row items-center justify-between rounded-[12px] bg-white p-[16px]">
      <div className="flex flex-col gap-[4px]">
        <div className="flex flex-row gap-[4px]">
          <img src="images/document_icon.svg" className="h-[24px] w-[24px]" />
          <p className="text-mobile-16sb-body">여기닷에게 상담하기</p>
        </div>
        <p className="text-mobile-14m-subtext text-[#898787]">
          해당 견적이 마음에 든다면, 공급사와
          <br />
          최종 견적 상담을 진행해 보세요
        </p>
      </div>
      <img src="images/icon_chevron_right.svg" className="h-[24px] w-[24px]" />
    </div>
  );
}

//
