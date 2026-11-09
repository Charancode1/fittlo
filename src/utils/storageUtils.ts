const STORAGE_KEY = 'fittlo_workout_history';

/**
 * Loads workout dates from localStorage
 */
export function getStoredWorkouts(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Validate string format YYYY-MM-DD
      return Array.from(
        new Set(
          parsed.filter(
            (item): item is string =>
              typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item)
          )
        )
      );
    }
    return [];
  } catch (err) {
    console.error('Failed to load workouts from localStorage:', err);
    return [];
  }
}

/**
 * Saves workout dates to localStorage
 */
export function setStoredWorkouts(dates: string[]): void {
  try {
    const validRegex = /^\d{4}-\d{2}-\d{2}$/;
    const unique = Array.from(
      new Set(
        dates.filter(
          (item): item is string =>
            typeof item === 'string' && validRegex.test(item)
        )
      )
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  } catch (err) {
    console.error('Failed to save workouts to localStorage:', err);
  }
}

