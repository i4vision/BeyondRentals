import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

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

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, [value]);

  // Update parent when any part changes
  useEffect(() => {
    if (month && day && year) {
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      onChange(dateString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, day, year]);

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
      <Select value={month} onValueChange={setMonth}>
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
      <Select value={day} onValueChange={setDay}>
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
      <Select value={year} onValueChange={setYear}>
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
