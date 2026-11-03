export interface WorkoutDay {
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  monthIndex: number;
  dayOfMonth: number;
}

export type HeatmapWeek = (WorkoutDay | null)[];

export interface MonthLabel {
  name: string;
  columnIndex: number;
}

export interface StreakStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'undo' | 'info';
}

