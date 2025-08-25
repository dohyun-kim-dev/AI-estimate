import { ThemeMode } from "@/styles/theme_colors";
type DropdownProps = {
    value: number;
    onChange: (value: number) => void;
    options: number[];
    setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
    themeMode?: ThemeMode;
    triggerIcon?: React.ReactNode | null;
};
declare const DropdownCustom: React.FC<DropdownProps>;
export default DropdownCustom;
