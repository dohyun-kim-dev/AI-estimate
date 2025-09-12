export default function GridCard({
  iconUrl,
  label,
  isActive,
  onClick,
}: {
  iconUrl: string;
  label: string[];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex h-[92px] w-[104px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl transition-all duration-200 sm:w-[120px] ${
        isActive ? "bg-white" : ""
      } `}
    >
      <img src={iconUrl} className="h-8 w-8" />
      <p
        className={`text-mobile-15m-btn whitespace-nowrap ${isActive ? "text-on-surface-b-5" : "text-on-surface-a-5"}`}
      >
        {label.map((line, i) => (
          <span key={i} className="block text-center">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

// px-[12px] py-[8px]
