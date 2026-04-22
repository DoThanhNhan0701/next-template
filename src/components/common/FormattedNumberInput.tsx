import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/number";

interface FormattedNumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  value: number | string | null | undefined;
  onChange: (value: number | null) => void;
}

export function FormattedNumberInput({
  value,
  onChange,
  ...props
}: FormattedNumberInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [prevValue, setPrevValue] = useState<
    number | string | null | undefined
  >(undefined);

  if (value !== prevValue) {
    setPrevValue(value);
    const parsedDisplay = parseFormattedNumber(displayValue);
    const numValue =
      typeof value === "number"
        ? value
        : parseFormattedNumber(String(value || ""));

    if (parsedDisplay !== numValue) {
      if (value !== null && value !== undefined && value !== "") {
        setDisplayValue(formatNumberWithCommas(value));
      } else {
        setDisplayValue("");
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatNumberWithCommas(rawVal);
    setDisplayValue(formatted);
    const parsed = parseFormattedNumber(formatted);
    onChange(parsed);
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
}
