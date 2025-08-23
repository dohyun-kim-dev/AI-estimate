import React, { useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'

interface DateRangePickerProps {
  fromDate: string
  toDate: string
  onChange: (fromDate: string, toDate: string) => void
  quickOptions?: Array<{
    label: string
    days: number
  }>
}

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.surface1};
  outline: none;
  width: 130px;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: ${({ theme }) =>
      theme.body === '#FFFFFF'
        ? 'invert(0)'
        : 'invert(1) brightness(0.8) saturate(0.8)'};
  }
`

const QuickButton = styled.button<{ $isActive?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.primary : theme.surface1};
  color: ${({ theme, $isActive }) => ($isActive ? 'white' : theme.text)};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.primary : theme.surface2};
  }
`

const defaultQuickOptions = [
  { label: '오늘', days: 0 },
  { label: '1주일', days: 7 },
  { label: '1개월', days: 30 },
  { label: '3개월', days: 90 },
  { label: '6개월', days: 180 },
  { label: '1년', days: 365 },
]

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  fromDate,
  toDate,
  onChange,
  quickOptions = defaultQuickOptions,
}) => {
  const [activeOption, setActiveOption] = useState<number | null>(null)

  const handleQuickSelect = (days: number, index: number) => {
    setActiveOption(index)
    const newToDate = dayjs().format('YYYY-MM-DD')
    const newFromDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD')
    onChange(newFromDate, newToDate)
  }

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isFromDate: boolean
  ) => {
    setActiveOption(null)
    const newDate = e.target.value
    if (isFromDate) {
      onChange(newDate, toDate)
    } else {
      onChange(fromDate, newDate)
    }
  }

  return (
    <Container>
      <DateInput
        type="date"
        value={fromDate}
        onChange={(e) => handleDateChange(e, true)}
        max={toDate}
      />
      <span>~</span>
      <DateInput
        type="date"
        value={toDate}
        onChange={(e) => handleDateChange(e, false)}
        min={fromDate}
      />
      {quickOptions.map((option, index) => (
        <QuickButton
          key={option.label}
          onClick={() => handleQuickSelect(option.days, index)}
          $isActive={activeOption === index}
        >
          {option.label}
        </QuickButton>
      ))}
    </Container>
  )
}

export default DateRangePicker
