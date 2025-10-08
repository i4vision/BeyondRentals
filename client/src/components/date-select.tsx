import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useRef, useEffect } from "react";

interface DateSelectProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  testIdPrefix?: string;
}

// Global state to persist partial selections across remounts
const partialDates: Record<string, { month: string; day: string; year: string }> = {};

export default function DateSelect({ value = "", onChange, placeholder = "Select date", className = "", testIdPrefix = "date" }: DateSelectProps) {
  const stateKey = testIdPrefix || "default";
  
  // Parse value from props
  const parsedValue = useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        return {
          month: parseInt(parts[1], 10).toString(),
          day: parseInt(parts[2], 10).toString(),
          year: parts[0]
        };
      }
    }
    return null;
  }, [value]);

  // Initialize or restore from global state
  if (!partialDates[stateKey]) {
    partialDates[stateKey] = parsedValue || { month: "", day: "", year: "" };
  }

  const currentState = partialDates[stateKey];
  const month = parsedValue?.month || currentState.month;
  const day = parsedValue?.day || currentState.day;
  const year = parsedValue?.year || currentState.year;

  // Sync global state when form value changes
  useEffect(() => {
    if (parsedValue) {
      partialDates[stateKey] = parsedValue;
    }
  }, [parsedValue, stateKey]);

  const handleMonthChange = (newMonth: string) => {
    partialDates[stateKey].month = newMonth;
    // Only save to form when all parts are selected
    if (newMonth && partialDates[stateKey].day && partialDates[stateKey].year) {
      onChange(`${partialDates[stateKey].year}-${newMonth.padStart(2, '0')}-${partialDates[stateKey].day.padStart(2, '0')}`);
    }
  };

  const handleDayChange = (newDay: string) => {
    partialDates[stateKey].day = newDay;
    // Only save to form when all parts are selected
    if (partialDates[stateKey].month && newDay && partialDates[stateKey].year) {
      onChange(`${partialDates[stateKey].year}-${partialDates[stateKey].month.padStart(2, '0')}-${newDay.padStart(2, '0')}`);
    }
  };

  const handleYearChange = (newYear: string) => {
    partialDates[stateKey].year = newYear;
    // Only save to form when all parts are selected
    if (partialDates[stateKey].month && partialDates[stateKey].day && newYear) {
      onChange(`${newYear}-${partialDates[stateKey].month.padStart(2, '0')}-${partialDates[stateKey].day.padStart(2, '0')}`);
    }
  };

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => (currentYear - i).toString());

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Select value={month} onValueChange={handleMonthChange}>
        <SelectTrigger className="flex-1" data-testid={`${testIdPrefix}-month`}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-gray-400">/</span>
      <Select value={day} onValueChange={handleDayChange}>
        <SelectTrigger className="flex-1" data-testid={`${testIdPrefix}-day`}>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-gray-400">/</span>
      <Select value={year} onValueChange={handleYearChange}>
        <SelectTrigger className="flex-1" data-testid={`${testIdPrefix}-year`}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
