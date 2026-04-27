import { useState, useEffect, useRef, useCallback } from 'react';
import { getSessionId } from '../utils/sessionId';

const IDLE_THRESHOLD_MS = 5000;   // 5 seconds of no activity = idle
const REPORT_INTERVAL_MS = 5000;  // Send metrics to backend every 5 seconds

/**
 * useActivityTracker
 *
 * Tracks browser-based behavioral signals:
 *  - Tab visibility changes (Page Visibility API)
 *  - Keystroke activity and interruptions
 *  - Mouse movement
 *  - Idle vs active time
 *  - Simulated "app count" from tab switches + activity frequency
 *
 * Returns live metrics and the latest cognitive load result from the backend.
 */
export function useActivityTracker() {
  const sessionId = getSessionId();

  // Raw counters (reset each reporting window)
  const counters = useRef({
    tabSwitches: 0,
    keystrokes: 0,
    typingInterruptions: 0,
    idleFluctuations: 0,
    windowStart: Date.now(),
  });

  // Typing state
  const typingTimer = useRef(null);
  const wasTyping = useRef(false);

  // Idle state
  const idleTimer = useRef(null);
  const isIdle = useRef(false);

  // Simulated app count (increases with tab switches, capped)
  const appCount = useRef(1);

  // Exposed state
  const [metrics, setMetrics] = useState({
    appCount: 1,
    switchesPerMin: 0,
    typingInterruptions: 0,
    idleFluctuation: 0,
    isIdle: false,
    keystrokesInWindow: 0,
  });

  const [loadResult, setLoadResult] = useState({
    score: 0,
    level: 'Low',
    recommendations: [],
    timestamp: null,
  });

  // ── Activity signal handlers ──────────────────────────────────────────────

  const resetIdleTimer = useCallback(() => {
    if (isIdle.current) {
      // Transitioning from idle → active
      counters.current.idleFluctuations += 1;
      isIdle.current = false;
    }
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!isIdle.current) {
        // Transitioning from active → idle
        counters.current.idleFluctuations += 1;
        isIdle.current = true;
      }
    }, IDLE_THRESHOLD_MS);
  }, []);

  const handleKeydown = useCallback(() => {
    counters.current.keystrokes += 1;
    resetIdleTimer();

    // Detect typing interruption: user stopped typing then resumed
    if (!wasTyping.current) {
      if (counters.current.keystrokes > 1) {
        counters.current.typingInterruptions += 1;
      }
      wasTyping.current = true;
    }

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      wasTyping.current = false;
    }, 1500); // 1.5s pause = typing stopped
  }, [resetIdleTimer]);

  const handleMouseMove = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      counters.current.tabSwitches += 1;
      // Increase simulated app count (max 15)
      appCount.current = Math.min(appCount.current + 1, 15);
    }
    resetIdleTimer();
  }, [resetIdleTimer]);

  // ── Reporting loop ────────────────────────────────────────────────────────

  const sendMetrics = useCallback(async () => {
    const now = Date.now();
    const windowSec = (now - counters.current.windowStart) / 1000;
    const windowMin = windowSec / 60 || 1 / 60; // avoid div-by-zero

    const switchesPerMin = counters.current.tabSwitches / windowMin;
    const payload = {
      sessionId,
      appCount: appCount.current,
      switchesPerMin: parseFloat(switchesPerMin.toFixed(2)),
      typingInterruptions: counters.current.typingInterruptions,
      idleFluctuation: counters.current.idleFluctuations,
    };

    // Update local metrics display
    setMetrics({
      appCount: appCount.current,
      switchesPerMin: parseFloat(switchesPerMin.toFixed(2)),
      typingInterruptions: counters.current.typingInterruptions,
      idleFluctuation: counters.current.idleFluctuations,
      isIdle: isIdle.current,
      keystrokesInWindow: counters.current.keystrokes,
    });

    // Reset window counters
    counters.current = {
      tabSwitches: 0,
      keystrokes: 0,
      typingInterruptions: 0,
      idleFluctuations: 0,
      windowStart: now,
    };

    // Send to backend
    try {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setLoadResult(data);
      }
    } catch (err) {
      // Backend unavailable — calculate locally as fallback
      const score =
        payload.appCount * 2 +
        payload.switchesPerMin * 5 +
        payload.typingInterruptions * 3 +
        payload.idleFluctuation * 2;
      const level = score <= 20 ? 'Low' : score <= 50 ? 'Medium' : 'High';
      setLoadResult({ score: Math.round(score), level, recommendations: [], timestamp: new Date().toISOString() });
    }
  }, [sessionId]);

  // ── Mount / unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(sendMetrics, REPORT_INTERVAL_MS);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      clearTimeout(idleTimer.current);
      clearTimeout(typingTimer.current);
    };
  }, [handleKeydown, handleMouseMove, handleVisibilityChange, sendMetrics]);

  return { metrics, loadResult, sessionId };
}
