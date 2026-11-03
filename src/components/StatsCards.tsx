import React from 'react';
import { StreakStats } from '../types';

interface StatsCardsProps {
  stats: StreakStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="stats-container" aria-label="Workout Statistics">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Workouts</span>
          <svg
            className="stat-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
          </svg>
        </div>
        <div className="stat-value-row">
          <span className="stat-value">{stats.totalWorkouts}</span>
          <span className="stat-unit">{stats.totalWorkouts === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      <div className="stat-card stat-card-highlight">
        <div className="stat-header">
          <span className="stat-label">Current Streak</span>
          <svg
            className="stat-icon flame-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2c-.67 1.83-2.5 3.5-3.5 5.5-1.5 3-1 6.5 1.5 8.5 1 1 2 1.5 2 3 .5-.5 1-1.5 1-2.5 0-2.5-3-3.5-2-6 .5-1.5 1.8-2.7 2.5-4 1.5 2.5 3.5 4.5 3.5 8 0 4-3.5 6.5-6.5 6.5-4 0-7-3-7-7 0-3 2-6 5.5-8.5.5-.35 1.5-.9 1.5-1.5-.7.1-1.4.3-2 .5z" />
          </svg>
        </div>
        <div className="stat-value-row">
          <span className="stat-value highlight-streak">{stats.currentStreak}</span>
          <span className="stat-unit">{stats.currentStreak === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Longest Streak</span>
          <svg
            className="stat-icon trophy-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
            <path d="M6 4h12v7a6 6 0 0 1-12 0V4z" />
          </svg>
        </div>
        <div className="stat-value-row">
          <span className="stat-value">{stats.longestStreak}</span>
          <span className="stat-unit">{stats.longestStreak === 1 ? 'day' : 'days'}</span>
        </div>
      </div>
    </div>
  );
};

