export default function Consultant({
  imagePath,
  label,
}: Readonly<{
  imagePath: string;
  label: string;
}>) {
  return (
    <span className="text-mobile-14m-subtext sm:text-pc-16r-subtext text-on-bg-d-1 flex flex-row items-center gap-[4px] sm:gap-[6px]">
      <img
        src={`/images/${imagePath}.webp`}
        className="h-[28px] w-[28px] rounded-full sm:h-[36px] sm:w-[36px]"
      />
      {label}
    </span>
  );
}
