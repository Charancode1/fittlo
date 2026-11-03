import { MonthLabel, WorkoutDay, HeatmapWeek } from '../types';

/**
 * Formats a Date object to YYYY-MM-DD using local time (prevents UTC date shifts)
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD string into a local Date
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns formatted friendly date string (e.g. "Tuesday, November 3, 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Returns short relative or friendly title (e.g. "Today", "Yesterday", "Nov 3")
 */
export function getRelativeDateTitle(dateStr: string): string {
  const todayStr = formatLocalDate(new Date());
  if (dateStr === todayStr) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === formatLocalDate(yesterday)) return 'Yesterday';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === formatLocalDate(tomorrow)) return 'Tomorrow';

  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Generates 53 weeks (approx. 12 months) of calendar data ending at the current week
 */
export function generateHeatmapGrid(completedDates: Set<string>): {
  weeks: HeatmapWeek[];
  monthLabels: MonthLabel[];
  todayStr: string;
} {
  const today = new Date();
  const todayStr = formatLocalDate(today);

  // Find the end date: the upcoming or current Saturday of this week
  const dayOfWeekToday = today.getDay(); // 0 is Sunday, 6 is Saturday
  const endSaturday = new Date(today);
  endSaturday.setDate(today.getDate() + (6 - dayOfWeekToday));
  endSaturday.setHours(0, 0, 0, 0);

  // We want 53 columns total (371 days)
  const totalWeeks = 53;
  const startSunday = new Date(endSaturday);
  startSunday.setDate(endSaturday.getDate() - (totalWeeks * 7 - 1));
  startSunday.setHours(0, 0, 0, 0);

  const weeks: HeatmapWeek[] = [];
  const monthLabels: MonthLabel[] = [];

  let lastMonthPlaced = -1;
  let lastMonthCol = -5;

  const currentIterDate = new Date(startSunday);

  for (let w = 0; w < totalWeeks; w++) {
    const week: (WorkoutDay | null)[] = [];

    for (let d = 0; d < 7; d++) {
      const dateStr = formatLocalDate(currentIterDate);
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const isCompleted = completedDates.has(dateStr);
      const monthIndex = currentIterDate.getMonth();
      const dayOfMonth = currentIterDate.getDate();

      // Check if this is the start of a month or first column where that month appears
      if (
        monthIndex !== lastMonthPlaced &&
        (dayOfMonth <= 7 || w === 0) &&
        w - lastMonthCol >= 3
      ) {
        const monthName = currentIterDate.toLocaleDateString('en-US', { month: 'short' });
        monthLabels.push({
          name: monthName,
          columnIndex: w
        });
        lastMonthPlaced = monthIndex;
        lastMonthCol = w;
      }

      week.push({
        date: dateStr,
        isCompleted,
        isToday,
        isFuture,
        dayOfWeek: d,
        monthIndex,
        dayOfMonth
      });

      // Move to next day
      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }

    weeks.push(week);
  }

  return {
    weeks,
    monthLabels,
    todayStr
  };
}

