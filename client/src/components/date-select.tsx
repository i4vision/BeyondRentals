import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";

interface DateSelectProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  testIdPrefix?: string;
}

export default function DateSelect({ value, onChange, placeholder = "Select date", className = "", testIdPrefix = "date" }: DateSelectProps) {
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const isInternalChange = useRef(false);
  const prevValue = useRef<string>("");

  // Parse incoming value and update local state when value changes OR when component mounts with a value
  useEffect(() => {
    console.log('[DateSelect] Effect - value:', value, 'month:', month, 'day:', day, 'year:', year, 'prevValue:', prevValue.current, 'isInternal:', isInternalChange.current);
    
    // Skip if this is from our own onChange call
    if (isInternalChange.current) {
      console.log('[DateSelect] Skipping - internal change');
      isInternalChange.current = false;
      return;
    }

    // Process if: 1) value changed, OR 2) we have a value but local state is empty (e.g., on mount or remount)
    const needsUpdate = value && (value !== prevValue.current || (!month && !day && !year));
    console.log('[DateSelect] needsUpdate:', needsUpdate);
    
    if (needsUpdate) {
      console.log('[DateSelect] Updating from value:', value);
      prevValue.current = value;
      const parts = value.split('-');
      if (parts.length === 3) {
        const parsedYear = parts[0];
        const parsedMonth = parseInt(parts[1], 10).toString();
        const parsedDay = parseInt(parts[2], 10).toString();
        
        console.log('[DateSelect] Setting state - month:', parsedMonth, 'day:', parsedDay, 'year:', parsedYear);
        setYear(parsedYear);
        setMonth(parsedMonth);
        setDay(parsedDay);
      }
    }
  }, [value, month, day, year]);

  // Notify parent when all parts are selected
  useEffect(() => {
    if (month && day && year) {
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      // Only emit if different from current value to avoid loops
      if (dateString !== value) {
        isInternalChange.current = true;
        onChange(dateString);
      }
    }
  }, [month, day, year]);

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
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
