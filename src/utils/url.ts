/**
 * Aggressively removes non-URL characters that might be wrapping a string due to server-side corruption.
 * Handles cases like nested quotes, curly braces, and escape characters from the API.
 * 
 * Example: `{\"{\\\"/api/v1/file.png\\\"\"` -> `/api/v1/file.png`
 */
export const cleanUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== "string") return "";
  
  // Clean characters from start and end: 
  // quotes ("), single quotes ('), curly braces ({}), square brackets ([]), backslashes (\), and spaces
  return url.replace(/^[\\"'\{\}\[\]\s]+|[\\"'\{\}\[\]\s]+$/g, "").trim();
};
