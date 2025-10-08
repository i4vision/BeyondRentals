import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState, useEffect } from "react";

interface DateSelectProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  testIdPrefix?: string;
}

export default function DateSelect({ value = "", onChange, placeholder = "Select date", className = "", testIdPrefix = "date" }: DateSelectProps) {
  // Parse value from props
  const parsedValue = useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        console.log(`DateSelect[${testIdPrefix}] - Parsed value:`, { month: parseInt(parts[1], 10).toString(), day: parseInt(parts[2], 10).toString(), year: parts[0] });
        return {
          month: parseInt(parts[1], 10).toString(),
          day: parseInt(parts[2], 10).toString(),
          year: parts[0]
        };
      }
    }
    console.log(`DateSelect[${testIdPrefix}] - No valid value to parse, value="${value}"`);
    return null;
  }, [value, testIdPrefix]);

  const [month, setMonth] = useState(parsedValue?.month || "");
  const [day, setDay] = useState(parsedValue?.day || "");
  const [year, setYear] = useState(parsedValue?.year || "");

  console.log(`DateSelect[${testIdPrefix}] - Current state:`, { month, day, year, formValue: value });

  // Sync with form value when it's a complete valid date
  useEffect(() => {
    if (parsedValue) {
      console.log(`DateSelect[${testIdPrefix}] - Syncing state with parsed value:`, parsedValue);
      setMonth(parsedValue.month);
      setDay(parsedValue.day);
      setYear(parsedValue.year);
    }
  }, [parsedValue, testIdPrefix]);

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    // Only save to form when all parts are selected
    if (newMonth && day && year) {
      onChange(`${year}-${newMonth.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    // Only save to form when all parts are selected
    if (month && newDay && year) {
      onChange(`${year}-${month.padStart(2, '0')}-${newDay.padStart(2, '0')}`);
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    // Only save to form when all parts are selected
    if (month && day && newYear) {
      onChange(`${newYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
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
