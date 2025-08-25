"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { THEME_COLORS } from "@/styles/theme_colors";
import { ko } from "date-fns/locale";
import { useDevice } from "@/contexts/DeviceContext";
const GenericDateRangePicker = ({ initialFromDate, initialToDate, onDateChange, initialSelectedRange = "금월", themeMode = "light", }) => {
    const device = useDevice();
    const isMobile = device === "mobile";
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [selectedRange, setSelectedRange] = useState(initialSelectedRange);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSelectingFromDate, setIsSelectingFromDate] = useState(true);
    const [calendarDate, setCalendarDate] = useState(dayjs().toDate());
    const [calendarKey, setCalendarKey] = useState(0);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [tempYear, setTempYear] = useState(null);
    const [tempMonth, setTempMonth] = useState(null);
    const datePickerRef = useRef(null);
    const dateBoxRef = useRef(null);
    useEffect(() => {
        setFromDate(initialFromDate);
        setToDate(initialToDate);
    }, [initialFromDate, initialToDate]);
    const handleClickOutside = useCallback((event) => {
        if (datePickerRef.current &&
            !datePickerRef.current.contains(event.target) &&
            dateBoxRef.current &&
            !dateBoxRef.current.contains(event.target)) {
            setShowDatePicker(false);
            setShowYearPicker(false);
            setShowMonthPicker(false);
        }
    }, []);
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);
    const handleRangeClick = (range) => {
        const today = dayjs();
        if (range === "지정") {
            setSelectedRange("지정");
            setShowDatePicker(true);
            setIsSelectingFromDate(true);
            return;
        }
        if (range === "금월") {
            const from = today.startOf("month");
            const newFromDate = from.format("YYYY-MM-DD");
            const newToDate = today.format("YYYY-MM-DD");
            setFromDate(newFromDate);
            setToDate(newToDate);
            setSelectedRange(range);
            onDateChange(newFromDate, newToDate);
            return;
        }
        if (range === "지난달") {
            const from = today.subtract(1, "month").startOf("month");
            const to = today.subtract(1, "month").endOf("month");
            const newFromDate = from.format("YYYY-MM-DD");
            const newToDate = to.format("YYYY-MM-DD");
            setFromDate(newFromDate);
            setToDate(newToDate);
            setSelectedRange(range);
            onDateChange(newFromDate, newToDate);
            return;
        }
        if (range === "1년") {
            const from = today.subtract(1, "year");
            const newFromDate = from.format("YYYY-MM-DD");
            const newToDate = today.format("YYYY-MM-DD");
            setFromDate(newFromDate);
            setToDate(newToDate);
            setSelectedRange(range);
            onDateChange(newFromDate, newToDate);
            return;
        }
    };
    const handleDateBoxClick = () => {
        setShowDatePicker((prev) => {
            const willShow = !prev;
            if (willShow) {
                setIsSelectingFromDate(true);
                setShowYearPicker(false); // 추가
                setShowMonthPicker(false); // 추가
            }
            return willShow;
        });
    };
    const handleDateChange = (date) => {
        const formatted = dayjs(date).format("YYYY-MM-DD");
        if (isSelectingFromDate) {
            setFromDate(formatted);
            setIsSelectingFromDate(false);
        }
        else {
            if (dayjs(formatted).isBefore(dayjs(fromDate))) {
                setFromDate(formatted);
                setToDate(fromDate);
                onDateChange(formatted, fromDate);
            }
            else {
                setToDate(formatted);
                onDateChange(fromDate, formatted);
            }
            setShowDatePicker(false);
        }
    };
    const handleYearConfirm = () => {
        if (tempYear !== null) {
            const updated = dayjs(calendarDate).year(tempYear).toDate();
            setCalendarDate(updated);
            setCalendarKey((prev) => prev + 1);
            setShowYearPicker(false);
        }
    };
    const handleMonthConfirm = () => {
        if (tempMonth !== null) {
            const updated = dayjs(calendarDate).month(tempMonth).toDate();
            setCalendarDate(updated);
            setCalendarKey((prev) => prev + 1);
            setShowMonthPicker(false);
        }
    };
    const renderCustomHeader = ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled, }) => (_jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px",
        }, children: [_jsx("button", { onClick: decreaseMonth, disabled: prevMonthButtonDisabled, style: {
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#000000",
                }, children: "<" }), _jsxs("div", { style: { display: "flex", gap: "12px", alignItems: "center" }, children: [_jsx("button", { onClick: () => setShowYearPicker(true), style: {
                            background: "none",
                            border: "none",
                            fontWeight: "bold",
                            cursor: "pointer",
                            color: "#000000",
                        }, children: dayjs(date).format("YYYY년") }), _jsx("button", { onClick: () => setShowMonthPicker(true), style: {
                            background: "none",
                            border: "none",
                            fontWeight: "bold",
                            cursor: "pointer",
                            color: "#000000",
                        }, children: dayjs(date).format("M월") })] }), _jsx("button", { onClick: increaseMonth, disabled: nextMonthButtonDisabled, style: {
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#000000",
                }, children: ">" })] }));
    const renderYearPicker = () => {
        const currentYear = dayjs().year();
        const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
        return (_jsxs(PickerBox, { children: [_jsx("div", { className: "picker-body", children: years.map((year) => (_jsxs("button", { onClick: () => setTempYear(year), children: [year, "\uB144"] }, year))) }), _jsxs("div", { className: "picker-actions", children: [_jsx("button", { onClick: handleYearConfirm, children: "\uD655\uC778" }), _jsx("button", { onClick: () => setShowYearPicker(false), children: "\uCDE8\uC18C" })] })] }));
    };
    const renderMonthPicker = () => (_jsxs(PickerBox, { children: [_jsx("div", { className: "picker-body", children: Array.from({ length: 12 }, (_, i) => (_jsxs("button", { onClick: () => setTempMonth(i), children: [i + 1, "\uC6D4"] }, i))) }), _jsxs("div", { className: "picker-actions", children: [_jsx("button", { onClick: handleMonthConfirm, children: "\uD655\uC778" }), _jsx("button", { onClick: () => setShowMonthPicker(false), children: "\uCDE8\uC18C" })] })] }));
    return (_jsxs(DateContainer, { "$themeMode": themeMode, "$isMobile": isMobile, children: [_jsxs(DateBox, { ref: dateBoxRef, onClick: handleDateBoxClick, "$themeMode": themeMode, "$isMobile": isMobile, children: [fromDate, " ~ ", toDate, _jsx("img", { src: "/icon_burger.png", alt: "\uB2EC\uB825", width: "10", height: "16", style: { transform: "rotate(270deg)" } })] }), showDatePicker && (_jsx(DatePickerWrapper, { ref: datePickerRef, "$themeMode": themeMode, "$isMobile": isMobile, children: _jsxs("div", { className: isMobile ? 'mobile-panel' : undefined, children: [isMobile && (_jsxs(MobilePanelHeader, { children: [_jsx("span", { children: "\uAE30\uAC04 \uC120\uD0DD" }), _jsx(CloseButton, { type: "button", onClick: () => setShowDatePicker(false), children: "\uB2EB\uAE30" })] })), showYearPicker ? renderYearPicker()
                            : showMonthPicker ? renderMonthPicker()
                                : (_jsx(StyledDatePicker, { selected: isSelectingFromDate ? dayjs(fromDate).toDate() : dayjs(toDate).toDate(), onChange: handleDateChange, dateFormat: "yyyy-MM-dd", inline: true, renderCustomHeader: renderCustomHeader, startDate: dayjs(fromDate).toDate(), endDate: dayjs(toDate).toDate(), openToDate: calendarDate, locale: ko }, calendarKey))] }) })), _jsx(RangeButtonGroup, { "$themeMode": themeMode, "$isMobile": isMobile, children: ["금월", "지난달", "1년", "지정"].map((range) => (_jsx(RangeButton, { selected: selectedRange === range, onClick: () => handleRangeClick(range), "$themeMode": themeMode, "$isMobile": isMobile, children: range }, range))) })] }));
};
export default GenericDateRangePicker;
// 추가 스타일
const PickerBox = styled.div `
  width: 252px; /* ✅ DatePicker 기본 너비에 맞춤 */
  background: white;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;

  .picker-body {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* ✅ 3열 */
    gap: 8px;
    margin-bottom: 8px;
  }

  .picker-body button {
  width: 100%;
  padding: 8px 0;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  text-align: center;
  color: #000;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #d0d0d0;
  }
}


  .picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.picker-actions button {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
}

`;
// --- Styled Components (Keep as they were in the original DateRangePicker) ---
const DateContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  align-items: ${({ $isMobile }) => ($isMobile ? 'stretch' : 'center')};
`;
const DateBox = styled.div `
  padding: ${({ $isMobile }) => ($isMobile ? '14px 16px' : '11px 14px')};
  background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#E0E0E0" : THEME_COLORS.dark.inputBackground)};
  color: ${({ $themeMode }) => ($themeMode === "light" ? "black" : THEME_COLORS.dark.inputText)};
  font-weight: 500;
  border-radius: ${({ $isMobile }) => ($isMobile ? '8px' : '0px')};
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? "#E0E0E0" : THEME_COLORS.dark.borderColor)};
  font-size: ${({ $isMobile }) => ($isMobile ? '16px' : '14px')};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  white-space: nowrap;
  justify-content: space-between;
`;
const RangeButtonGroup = styled.div `
  display: flex;
  justify-content: end;
  gap: ${({ $isMobile }) => ($isMobile ? '8px' : '0')};
  overflow-x: ${({ $isMobile }) => ($isMobile ? 'auto' : 'visible')};
  padding: ${({ $isMobile }) => ($isMobile ? '4px 2px' : '0')};
`;
const RangeButton = styled.button `
  width: ${({ $isMobile }) => ($isMobile ? 'auto' : '60px')};
  padding: ${({ $isMobile }) => ($isMobile ? '10px 14px' : '12px 12px')};
  margin: 0;
  background-color: ${({ selected, $themeMode }) => selected
    ? $themeMode === "light"
        ? "#202055"
        : THEME_COLORS.dark.primary
    : $themeMode === "light"
        ? "#E0E0E0"
        : "#707281"};
  color: ${({ selected, $themeMode }) => selected
    ? $themeMode === "light"
        ? THEME_COLORS.light.buttonText
        : THEME_COLORS.dark.buttonText
    : $themeMode === "light"
        ? THEME_COLORS.light.text
        : "#8c8e96"};
  border: 1px solid ${({ $themeMode }) => ($themeMode === "light" ? "#E6E7E9" : THEME_COLORS.dark.borderColor)};
  border-left: none;
  border-radius: ${({ $isMobile }) => ($isMobile ? '12px' : '0px')};
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;

  &:first-child {
    border-left: 1px solid ${({ $themeMode }) => ($themeMode === "light" ? "#E6E7E9" : THEME_COLORS.dark.borderColor)};
  }
`;
const DatePickerWrapper = styled.div `
  position: ${({ $isMobile }) => ($isMobile ? 'fixed' : 'absolute')};
  top: ${({ $isMobile }) => ($isMobile ? '0' : '100%')};
  left: 0;
  right: ${({ $isMobile }) => ($isMobile ? '0' : 'auto')};
  bottom: ${({ $isMobile }) => ($isMobile ? '0' : 'auto')};
  margin-top: ${({ $isMobile }) => ($isMobile ? '0' : '8px')};
  z-index: 1000;
  display: ${({ $isMobile }) => ($isMobile ? 'flex' : 'block')};
  align-items: ${({ $isMobile }) => ($isMobile ? 'center' : 'initial')};
  justify-content: ${({ $isMobile }) => ($isMobile ? 'center' : 'initial')};
  padding: ${({ $isMobile }) => ($isMobile ? '16px' : '0')};
  background: ${({ $isMobile }) => ($isMobile ? 'rgba(0,0,0,0.4)' : 'transparent')};

  .custom-calendar {
    background-color: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.inputBackground};
    color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.inputText)};
    border: 1px solid
      ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .react-datepicker__day-name,
  .react-datepicker__day,
  .react-datepicker__time-name {
    color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.inputText)};
    width: 2em;
    line-height: 2em;
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.primary : "#666666")};
    color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.buttonText : "#FFFFFF")};
    border-radius: 50%;
  }

  .react-datepicker__day--in-selecting-range {
    background-color: transparent;
    color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.inputText)};
    border-radius: 0;
  }

  .react-datepicker__day--in-range {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#e0e0e0" : "#424451")};
    color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.inputText)};
    border-radius: 0;
  }

  .react-datepicker__day--range-start.react-datepicker__day--range-end,
  .react-datepicker__day--selected.react-datepicker__day--in-selecting-range {
    border-radius: 50%;
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.primary : "#666666")};
    color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.buttonText : "#FFFFFF")};
  }

  .react-datepicker__day--range-start,
  .react-datepicker__day--range-end {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.primary : "#666666")};
    color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.buttonText : "#FFFFFF")};
    border-radius: 50%;
  }

  .react-datepicker__day:hover {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#d0d0d0" : "#555555")};
    border-radius: 50%;
  }

  .react-datepicker__day--today {
    font-weight: bold;
    border: 1px solid ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.accent : "#888888")};
    border-radius: 50%;
  }

  .react-datepicker__day--outside-month {
    color: ${({ $themeMode }) => ($themeMode === "light" ? "#AAAAAA" : "#666666")};
  }

  .react-datepicker__header {
    background-color: ${({ $themeMode }) => $themeMode === "light" ? "#F0F0F0" : THEME_COLORS.dark.tableHeaderBackground};
    border-bottom: 1px solid
      ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  }

  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.tableHeaderText};
  }

  .react-datepicker__navigation-icon::before {
    border-color: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.inputText};
  }

  .mobile-panel {
    width: 100%;
    max-width: 360px;
    border-radius: 12px;
    overflow: hidden;
    background: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.inputBackground};
    border: 1px solid
      ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  }
`;
const MobilePanelHeader = styled.div `
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-weight: 600;
`;
const CloseButton = styled.button `
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;
const StyledDatePicker = styled(DatePicker) ``;
