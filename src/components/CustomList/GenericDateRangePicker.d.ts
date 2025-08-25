import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { ThemeMode } from "@/styles/theme_colors";
type RangeType = "금월" | "지난달" | "1년" | "지정";
interface GenericDateRangePickerProps {
    initialFromDate: string;
    initialToDate: string;
    onDateChange: (fromDate: string, toDate: string) => void;
    initialSelectedRange?: RangeType;
    themeMode?: ThemeMode;
}
declare const GenericDateRangePicker: React.FC<GenericDateRangePickerProps>;
export default GenericDateRangePicker;
