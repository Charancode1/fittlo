import React from 'react';

interface WorkoutActionButtonProps {
  isTodayCompleted: boolean;
  onToggleToday: () => void;
  todayFormatted: string;
}

export const WorkoutActionButton: React.FC<WorkoutActionButtonProps> = ({
  isTodayCompleted,
  onToggleToday,
  todayFormatted
}) => {
  return (
    <div className="action-button-section">
      <button
        type="button"
        onClick={onToggleToday}
        className={`primary-workout-btn ${isTodayCompleted ? 'completed' : 'pending'}`}
        aria-label={
          isTodayCompleted
            ? "Workout marked completed for today. Click to undo."
            : "Mark today's workout as completed"
        }
      >
        <span className="btn-glow" aria-hidden="true" />
        <div className="btn-content">
          <div className="btn-icon-wrapper">
            {isTodayCompleted ? (
              <svg
                className="btn-icon check-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                className="btn-icon bolt-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            )}
          </div>
          <div className="btn-text-group">
            <span className="btn-primary-text">
              {isTodayCompleted ? "Workout Completed" : "Mark today's workout"}
            </span>
            <span className="btn-secondary-text">
              {isTodayCompleted
                ? 'Completed today • Click to undo'
                : `${todayFormatted} • Single click to record`}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

