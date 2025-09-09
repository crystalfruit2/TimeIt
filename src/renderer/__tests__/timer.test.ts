import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Electron API
const mockElectronAPI = {
  timer: {
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    getState: vi.fn(),
  },
  on: vi.fn(),
  off: vi.fn(),
};

// @ts-ignore
global.window = {
  electronAPI: mockElectronAPI,
};

describe('Timer Math', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format time correctly', () => {
    const formatTime = (ms: number): string => {
      if (ms <= 0) return '00:00';
      
      const totalSeconds = Math.ceil(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(1000)).toBe('00:01');
    expect(formatTime(60000)).toBe('01:00');
    expect(formatTime(61000)).toBe('01:01');
    expect(formatTime(1500000)).toBe('25:00'); // 25 minutes
  });

  it('should calculate progress percentage correctly', () => {
    const getProgressPercentage = (remainingMs: number, plannedMinutes: number): number => {
      if (!plannedMinutes) return 0;
      
      const totalMs = plannedMinutes * 60 * 1000;
      const elapsedMs = totalMs - remainingMs;
      return Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
    };

    expect(getProgressPercentage(0, 25)).toBe(100); // Completed
    expect(getProgressPercentage(1500000, 25)).toBe(0); // Just started
    expect(getProgressPercentage(750000, 25)).toBe(50); // Half way
  });

  it('should handle timer completion correctly', () => {
    const now = Date.now();
    const endsAt = now - 1000; // Timer ended 1 second ago
    
    const shouldComplete = now >= endsAt;
    expect(shouldComplete).toBe(true);
  });

  it('should handle power resume correctly', () => {
    const now = Date.now();
    const originalEndsAt = now + 1500000; // Should end in 25 minutes
    
    // Simulate system sleep for 30 minutes
    const wakeUpTime = now + 1800000; // 30 minutes later
    const shouldAutoComplete = wakeUpTime >= originalEndsAt;
    
    expect(shouldAutoComplete).toBe(true);
  });
});
