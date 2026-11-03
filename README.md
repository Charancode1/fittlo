# Fittlo

> A simple, beautiful, minimal fitness consistency tracker inspired by GitHub's contribution calendar.

![Fittlo Theme](https://img.shields.io/badge/Theme-Deep%20Charcoal%20%26%20Electric%20Orange-ff5722?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20TypeScript%20%2B%20Vite-61dafb?style=flat-square)
![Persistence](https://img.shields.io/badge/Storage-localStorage-ff9100?style=flat-square)

---

## ✨ Features

- **GitHub-Style Workout Heatmap**: 12-month calendar grid (53 weeks) displaying your workout consistency at a glance.
- **Electric Fitness Palette**: Deep charcoal and near-black background accented by energetic electric orange, warm amber, and luminous gold completed workout cells.
- **Single-Click Workout Logging**: Prominent "Mark today's workout" button to log or undo today's workout with immediate visual feedback.
- **Direct Heatmap Interactivity**: Tap any calendar cell to toggle workout completion for that date.
- **Minimal Statistics**:
  - Total workout days
  - Current workout streak (preserved seamlessly when today is pending)
  - Longest workout streak
- **Zero-Friction Persistence**: All workout history is saved instantly to `localStorage` in consistent `YYYY-MM-DD` format.
- **Responsive & Accessible**: Works across desktop and mobile screens with horizontal scrolling, custom tooltips, keyboard navigation, and ARIA labels.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🎨 Color Tokens

- **Background**: Deep Charcoal (`#0b0c10`, `#13151b`)
- **Primary Workout Action**: Electric Orange (`#ff5722` / `#ff7a00`)
- **Completed Cells**: Warm Amber & Gold Spectrum (`#d84315`, `#ff5722`, `#ff8f00`, `#ffb300`)
- **Inactive Cells**: Subtle Slate Gray (`#1a1d27`)
- **Typography**: Crisp Off-White (`#f5f6f8`) and Muted Gray (`#9499a8`)

