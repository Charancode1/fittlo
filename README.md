# Fittlo

> A simple, beautiful, minimal fitness consistency tracker inspired by GitHub's contribution calendar.

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Theme](https://img.shields.io/badge/Theme-Obsidian%20%26%20Electric%20Orange-ff5722?style=flat-square)](#)

---

## Overview

**Fittlo** is a personal fitness consistency tracker designed with a single focus: showing your commitment over time without bloated dashboards, complicated routines, or social noise. 

Each day is represented as a square on a 12-month calendar. Mark your workout with a single click, see your streak grow, and build relentless momentum.

---

## Features

- **GitHub-Style Contribution Heatmap**: Complete 12-month calendar grid (53 weeks) displaying your workout consistency at a glance.
- **Binary Workout Semantics**: Uncluttered binary states—rest day (charcoal obsidian) and workout completed (vibrant electric orange).
- **Single-Click Tracking & Undo**: Primary action button toggles today's workout with immediate state transitions and micro-animations.
- **Direct Calendar Interactivity**: Click any past date on the heatmap to log or undo historical workouts.
- **Active Day Inspector**: Pinned footer indicator showing the selected date, workout completion status, and a quick-return shortcut to the current week.
- **Accurate Streak Engine**:
  - **Total Workouts**: Deduplicated tally of active days.
  - **Current Streak**: Seamlessly preserved when today's workout is pending and yesterday was completed.
  - **Longest Streak**: Evaluates contiguous blocks across month, year, and leap-year boundaries.
- **Zero-Friction Persistence**: Automatically syncs with `localStorage` in standardized `YYYY-MM-DD` local time format with cross-tab synchronization.
- **Mobile-First & Accessible**: Touch-expanded hit-boxes, horizontal scroll auto-positioned at today, viewport-clamped tooltips, and full keyboard navigation.

---

## Technology Stack

- **Framework**: React 18
- **Language**: TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: Pure Modern CSS with custom design tokens (Zero runtime CSS overhead)
- **Persistence**: Browser `localStorage` API
- **Fonts**: Plus Jakarta Sans & JetBrains Mono

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fittlo.git

# Navigate to the project directory
cd fittlo

# Install dependencies
npm install
```

### Local Development

```bash
# Start the Vite local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Type-check and compile optimized static assets
npm run build

# Preview the production build locally
npm run preview
```

The production output will be generated in the `dist/` directory.

---

## Deployment Guide

Fittlo is a static Single Page Application (SPA). It can be deployed to any modern static hosting service with zero configuration.

### Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `fittlo` repository.
4. Vercel automatically detects the Vite configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.

*(A `vercel.json` rewrite configuration is pre-configured in this repository).*

### Deploying to Netlify

1. Sign in to [Netlify](https://www.netlify.com/) and click **"Add new site" > "Import an existing project"**.
2. Connect your Git provider and select `fittlo`.
3. Set the build settings:
   - **Base directory**: Leave blank
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **"Deploy site"**.

*(A `netlify.toml` redirect configuration is pre-configured in this repository).*

---

## Architecture & Data Safety

- **Local-Only Storage**: All workout data is stored locally on your device under key `fittlo_workout_history`.
- **No Cloud Tracking**: Zero third-party trackers, zero cookies, zero analytics.
- **Timezone Resilience**: All dates are evaluated at noon local time to prevent Daylight Saving Time shifts and midnight boundary errors.

---

## License

MIT License. Free and open source.
