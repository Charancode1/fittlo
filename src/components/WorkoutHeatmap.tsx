import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
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
  placement: 'top' | 'bottom';
  day: WorkoutDay | null;
}

export const WorkoutHeatmap: React.FC<WorkoutHeatmapProps> = ({
  weeks,
  monthLabels,
  todayStr,
  onToggleDate
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    placement: 'top',
    day: null
  });

  // Find today's day object for initial inspector state
  const todayDay = useMemo(() => {
    for (const week of weeks) {
      for (const d of week) {
        if (d && d.date === todayStr) return d;
      }
    }
    return null;
  }, [weeks, todayStr]);

  // Set active day to today on mount or when todayDay changes
  useEffect(() => {
    if (todayDay && !activeDay) {
      setActiveDay(todayDay);
    }
  }, [todayDay, activeDay]);

  // Automatically position calendar at the most recent week on mount
  useEffect(() => {
    const scrollToMostRecent = () => {
      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        el.scrollLeft = el.scrollWidth - el.clientWidth;
      }
    };

    // Immediate positioning
    scrollToMostRecent();

    // Secondary pass to guarantee alignment after layout/fonts stabilize
    const rafId = requestAnimationFrame(() => {
      scrollToMostRecent();
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Hide tooltip when the user scrolls the heatmap or window to prevent orphaned popovers
  useEffect(() => {
    const handleScroll = () => {
      setTooltip(prev => (prev.visible ? { ...prev, visible: false } : prev));
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Compute consistency level (1-4) for each completed day based on weekly consistency
  const weekWorkoutCounts = useMemo(() => {
    return weeks.map(week => {
      return week.reduce((count, day) => {
        return day && day.isCompleted ? count + 1 : count;
      }, 0);
    });
  }, [weeks]);

  const getDayShadeLevel = useCallback(
    (day: WorkoutDay, weekIndex: number): number => {
      if (!day.isCompleted) return 0;
      const weeklyCount = weekWorkoutCounts[weekIndex] || 1;
      if (weeklyCount <= 1) return 1; // Rich burnt ember
      if (weeklyCount <= 3) return 2; // Energetic electric orange
      if (weeklyCount <= 5) return 3; // Radiant amber orange
      return 4; // Luminous warm gold
    },
    [weekWorkoutCounts]
  );

  // Position tooltip safely within viewport bounds
  const updateTooltip = (day: WorkoutDay, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const tooltipWidth = 190;
    const tooltipHeight = 85;
    const padding = 12;

    const centerX = rect.left + rect.width / 2;
    // Clamp horizontally so tooltip never clips off left or right screen edges
    const clampedX = Math.max(
      tooltipWidth / 2 + padding,
      Math.min(window.innerWidth - tooltipWidth / 2 - padding, centerX)
    );

    // Place above if there is room; otherwise flip below
    const fitsAbove = rect.top >= tooltipHeight + padding;
    const y = fitsAbove ? rect.top - 8 : rect.bottom + 8;
    const placement = fitsAbove ? 'top' : 'bottom';

    setActiveDay(day);
    setTooltip({
      visible: true,
      x: clampedX,
      y,
      placement,
      day
    });
  };

  const handleCellClick = (day: WorkoutDay, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (day.isFuture) return;
    onToggleDate(day.date);

    const toggledDay: WorkoutDay = {
      ...day,
      isCompleted: !day.isCompleted
    };

    setActiveDay(toggledDay);

    // If target button exists, update tooltip position & content
    if (e && e.currentTarget) {
      updateTooltip(toggledDay, e.currentTarget);
    } else {
      setTooltip(prev =>
        prev.day?.date === day.date
          ? { ...prev, day: toggledDay }
          : prev
      );
    }
  };

  const handleMouseEnter = (day: WorkoutDay, e: React.MouseEvent<HTMLButtonElement>) => {
    updateTooltip(day, e.currentTarget);
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      el.scrollTo({
        left: el.scrollWidth - el.clientWidth,
        behavior: 'smooth'
      });
    }
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
      {/* Header with Title and Legend */}
      <div className="heatmap-header">
        <div className="heatmap-title-group">
          <h2 className="heatmap-title">Activity Heatmap</h2>
          <span className="heatmap-subtitle">Consistency over the last 12 months</span>
        </div>
        <div className="heatmap-legend" aria-hidden="true">
          <span className="legend-text">Rest</span>
          <span className="legend-cell level-0" title="Rest day" />
          <span className="legend-cell level-1" title="1 workout/wk" />
          <span className="legend-cell level-2" title="2-3 workouts/wk" />
          <span className="legend-cell level-3" title="4-5 workouts/wk" />
          <span className="legend-cell level-4" title="6-7 workouts/wk" />
          <span className="legend-text">Peak</span>
        </div>
      </div>

      {/* Horizontally scrollable calendar container */}
      <div className="heatmap-scroll-container" ref={scrollContainerRef}>
        <div className="heatmap-inner-wrapper">
          <div className="heatmap-grid-layout">
            {/* Weekday indicators column */}
            <div className="weekday-labels-col" aria-hidden="true">
              {weekdayLabels.map((item, idx) => (
                <div key={idx} className="weekday-label-slot">
                  {item.label && <span className="weekday-label">{item.label}</span>}
                </div>
              ))}
            </div>

            {/* Main Area: Month labels header + Weeks grid */}
            <div className="heatmap-main-area">
              {/* Month labels row aligned above exact week columns */}
              <div className="month-labels-track" aria-hidden="true">
                {monthLabels.map(m => (
                  <span
                    key={`${m.name}-${m.columnIndex}`}
                    className="month-label"
                    style={{
                      left: `calc(${m.columnIndex} * (var(--cell-size) + var(--cell-gap)))`
                    }}
                  >
                    {m.name}
                  </span>
                ))}
              </div>

              {/* 53-week contribution grid */}
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
                          tabIndex={day.isFuture ? -1 : 0}
                          className={`calendar-cell level-${level} ${
                            day.isCompleted ? 'completed' : 'inactive'
                          } ${isToday ? 'today-cell' : ''} ${day.isFuture ? 'future-cell' : ''}`}
                          onClick={e => handleCellClick(day, e)}
                          onMouseEnter={e => handleMouseEnter(day, e)}
                          onMouseLeave={handleMouseLeave}
                          onFocus={e => handleMouseEnter(day, e as unknown as React.MouseEvent<HTMLButtonElement>)}
                          onBlur={handleMouseLeave}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCellClick(day);
                            }
                          }}
                          aria-label={`${formatFriendlyDate(day.date)}: ${
                            day.isCompleted ? 'Workout completed' : 'No workout'
                          }${isToday ? ' (Today)' : ''}${day.isFuture ? ' (Future)' : ''}`}
                        >
                          {isToday && (
                            <span className="today-beacon" aria-hidden="true">
                              <span className="today-beacon-dot" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar with active day info and jump to today button */}
      <div className="heatmap-footer-bar">
        <div className="active-day-inspector">
          <span
            className={`inspector-indicator ${
              activeDay?.isCompleted ? 'active-completed' : 'active-rest'
            }`}
            aria-hidden="true"
          />
          <div className="inspector-content">
            <span className="inspector-date">
              {activeDay ? getRelativeDateTitle(activeDay.date) : 'Today'}
              {activeDay ? ` • ${formatFriendlyDate(activeDay.date)}` : ''}
            </span>
            <span className="inspector-status">
              {activeDay?.isFuture
                ? 'Upcoming day'
                : activeDay?.isCompleted
                ? 'Workout completed 🔥'
                : 'Rest day / No workout'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="jump-today-btn"
          onClick={scrollToToday}
          title="Scroll to Today"
        >
          <span className="jump-today-dot" aria-hidden="true" />
          <span>Current Week</span>
        </button>
      </div>

      {/* Smart Viewport-Clamped Floating Tooltip */}
      {tooltip.visible && tooltip.day && (
        <div
          className={`heatmap-tooltip ${
            tooltip.placement === 'bottom' ? 'tooltip-bottom' : 'tooltip-top'
          }`}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`
          }}
          role="tooltip"
          aria-hidden="true"
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
