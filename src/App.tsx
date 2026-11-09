import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { WorkoutActionButton } from './components/WorkoutActionButton';
import { WorkoutHeatmap } from './components/WorkoutHeatmap';
import { Toast } from './components/Toast';
import { ToastMessage } from './types';
import { formatLocalDate, formatFriendlyDate, generateHeatmapGrid } from './utils/dateUtils';
import { calculateStreakStats } from './utils/streakUtils';
import { getStoredWorkouts, setStoredWorkouts } from './utils/storageUtils';

export function App() {
  const [workouts, setWorkouts] = useState<string[]>(() => getStoredWorkouts());
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync with localStorage whenever workouts change
  useEffect(() => {
    setStoredWorkouts(workouts);
  }, [workouts]);

  // Synchronize state across browser tabs in real-time
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'fittlo_workout_history' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item): item is string =>
                typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item)
            );
            setWorkouts(Array.from(new Set(valid)));
          }
        } catch {
          // Ignore parse errors from external sources
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Today reference using user's local calendar
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const todayFormatted = useMemo(() => formatFriendlyDate(todayStr), [todayStr]);

  // Selected date defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const completedDatesSet = useMemo(() => new Set(workouts), [workouts]);
  const isTodayCompleted = completedDatesSet.has(todayStr);

  const stats = useMemo(() => calculateStreakStats(workouts, todayStr), [workouts, todayStr]);

  const calendarData = useMemo(() => {
    return generateHeatmapGrid(completedDatesSet, todayStr);
  }, [completedDatesSet, todayStr]);

  // Show auto-dismissing feedback toast
  const triggerToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setToast({ ...msg, id });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Toggle specific date and sync selection
  const toggleDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);

    setWorkouts(prev => {
      const set = new Set(prev);
      const isCurrentlyCompleted = set.has(dateStr);
      const isToday = dateStr === todayStr;
      const friendlyDate = isToday ? 'Today' : formatFriendlyDate(dateStr);

      if (isCurrentlyCompleted) {
        set.delete(dateStr);
        triggerToast({
          type: 'undo',
          title: 'Workout removed',
          description: `Removed workout for ${friendlyDate}.`
        });
      } else {
        set.add(dateStr);
        triggerToast({
          type: 'success',
          title: isToday ? 'Today’s workout recorded! 🔥' : 'Workout added! 🔥',
          description: `Consistency recorded for ${friendlyDate}.`
        });
      }
      return Array.from(set);
    });
  }, [todayStr, triggerToast]);

  const toggleToday = useCallback(() => {
    setSelectedDate(todayStr);
    toggleDate(todayStr);
  }, [todayStr, toggleDate]);

  return (
    <div className="fittlo-app-shell">
      <div className="fittlo-container">
        {/* Branding & Top Navigation */}
        <Header />

        {/* Main Hero & Primary Action Button */}
        <main className="main-content">
          <WorkoutActionButton
            isTodayCompleted={isTodayCompleted}
            onToggleToday={toggleToday}
            todayFormatted={todayFormatted}
          />

          {/* GitHub-style Heatmap Section */}
          <WorkoutHeatmap
            weeks={calendarData.weeks}
            monthLabels={calendarData.monthLabels}
            todayStr={todayStr}
            selectedDate={selectedDate}
            completedDatesSet={completedDatesSet}
            onSelectDate={setSelectedDate}
            onToggleDate={toggleDate}
          />

          {/* Secondary Stats Section */}
          <StatsCards stats={stats} />
        </main>

        {/* Minimal Footer */}
        <footer className="app-footer">
          <p className="footer-tagline">
            Build unstoppable consistency. One square at a time.
          </p>
        </footer>
      </div>

      {/* Floating feedback notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
