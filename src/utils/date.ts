/**
 * Formats a date string or Date object into a specified format.
 * 
 * @param date - The date to format (string, Date, null, or undefined)
 * @param formatStr - The format string (default: 'DD/MM/YYYY')
 * @returns The formatted date string, or '-' if the date is invalid
 * 
 * Supported tokens:
 * - DD: Day of month (01-31)
 * - MM: Month (01-12)
 * - YYYY: Full year (e.g. 2024)
 * - HH: Hours (00-23)
 * - mm: Minutes (00-59)
 * - ss: Seconds (00-59)
 */
export const formatDate = (
  date: string | Date | null | undefined,
  formatStr: string = "DD/MM/YYYY"
): string => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const pad = (num: number) => String(num).padStart(2, "0");

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return formatStr
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", String(year))
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * Formats a date to a full date and time string: DD/MM/YYYY HH:mm
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, "DD/MM/YYYY HH:mm");
};

/**
 * Formats a date to ISO string (YYYY-MM-DD) for input fields
 */
export const formatDateToISO = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};
/**
 * Gets the current date in the specified format.
 */
export const getCurrentDate = (formatStr: string = "DD/MM/YYYY"): string => {
  return formatDate(new Date(), formatStr);
};

/**
 * Gets today's date in YYYY-MM-DD format (local time)
 */
export const getTodayISO = (): string => {
  const d = new Date();
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
