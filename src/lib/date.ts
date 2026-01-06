import { formatDistanceToNow, isToday, format } from "date-fns";

/**
 * Formats a date to show relative time if same day, otherwise formatted date
 * @param date - Date string or Date object
 * @returns Formatted string like "2 hours ago" or "Jan 15, 2024"
 */
export function formatTaskDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Check if date is today
  if (isToday(dateObj)) {
    const distance = formatDistanceToNow(dateObj, { addSuffix: true });
    // Return relative time like "2 hours ago", "5 minutes ago", etc.
    return distance;
  }
  
  // For dates not today, return formatted date
  return format(dateObj, "MMM d, yyyy");
}

