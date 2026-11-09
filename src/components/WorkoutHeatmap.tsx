import React, { useRef, useEffect, useState } from 'react';
import { HeatmapWeek, MonthLabel, WorkoutDay } from '../types';
import { formatFriendlyDate, getRelativeDateTitle } from '../utils/dateUtils';

interface WorkoutHeatmapProps {
  weeks: HeatmapWeek[];
  monthLabels: MonthLabel[];
  todayStr: string;
  selectedDate: string;
  completedDatesSet: Set<string>;
  onSelectDate: (dateStr: string) => void;
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
  selectedDate,
  completedDatesSet,
  onSelectDate,
  onToggleDate
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [justToggledDate, setJustToggledDate] = useState<string | null>(null);
  const toggleTimeoutRef = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    placement: 'top',
    day: null
  });

  // Clean up any pending feedback animation timeout on unmount
  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current !== null) {
        window.clearTimeout(toggleTimeoutRef.current);
      }
    };
  }, []);

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

    // Secondary frame execution after styles/fonts stabilize
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

  // Position tooltip safely within viewport bounds
  const updateTooltip = (day: WorkoutDay, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const tooltipWidth = 200;
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

    setTooltip({
      visible: true,
      x: clampedX,
      y,
      placement,
      day
    });
  };

  const handleCellClick = (day: WorkoutDay) => {
    if (day.isFuture) return;

    onSelectDate(day.date);
    onToggleDate(day.date);

    // Trigger subtle tactile feedback animation
    if (toggleTimeoutRef.current !== null) {
      window.clearTimeout(toggleTimeoutRef.current);
    }
    setJustToggledDate(day.date);
    toggleTimeoutRef.current = window.setTimeout(() => {
      setJustToggledDate(curr => (curr === day.date ? null : curr));
      toggleTimeoutRef.current = null;
    }, 300);

    // Update tooltip preview if currently visible
    setTooltip(prev =>
      prev.visible && prev.day?.date === day.date
        ? {
            ...prev,
            day: { ...day, isCompleted: !day.isCompleted }
          }
        : prev
    );
  };

  const handleMouseEnter = (day: WorkoutDay, e: React.MouseEvent<HTMLButtonElement>) => {
    updateTooltip(day, e.currentTarget);
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const scrollToToday = () => {
    onSelectDate(todayStr);
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      el.scrollTo({
        left: el.scrollWidth - el.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  // Synchronized status of the currently selected date
  const isSelectedCompleted = completedDatesSet.has(selectedDate);
  const isSelectedToday = selectedDate === todayStr;

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
      {/* Header with Title and Binary Semantics Legend */}
      <div className="heatmap-header">
        <div className="heatmap-title-group">
          <h2 className="heatmap-title">Activity Heatmap</h2>
          <span className="heatmap-subtitle">Consistency over the last 12 months</span>
        </div>
        <div className="heatmap-legend" aria-label="Heatmap Legend">
          <div className="legend-item">
            <span className="legend-swatch inactive" aria-hidden="true" />
            <span className="legend-text">Rest day</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch completed" aria-hidden="true" />
            <span className="legend-text">Workout completed</span>
          </div>
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

                      const isToday = day.date === todayStr;
                      const isSelected = day.date === selectedDate;
                      const isJustToggled = day.date === justToggledDate;

                      return (
                        <button
                          key={day.date}
                          type="button"
                          role="gridcell"
                          disabled={day.isFuture}
                          tabIndex={day.isFuture ? -1 : 0}
                          className={`calendar-cell ${
                            day.isCompleted ? 'completed' : 'inactive'
                          } ${isToday ? 'today-cell' : ''} ${
                            isSelected ? 'selected-cell' : ''
                          } ${isJustToggled ? 'cell-just-toggled' : ''} ${
                            day.isFuture ? 'future-cell' : ''
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            handleCellClick(day);
                          }}
                          onMouseEnter={e => handleMouseEnter(day, e)}
                          onMouseLeave={handleMouseLeave}
                          onFocus={e => handleMouseEnter(day, e as unknown as React.MouseEvent<HTMLButtonElement>)}
                          onBlur={handleMouseLeave}
                          aria-label={`${formatFriendlyDate(day.date)}: ${
                            day.isCompleted ? 'Workout completed' : 'Rest day'
                          }${isToday ? ' (Today)' : ''}${isSelected ? ' (Selected)' : ''}${
                            day.isFuture ? ' (Future)' : ''
                          }`}
                          aria-pressed={day.isCompleted}
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

      {/* Footer bar with synchronized selected day inspector */}
      <div className="heatmap-footer-bar">
        <div className="active-day-inspector" aria-live="polite">
          <span
            className={`inspector-indicator ${
              isSelectedCompleted ? 'active-completed' : 'active-rest'
            }`}
            aria-hidden="true"
          />
          <div className="inspector-content">
            <span className="inspector-date">
              {getRelativeDateTitle(selectedDate, todayStr)} • {formatFriendlyDate(selectedDate)}
            </span>
            <span className="inspector-status">
              {isSelectedCompleted ? 'Workout completed' : 'Rest day / No workout'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`jump-today-btn ${isSelectedToday ? 'is-active-today' : ''}`}
          onClick={scrollToToday}
          title="Select Today and jump to current week"
          aria-label="Select Today and scroll to current week"
        >
          <span className="jump-today-dot" aria-hidden="true" />
          <span>Today</span>
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
          {/* Header row: Historical/Today/Future Tag + Full Date */}
          <div className="tooltip-header-row">
            <span
              className={`tooltip-badge ${
                tooltip.day.date === todayStr
                  ? 'badge-today'
                  : tooltip.day.isFuture
                  ? 'badge-future'
                  : 'badge-history'
              }`}
            >
              {tooltip.day.date === todayStr
                ? 'Today'
                : tooltip.day.isFuture
                ? 'Future'
                : 'Historical'}
            </span>
            <span className="tooltip-full-date">
              {formatFriendlyDate(tooltip.day.date)}
            </span>
          </div>

          {/* Status row: Workout completed / Rest day */}
          <div className="tooltip-status-row">
            {tooltip.day.isFuture ? (
              <span className="status-text future">Upcoming day</span>
            ) : tooltip.day.isCompleted ? (
              <span className="status-text completed">
                <span className="status-indicator-dot completed" /> Workout completed
              </span>
            ) : (
              <span className="status-text rest">
                <span className="status-indicator-dot rest" /> Rest day
              </span>
            )}
          </div>

          {/* Action hint */}
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
