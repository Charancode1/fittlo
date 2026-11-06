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
 * Parses YYYY-MM-DD string into a local Date at noon (12:00:00)
 * Setting to noon prevents DST/midnight timezone shifts from bleeding into adjacent days.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Returns formatted friendly date string (e.g. "Wednesday, November 4, 2026")
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
 * Returns short relative or friendly title (e.g. "Today", "Yesterday", "Nov 4")
 */
export function getRelativeDateTitle(dateStr: string, referenceTodayStr?: string): string {
  const todayStr = referenceTodayStr || formatLocalDate(new Date());
  if (dateStr === todayStr) return 'Today';

  const today = parseLocalDate(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === formatLocalDate(yesterday)) return 'Yesterday';

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
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
export function generateHeatmapGrid(
  completedDates: Set<string>,
  referenceTodayStr?: string
): {
  weeks: HeatmapWeek[];
  monthLabels: MonthLabel[];
  todayStr: string;
} {
  const todayStr = referenceTodayStr || formatLocalDate(new Date());
  const today = parseLocalDate(todayStr);

  // Find the end date: the upcoming or current Saturday of this week
  const dayOfWeekToday = today.getDay(); // 0 is Sunday, 6 is Saturday
  const endSaturday = new Date(today);
  endSaturday.setDate(today.getDate() + (6 - dayOfWeekToday));

  // We want 53 columns total (371 days)
  const totalWeeks = 53;
  const startSunday = new Date(endSaturday);
  startSunday.setDate(endSaturday.getDate() - (totalWeeks * 7 - 1));

  const weeks: HeatmapWeek[] = [];
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

  // Calculate month labels with precise week column alignment
  const rawMonthStarts: MonthLabel[] = [];

  // Check week 0 initial month
  const firstWeek = weeks[0];
  const firstDay = firstWeek[0];
  let firstMonth1Col = -1;
  for (let w = 0; w < totalWeeks; w++) {
    if (weeks[w].some(d => d && d.dayOfMonth === 1)) {
      firstMonth1Col = w;
      break;
    }
  }

  // If the 1st of the next month is 3 or more weeks away, display the starting month
  if (firstDay && firstMonth1Col >= 3) {
    const startMonthDate = parseLocalDate(firstDay.date);
    rawMonthStarts.push({
      name: startMonthDate.toLocaleDateString('en-US', { month: 'short' }),
      columnIndex: 0
    });
  }

  // Locate the exact week column where day 1 of each month occurs
  for (let w = 0; w < totalWeeks; w++) {
    const day1 = weeks[w].find(d => d && d.dayOfMonth === 1);
    if (day1) {
      const d1Date = parseLocalDate(day1.date);
      rawMonthStarts.push({
        name: d1Date.toLocaleDateString('en-US', { month: 'short' }),
        columnIndex: w
      });
    }
  }

  // Filter out any labels that would collide with an earlier label (< 3 cols apart)
  const monthLabels: MonthLabel[] = [];
  for (const item of rawMonthStarts) {
    const last = monthLabels[monthLabels.length - 1];
    if (!last || item.columnIndex - last.columnIndex >= 3) {
      if (item.columnIndex <= 52) {
        monthLabels.push(item);
      }
    }
  }

  return {
    weeks,
    monthLabels,
    todayStr
  };
}
