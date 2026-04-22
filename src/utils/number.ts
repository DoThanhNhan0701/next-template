export const formatNumberWithCommas = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";

  const strValue = value.toString();
  // Allow digits and dots (stripping out alpha characters)
  const cleanStr = strValue.replace(/[^\d.]/g, "");

  const parts = cleanStr.split(".");
  const integerPart = parts[0];
  // Retain only the first decimal section to avoid "10..05"
  const decimalPart = parts.length > 1 ? "." + parts[1] : "";

  if (!integerPart) {
    if (decimalPart === ".") return "0.";
    return decimalPart;
  }

  // Format with commas using toLocaleString
  const formattedInteger = parseInt(integerPart, 10).toLocaleString("en-US");
  return formattedInteger + decimalPart;
};

export const parseFormattedNumber = (value: string | number): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const cleanStr = value.toString().replace(/[^\d.]/g, "");
  if (!cleanStr) return null;
  const num = parseFloat(cleanStr);
  return isNaN(num) ? null : num;
};
