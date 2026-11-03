import React, { useRef, useEffect, useState, useMemo } from 'react';
import { HeatmapWeek, MonthLabel, WorkoutDay } from '../types';
import { formatFriendlyDate, getRelativeDateTitle } from '../utils/dateUtils';

interface WorkoutHeatmapProps {
  weeks: HeatmapWeek[];
  monthLabels: MonthLabel[];
  todayStr: string;
  onToggleDate: (dateStr: string) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  day: WorkoutDay | null;
}

export const WorkoutHeatmap: React.FC<WorkoutHeatmapProps> = ({
  weeks,
  monthLabels,
  todayStr,
  onToggleDate
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    day: null
  });

  // Automatically scroll calendar to the right (most recent weeks/today) on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, []);

  // Compute consistency level (1-4) for each completed day based on weekly consistency
  const weekWorkoutCounts = useMemo(() => {
    return weeks.map(week => {
      return week.reduce((count, day) => {
        return day && day.isCompleted ? count + 1 : count;
      }, 0);
    });
  }, [weeks]);

  const getDayShadeLevel = (day: WorkoutDay, weekIndex: number): number => {
    if (!day.isCompleted) return 0;
    const weeklyCount = weekWorkoutCounts[weekIndex] || 1;
    if (weeklyCount <= 1) return 1; // Subtle warm amber-orange
    if (weeklyCount <= 3) return 2; // Electric energetic orange
    if (weeklyCount <= 5) return 3; // Radiant fiery orange
    return 4; // Luminous warm gold
  };

  const handleMouseEnter = (day: WorkoutDay, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      day
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleCellClick = (day: WorkoutDay) => {
    if (day.isFuture) return;
    onToggleDate(day.date);
    // Update tooltip state if it's currently showing
    setTooltip(prev => (prev.day?.date === day.date ? {
      ...prev,
      day: { ...day, isCompleted: !day.isCompleted }
    } : prev));
  };

  const weekdayLabels = [
    { label: '', index: 0 },   // Sun
    { label: 'Mon', index: 1 },
    { label: '', index: 2 },   // Tue
    { label: 'Wed', index: 3 },
    { label: '', index: 4 },   // Thu
    { label: 'Fri', index: 5 },
    { label: '', index: 6 }    // Sat
  ];

  return (
    <section className="heatmap-card" aria-label="Fitness Activity Heatmap">
      <div className="heatmap-header">
        <div className="heatmap-title-group">
          <h2 className="heatmap-title">Activity Heatmap</h2>
          <span className="heatmap-subtitle">Consistency over the last 12 months</span>
        </div>
        <div className="heatmap-legend" aria-hidden="true">
          <span className="legend-text">Less</span>
          <span className="legend-cell level-0" title="Rest day" />
          <span className="legend-cell level-1" title="1 workout/wk" />
          <span className="legend-cell level-2" title="2-3 workouts/wk" />
          <span className="legend-cell level-3" title="4-5 workouts/wk" />
          <span className="legend-cell level-4" title="6-7 workouts/wk" />
          <span className="legend-text">More</span>
        </div>
      </div>

      <div className="heatmap-scroll-container" ref={scrollContainerRef}>
        <div className="heatmap-inner-wrapper">
          {/* Month labels along the top */}
          <div className="month-labels-row">
            <div className="weekday-spacer" />
            <div className="month-labels-grid">
              {monthLabels.map(m => (
                <span
                  key={`${m.name}-${m.columnIndex}`}
                  className="month-label"
                  style={{ gridColumnStart: m.columnIndex + 1 }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid-with-weekdays">
            {/* Weekday indicators on the left */}
            <div className="weekday-labels-col" aria-hidden="true">
              {weekdayLabels.map((item, idx) => (
                <div key={idx} className="weekday-label-slot">
                  {item.label && <span className="weekday-label">{item.label}</span>}
                </div>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="weeks-container" role="grid" aria-label="Annual workout grid">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="week-column" role="row">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="calendar-cell empty" />;
                    }

                    const level = getDayShadeLevel(day, weekIdx);
                    const isToday = day.date === todayStr;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        role="gridcell"
                        disabled={day.isFuture}
                        className={`calendar-cell level-${level} ${
                          day.isCompleted ? 'completed' : 'inactive'
                        } ${isToday ? 'today-cell' : ''} ${day.isFuture ? 'future-cell' : ''}`}
                        onClick={() => handleCellClick(day)}
                        onMouseEnter={e => handleMouseEnter(day, e)}
                        onMouseLeave={handleMouseLeave}
                        onFocus={e => handleMouseEnter(day, e as unknown as React.MouseEvent<HTMLButtonElement>)}
                        onBlur={handleMouseLeave}
                        aria-label={`${formatFriendlyDate(day.date)}: ${
                          day.isCompleted ? 'Workout completed' : 'No workout'
                        }${isToday ? ' (Today)' : ''}`}
                      >
                        {isToday && <span className="today-indicator-dot" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip.visible && tooltip.day && (
        <div
          className="heatmap-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`
          }}
          role="tooltip"
        >
          <div className="tooltip-date">
            <span className="tooltip-day-badge">
              {getRelativeDateTitle(tooltip.day.date)}
            </span>
            <span className="tooltip-full-date">
              {formatFriendlyDate(tooltip.day.date)}
            </span>
          </div>
          <div className="tooltip-status">
            {tooltip.day.isFuture ? (
              <span className="status-text future">Upcoming day</span>
            ) : tooltip.day.isCompleted ? (
              <span className="status-text completed">
                <span className="status-dot completed-dot" /> Workout recorded 🔥
              </span>
            ) : (
              <span className="status-text rest">
                <span className="status-dot rest-dot" /> No workout logged
              </span>
            )}
          </div>
          {!tooltip.day.isFuture && (
            <div className="tooltip-hint">
              {tooltip.day.isCompleted ? 'Click to undo' : 'Click to mark workout'}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

