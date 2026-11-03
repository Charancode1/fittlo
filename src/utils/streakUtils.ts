import { StreakStats } from '../types';
import { formatLocalDate, parseLocalDate } from './dateUtils';

/**
 * Checks if two date strings are consecutive days (dateB is exactly 1 day after dateA)
 */
function areConsecutiveDays(dateAStr: string, dateBStr: string): boolean {
  const dateA = parseLocalDate(dateAStr);
  const dateB = parseLocalDate(dateBStr);

  const diffTime = dateB.getTime() - dateA.getTime();
  // Accounting for daylight savings: 1 day is approx 24 hours (23-25 hours in ms)
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calculates total workouts, current streak, and longest streak
 */
export function calculateStreakStats(datesList: string[]): StreakStats {
  const validDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const uniqueDates = Array.from(new Set(datesList.filter(d => Boolean(d && validDateRegex.test(d)))));

  if (uniqueDates.length === 0) {
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0
    };
  }

  // Sort ascending
  uniqueDates.sort();

  const datesSet = new Set(uniqueDates);
  const today = new Date();
  const todayStr = formatLocalDate(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate: Date;

  if (datesSet.has(todayStr)) {
    // Today is completed: streak starts from today and counts backwards
    currentStreak = 1;
    checkDate = new Date(today);
    checkDate.setDate(today.getDate() - 1);

    while (datesSet.has(formatLocalDate(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (datesSet.has(yesterdayStr)) {
    // Today is not completed yet, but yesterday was: streak is alive!
    currentStreak = 1;
    checkDate = new Date(yesterday);
    checkDate.setDate(yesterday.getDate() - 1);

    while (datesSet.has(formatLocalDate(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    // Neither today nor yesterday completed: streak is 0
    currentStreak = 0;
  }

  // 2. Calculate Longest Streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    if (areConsecutiveDays(uniqueDates[i - 1], uniqueDates[i])) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Ensure longest streak is at least as large as current streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    totalWorkouts: uniqueDates.length,
    currentStreak,
    longestStreak
  };
}
