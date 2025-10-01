"use client";
 
import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { THEME_COLORS, ThemeMode } from "../../styles/theme_colors";
 import { devLog } from '@/utils/devLogger'

type DefaultRangeType = "금월" | "지난달" | "1년" | "지정";
type CustomRangeType = "3개월" | "6개월" | "1년" | "2년" | "지정";
type RangeType = DefaultRangeType | CustomRangeType;
 
interface GenericDateRangePickerProps {
  initialFromDate: string;
  initialToDate: string;
  onDateChange: (fromDate: string, toDate: string) => void;
  initialSelectedRange?: RangeType;
  themeMode?: ThemeMode;
  rangeOptions?: RangeType[];
  hasUrlParams?: boolean; // URL 파라미터 존재 여부를 확인하는 prop 추가
}
 
const GenericDateRangePicker: React.FC<GenericDateRangePickerProps> = ({
  initialFromDate,
  initialToDate,
  onDateChange,
  themeMode = "dark",
  rangeOptions = ["금월", "지난달", "1년", "지정"],
  hasUrlParams = false, // 기본값 false
}) => {
  const getDateFromRange = (range: RangeType): { fromDate: string; toDate: string } => {
    const today = dayjs();
    switch (range) {
      case "금월":
        return {
          fromDate: today.startOf("month").format("YYYY-MM-DD"),
          toDate: today.format("YYYY-MM-DD"),
        };
      case "지난달":
        return {
          fromDate: today.subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
          toDate: today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
        };
      case "3개월":
        return {
          fromDate: today.subtract(3, "month").format("YYYY-MM-DD"),
          toDate: today.format("YYYY-MM-DD"),
        };
      case "6개월":
        return {
          fromDate: today.subtract(6, "month").format("YYYY-MM-DD"),
          toDate: today.format("YYYY-MM-DD"),
        };
      case "1년":
        return {
          fromDate: today.subtract(1, "year").format("YYYY-MM-DD"),
          toDate: today.format("YYYY-MM-DD"),
        };
      case "2년":
        return {
          fromDate: today.subtract(2, "year").format("YYYY-MM-DD"),
          toDate: today.format("YYYY-MM-DD"),
        };
      default: // "지정" 및 기타
        return {
          fromDate: initialFromDate || today.format("YYYY-MM-DD"),
          toDate: initialToDate || today.format("YYYY-MM-DD"),
        };
    }
  };
 
  // selectedRange의 초기값을 URL 파라미터 존재 여부에 따라 결정
  const [selectedRange, setSelectedRange] = useState<RangeType>(
    hasUrlParams ? "지정" : rangeOptions[0]
  );
 
  const [fromDate, setFromDate] = useState<string>(() => {
    if (hasUrlParams) {
      return initialFromDate;
    }
    return initialFromDate || getDateFromRange(rangeOptions[0]).fromDate;
  });
 
  const [toDate, setToDate] = useState<string>(() => {
    if (hasUrlParams) {
      return initialToDate;
    }
    return initialToDate || getDateFromRange(rangeOptions[0]).toDate;
  });
 
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSelectingFromDate, setIsSelectingFromDate] = useState(true);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null); // 첫 번째 선택된 날짜
  const [calendarDate, setCalendarDate] = useState(() => {
    return dayjs(fromDate).toDate();
  });
 
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateBoxRef = useRef<HTMLDivElement>(null);
 
  // 컴포넌트 마운트 시 초기 날짜 설정
  useEffect(() => {
    if (hasUrlParams) {
      // URL 파라미터가 있는 경우 초기 날짜 그대로 사용
      setFromDate(initialFromDate);
      setToDate(initialToDate);
    } else {
      // URL 파라미터가 없는 경우 첫 번째 rangeOption에 해당하는 날짜 계산
      const initialDates = getDateFromRange(rangeOptions[0]);
      setFromDate(initialDates.fromDate);
      setToDate(initialDates.toDate);
      // GenericListUI와 날짜가 동기화되어 있으므로 onDateChange 호출
      onDateChange(initialDates.fromDate, initialDates.toDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  // 외부 클릭 핸들러
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target as Node) &&
      dateBoxRef.current &&
      !dateBoxRef.current.contains(event.target as Node)
    ) {
      // 시작 날짜만 선택된 상태에서 외부 클릭 시에는 달력을 닫지 않고 상태만 초기화
      if (!isSelectingFromDate && selectedStartDate) {
        setSelectedStartDate(null);
        setIsSelectingFromDate(true);
        return; // 달력을 닫지 않음
      }
      setShowDatePicker(false);
    }
  }, [isSelectingFromDate, selectedStartDate]);
 
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);
 
  // 날짜 범위 버튼 클릭 핸들러 (부모에게 알림 추가)
  const handleRangeClick = (range: RangeType) => {
    if (range === "지정") {
      setSelectedRange("지정");
      setShowDatePicker(true); // 달력 바로 표시
      setIsSelectingFromDate(true);
      setSelectedStartDate(null); // 선택 상태 초기화
      // 달력이 열릴 때 항상 현재 fromDate 기준으로 설정
      setCalendarDate(dayjs(fromDate).toDate());
      return;
    }
 
    const { fromDate: newFromDate, toDate: newToDate } = getDateFromRange(range);
    setFromDate(newFromDate);
    setToDate(newToDate);
    setSelectedRange(range);
    setShowDatePicker(false);
    setSelectedStartDate(null); // 선택 상태 초기화
    // 부모 컴포넌트에 변경된 날짜 알림
    onDateChange(newFromDate, newToDate);
  };
 
  // 날짜 선택 박스 클릭 핸들러
  const handleDateBoxClick = () => {
    setShowDatePicker((prev) => !prev);
    setIsSelectingFromDate(true); // 항상 시작 날짜부터 선택
    setSelectedStartDate(null); // 선택 상태 초기화
    // 달력이 열릴 때 항상 현재 fromDate 기준으로 설정
    setCalendarDate(dayjs(fromDate).toDate());
  };
 
  // 달력에서 날짜 선택 핸들러
  const handleDateChange = (date: Date) => {
    const formatted = dayjs(date).format("YYYY-MM-DD");
    
    devLog('날짜 클릭:', formatted, 'isSelectingFromDate:', isSelectingFromDate, 'selectedStartDate:', selectedStartDate);
 
    if (isSelectingFromDate) {
      // 첫 번째 클릭: 시작 날짜 설정
      devLog('시작 날짜 설정:', formatted);
      setSelectedStartDate(formatted);
      setIsSelectingFromDate(false);
    } else {
      // 두 번째 클릭: 종료 날짜 설정
      devLog('종료 날짜 설정:', formatted, '시작 날짜:', selectedStartDate);
      let finalFromDate = selectedStartDate!;
      let finalToDate = formatted;
 
      // 종료일이 시작일보다 이전이면 날짜를 교체
      if (dayjs(formatted).isBefore(dayjs(selectedStartDate!))) {
        finalFromDate = formatted;
        finalToDate = selectedStartDate!;
      }
 
      devLog('최종 날짜 범위:', finalFromDate, '~', finalToDate);
 
      // 날짜 범위 설정 및 달력 닫기
      setFromDate(finalFromDate);
      setToDate(finalToDate);
      setSelectedRange("지정");
      setSelectedStartDate(null);
      setIsSelectingFromDate(true);
      setShowDatePicker(false);
      onDateChange(finalFromDate, finalToDate);
    }
  };
 
  // 년/월 선택 관련 상태 및 핸들러 (기존 유지)
  const [calendarKey, setCalendarKey] = useState(0);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tempYear, setTempYear] = useState<number | null>(null);
  const [tempMonth, setTempMonth] = useState<number | null>(null);
 
  const handleYearConfirm = () => {
    if (tempYear !== null) {
      const updated = dayjs(calendarDate).year(tempYear).toDate();
      setCalendarDate(updated);
      setCalendarKey((prev) => prev + 1);
      setShowYearPicker(false);
      setTempYear(null); // 확인 후 tempYear 초기화
    }
  };
 
  const handleMonthConfirm = () => {
    if (tempMonth !== null) {
      const updated = dayjs(calendarDate).month(tempMonth).toDate();
      setCalendarDate(updated);
      setCalendarKey((prev) => prev + 1);
      setShowMonthPicker(false);
      setTempMonth(null); // 확인 후 tempMonth 초기화
    }
  };
 
  const renderCustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    prevMonthButtonDisabled: boolean;
    nextMonthButtonDisabled: boolean;
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px",
      }}>
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        style={{
          background: "none",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          color: "#000000",
        }}>
        {"<"}
      </button>
 
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          onClick={() => {
            setShowYearPicker(true);
            setTempYear(dayjs(calendarDate).year()); // 현재 달력 년도로 초기화
          }}
          style={{
            background: "none",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#000000",
          }}>
          {dayjs(date).format("YYYY년")}
        </button>
        <button
          onClick={() => {
            setShowMonthPicker(true);
            setTempMonth(dayjs(calendarDate).month()); // 현재 달력 월로 초기화
          }}
          style={{
            background: "none",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#000000",
          }}>
          {dayjs(date).format("M월")}
        </button>
      </div>
 
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        style={{
          background: "none",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          color: "#000000",
        }}>
        {">"}
      </button>
    </div>
  );
 
  const renderYearPicker = () => {
    const currentYear = dayjs().year();
    const selectedYear = tempYear !== null ? tempYear : dayjs(calendarDate).year(); // tempYear가 있으면 우선 사용
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
    return (
      <PickerBox>
        <div className="picker-body">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setTempYear(year)}
              className={selectedYear === year ? 'selected' : ''}
            >
              {year}년
            </button>
          ))}
        </div>
        <div className="picker-actions">
          <button onClick={handleYearConfirm}>확인</button>
          <button onClick={() => {
            setShowYearPicker(false);
            setTempYear(null); // 취소 시 tempYear 초기화
          }}>취소</button>
        </div>
      </PickerBox>
    );
  };
 
  const renderMonthPicker = () => {
    const selectedMonth = tempMonth !== null ? tempMonth : dayjs(calendarDate).month(); // tempMonth가 있으면 우선 사용
    return (
      <PickerBox>
        <div className="picker-body">
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              onClick={() => setTempMonth(i)}
              className={selectedMonth === i ? 'selected' : ''}
            >
              {i + 1}월
            </button>
          ))}
        </div>
        <div className="picker-actions">
          <button onClick={handleMonthConfirm}>확인</button>
          <button onClick={() => {
            setShowMonthPicker(false);
            setTempMonth(null); // 취소 시 tempMonth 초기화
          }}>취소</button>
        </div>
      </PickerBox>
    );
  };
 
  return (
    <DateContainer $themeMode={themeMode}>
      <DateBox ref={dateBoxRef} onClick={handleDateBoxClick} $themeMode={themeMode}>
        {fromDate} ~ {toDate}
        <img src="/icon_burger.png" alt="달력" width="10" height="16" style={{ transform: "rotate(270deg)" }} />
      </DateBox>
      {showDatePicker && (
        <DatePickerWrapper ref={datePickerRef} $themeMode={themeMode}>
          {showYearPicker ? (
            renderYearPicker()
          ) : showMonthPicker ? (
            renderMonthPicker()
          ) : (
            <StyledDatePicker
              key={calendarKey}
              selected={selectedStartDate ? dayjs(selectedStartDate).toDate() : null}
              onChange={handleDateChange}
              onSelect={handleDateChange} // onSelect도 추가하여 같은 날짜 클릭 감지
              dateFormat="yyyy-MM-dd"
              inline
              renderCustomHeader={renderCustomHeader}
              startDate={selectedStartDate ? dayjs(selectedStartDate).toDate() : null}
              endDate={null}
              selectsRange={false}
              openToDate={calendarDate}
              locale={ko} // ✅ 요일 한글화
            />
          )}
        </DatePickerWrapper>
      )}
      <RangeButtonGroup $themeMode={themeMode}>
        {rangeOptions.map((range) => (
          <RangeButton key={range} selected={selectedRange === range} onClick={() => handleRangeClick(range)}>
            {range}
          </RangeButton>
        ))}
      </RangeButtonGroup>
    </DateContainer>
  );
};
 
export default GenericDateRangePicker;
 
// 추가 스타일
const PickerBox = styled.div`
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
 
    &.selected {
      background: #214a72;
      color: white;
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
const DateContainer = styled.div<{ $themeMode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;
 
const DateBox = styled.div<{ $themeMode: ThemeMode }>`
  padding: 11px 14px;
  background-color: #dfdfe0;
  color: #1f1f1f;
  font-weight: 500;
  border-radius: 0px;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? "#E0E0E0" /* 배경색과 동일하게 */ : THEME_COLORS.dark.borderColor)};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  white-space: nowrap;
`;
 
const RangeButtonGroup = styled.div<{ $themeMode: ThemeMode }>`
  display: flex;
`;
 
const RangeButton = styled.button<{ selected: boolean }>`
  width: 60px;
  padding: 12px;
  margin: 0;
  background-color: ${({ selected }) => (selected ? "#214a72" : "#e1e1e4")};
  color: ${({ selected }) => (selected ? "#ffffff" : "#686868")};
  border: none;
  border-radius: 0;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
`;
 
const DatePickerWrapper = styled.div<{ $themeMode: ThemeMode }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  z-index: 1000;
 
  .custom-calendar {
    background-color: ${({ $themeMode }) =>
      $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.inputBackground};
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
    background-color: ${({ $themeMode }) =>
      $themeMode === "light" ? "#F0F0F0" : THEME_COLORS.dark.tableHeaderBackground};
    border-bottom: 1px solid
      ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  }
 
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: ${({ $themeMode }) =>
      $themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.tableHeaderText};
  }
 
  .react-datepicker__navigation-icon::before {
    border-color: ${({ $themeMode }) =>
      $themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.inputText};
  }
`;
 
const StyledDatePicker = styled(DatePicker as any)``;