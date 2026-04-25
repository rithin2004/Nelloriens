import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * Formats a UTC timestamp into the user's local timezone.
 * Format: DD MMM YYYY, hh:mm AM/PM
 * 
 * @param {string} utcTimestamp - ISO 8601 UTC string
 * @returns {string} Fully formatted local date string
 */
export const formatToLocalTime = (utcTimestamp) => {
  if (!utcTimestamp) return "N/A";
  
  try {
    const date = parseISO(utcTimestamp);
    // Automatically detect user's system timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = toZonedTime(date, userTimeZone);
    
    return format(zonedDate, "dd MMM yyyy, hh:mm aa");
  } catch (error) {
    console.error("[Timezone Error] Failed to format timestamp:", error);
    return "Invalid Date";
  }
};
