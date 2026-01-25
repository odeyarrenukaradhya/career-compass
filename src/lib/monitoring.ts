/**
 * Quiz Monitoring System
 * Tracks violations during quiz attempts (non-video)
 * - Tab switching detection
 * - Window focus/blur tracking
 * - Right-click prevention
 * - Copy/paste prevention
 * - Fast answering detection
 */

import { Violation } from './data';

export interface MonitoringState {
  isActive: boolean;
  violations: Violation[];
  answerTimestamps: number[];
  startTime: number | null;
}

let monitoringState: MonitoringState = {
  isActive: false,
  violations: [],
  answerTimestamps: [],
  startTime: null,
};

let listeners: {
  visibilityChange?: () => void;
  blur?: () => void;
  contextMenu?: (e: Event) => void;
  copy?: (e: Event) => void;
  paste?: (e: Event) => void;
  keydown?: (e: KeyboardEvent) => void;
} = {};

/**
 * Start monitoring for quiz session
 */
export const startMonitoring = (): void => {
  monitoringState = {
    isActive: true,
    violations: [],
    answerTimestamps: [],
    startTime: Date.now(),
  };

  // Tab visibility change detection
  listeners.visibilityChange = () => {
    if (document.hidden && monitoringState.isActive) {
      addViolation('tab-switch', 'User switched to another tab');
    }
  };
  document.addEventListener('visibilitychange', listeners.visibilityChange);

  // Window blur detection
  listeners.blur = () => {
    if (monitoringState.isActive) {
      addViolation('window-blur', 'Window lost focus');
    }
  };
  window.addEventListener('blur', listeners.blur);

  // Right-click prevention
  listeners.contextMenu = (e: Event) => {
    if (monitoringState.isActive) {
      e.preventDefault();
      addViolation('right-click', 'Right-click attempted');
    }
  };
  document.addEventListener('contextmenu', listeners.contextMenu);

  // Copy prevention
  listeners.copy = (e: Event) => {
    if (monitoringState.isActive) {
      e.preventDefault();
      addViolation('copy-paste', 'Copy attempted');
    }
  };
  document.addEventListener('copy', listeners.copy);

  // Paste prevention
  listeners.paste = (e: Event) => {
    if (monitoringState.isActive) {
      e.preventDefault();
      addViolation('copy-paste', 'Paste attempted');
    }
  };
  document.addEventListener('paste', listeners.paste);

  // Keyboard shortcut prevention (Ctrl+C, Ctrl+V, etc.)
  listeners.keydown = (e: KeyboardEvent) => {
    if (monitoringState.isActive && (e.ctrlKey || e.metaKey)) {
      if (['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        addViolation('copy-paste', `Keyboard shortcut Ctrl+${e.key.toUpperCase()} attempted`);
      }
    }
  };
  document.addEventListener('keydown', listeners.keydown);

  console.log('[Monitoring] Started quiz monitoring');
};

/**
 * Stop monitoring and cleanup listeners
 */
export const stopMonitoring = (): Violation[] => {
  monitoringState.isActive = false;

  // Remove all event listeners
  if (listeners.visibilityChange) {
    document.removeEventListener('visibilitychange', listeners.visibilityChange);
  }
  if (listeners.blur) {
    window.removeEventListener('blur', listeners.blur);
  }
  if (listeners.contextMenu) {
    document.removeEventListener('contextmenu', listeners.contextMenu);
  }
  if (listeners.copy) {
    document.removeEventListener('copy', listeners.copy);
  }
  if (listeners.paste) {
    document.removeEventListener('paste', listeners.paste);
  }
  if (listeners.keydown) {
    document.removeEventListener('keydown', listeners.keydown);
  }

  listeners = {};
  console.log('[Monitoring] Stopped quiz monitoring');
  
  return monitoringState.violations;
};

/**
 * Record an answer timestamp for fast-answering detection
 */
export const recordAnswer = (): void => {
  if (!monitoringState.isActive) return;
  
  const now = Date.now();
  monitoringState.answerTimestamps.push(now);
  
  // Check for fast answering (3+ answers in 5 seconds)
  const recentAnswers = monitoringState.answerTimestamps.filter(
    ts => now - ts < 5000
  );
  
  if (recentAnswers.length >= 3) {
    addViolation('fast-answering', `${recentAnswers.length} answers in less than 5 seconds`);
  }
};

/**
 * Add a violation to the monitoring state
 */
const addViolation = (type: Violation['type'], details: string): void => {
  const violation: Violation = {
    type,
    timestamp: new Date().toISOString(),
    details,
  };
  
  // Prevent duplicate violations within 2 seconds
  const recentSameType = monitoringState.violations.filter(
    v => v.type === type && 
    new Date().getTime() - new Date(v.timestamp).getTime() < 2000
  );
  
  if (recentSameType.length === 0) {
    monitoringState.violations.push(violation);
    console.log(`[Monitoring] Violation recorded: ${type} - ${details}`);
  }
};

/**
 * Get current violations
 */
export const getViolations = (): Violation[] => monitoringState.violations;

/**
 * Get monitoring status
 */
export const isMonitoringActive = (): boolean => monitoringState.isActive;

/**
 * Get violation summary
 */
export const getViolationSummary = (violations: Violation[]): Record<string, number> => {
  return violations.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};
