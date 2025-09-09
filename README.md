# TimeIt - Pomodoro Timer

A production-quality Electron + React + TypeScript desktop application for Pomodoro time management.

## Features

### Core Functionality
- **Two-Panel Workspace**: Task management (left) and timer controls (right)
- **Timer Bubbles**: Quick-start sessions (5, 15, 25, 45, 55 minutes)
- **Active Timer**: Visual countdown with pause/resume/stop controls
- **Task Association**: Link timer sessions to specific tasks
- **Session History**: Track today's work and break sessions
- **Cycle Tracker**: Visual progress through 4-session Pomodoro cycles

### Advanced Features
- **System Tray Integration**: Quick controls and status from system tray
- **Mini Timer Window**: Always-on-top compact timer (280×120)
- **Global Shortcuts**: 
  - `Ctrl+Shift+T`: Start/Pause/Resume timer
  - `Ctrl+Shift+M`: Toggle mini timer window
- **Power Management**: Handles system sleep/wake correctly
- **Native Notifications**: OS notifications on session completion
- **Data Persistence**: Local storage with electron-store

### Technical Features
- **Type Safety**: Full TypeScript coverage with no `any` in public APIs
- **Security**: No Node.js APIs in renderer, secure IPC via contextBridge
- **State Management**: Zustand for predictable state updates
- **Modern UI**: Tailwind CSS with dark mode support
- **Reliable Timing**: End-timestamp based (no drift, handles sleep/resume)

## Architecture

```
timeit/
├── packages/shared/src/types.ts    # Shared TypeScript interfaces
├── src/main/                       # Electron main process
│   ├── main.ts                     # Entry point
│   ├── ipc.ts                      # IPC handlers & timer logic
│   ├── store.ts                    # Data persistence
│   ├── windows.ts                  # Window management
│   ├── tray.ts                     # System tray
│   ├── power.ts                    # Power monitoring
│   └── preload.ts                  # Secure IPC bridge
└── src/renderer/                   # React frontend
    ├── state/                      # Zustand stores
    ├── components/                 # React components
    └── routes/                     # Main/Mini window routes
```

## Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run make
```

### Scripts
- `npm start` - Start app in development mode
- `npm run package` - Package app for current platform
- `npm run make` - Build distributables
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Data Model

### Tasks
```typescript
interface Task {
  id: string;
  name: string;
  type?: "project" | "study_group";
  createdAt: number;
  archived?: boolean;
}
```

### Sessions
```typescript
interface Session {
  id: string;
  taskId: string;
  kind: "work" | "break";
  startedAt: number;
  endedAt: number;
  plannedMinutes: number;
}
```

### Timer State
```typescript
interface TimerState {
  activeTaskId: string | null;
  mode: "idle" | "running" | "paused";
  kind: "work" | "break" | null;
  endsAt: number | null;
  remainingMs: number;
  plannedMinutes: number | null;
  completedWorkCount: number;
}
```

## Usage

1. **Create Tasks**: Add tasks in the left panel
2. **Select Active Task**: Click to select your current focus
3. **Start Timer**: Click a time bubble to begin
4. **Track Progress**: Watch the visual countdown and cycle dots
5. **Take Breaks**: Break options appear after work sessions
6. **Review History**: See today's completed sessions

### Keyboard Shortcuts
- `Ctrl+Shift+T` - Toggle timer (start/pause/resume)
- `Ctrl+Shift+M` - Toggle mini timer window

### Tray Menu
- Shows remaining time or "Idle"
- Quick pause/resume/stop actions
- "Start Last" for quick 25-minute sessions
- Toggle mini timer
- Open full app

## Technical Decisions

- **End-timestamp timing**: Avoids drift and handles system sleep
- **Typed IPC**: Full type safety between main and renderer
- **Local-first**: No cloud dependencies, all data stored locally
- **Security-focused**: Disabled nodeIntegration, enabled contextIsolation
- **Performance**: Efficient updates with Zustand selectors

## License

MIT
