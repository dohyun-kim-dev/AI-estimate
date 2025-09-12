import arrow from "../../../public/images/arrow.svg";

export default function Button({
  children,
  customStyle,
  onClick,
  hasArrow,
}: Readonly<{
  onClick: () => void;
  children: React.ReactNode;
  customStyle?: string;
  hasArrow?: boolean;
}>) {
  return (
    <button
      onClick={onClick}
      className={`${customStyle} flex items-center justify-around hover:cursor-pointer`}
    >
      <span>{children}</span>
      {hasArrow && (
        <img
          src={arrow}
          alt="Arrow SVG"
          width={23}
          height={20}
          className="h-[20px] w-[23.33px]"
        />
      )}
    </button>
  );
}
