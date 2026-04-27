/**
 * Cognitive Load Score Calculator
 *
 * Formula:
 *   Load Score = (App_Count × 2) + (Switches_Per_Min × 5) + (Typing_Interruptions × 3) + (Idle_Fluctuation × 2)
 *
 * Thresholds:
 *   0–20  → Low
 *   21–50 → Medium
 *   51+   → High
 */

/**
 * Calculate cognitive load score from activity metrics.
 * @param {Object} metrics
 * @param {number} metrics.appCount         - Number of open tabs / active apps
 * @param {number} metrics.switchesPerMin   - Tab/context switches per minute
 * @param {number} metrics.typingInterruptions - Number of typing stop-start events
 * @param {number} metrics.idleFluctuation  - Number of idle↔active transitions
 * @returns {{ score: number, level: string, recommendations: string[] }}
 */
function calculateScore(metrics) {
  const { appCount = 0, switchesPerMin = 0, typingInterruptions = 0, idleFluctuation = 0 } = metrics;

  const score =
    appCount * 2 +
    switchesPerMin * 5 +
    typingInterruptions * 3 +
    idleFluctuation * 2;

  const level = getLevel(score);
  const recommendations = getRecommendations(level, metrics);

  return { score: Math.round(score), level, recommendations };
}

/**
 * Map a numeric score to a load level label.
 */
function getLevel(score) {
  if (score <= 20) return 'Low';
  if (score <= 50) return 'Medium';
  return 'High';
}

/**
 * Generate contextual recommendations based on level and metrics.
 */
function getRecommendations(level, metrics) {
  const recs = [];

  if (level === 'Low') {
    recs.push('Great focus! Keep it up.');
    recs.push('You are in a productive flow state.');
  }

  if (level === 'Medium') {
    if (metrics.switchesPerMin > 3) recs.push('Reduce tab switching to improve focus.');
    if (metrics.appCount > 5) recs.push('Close unused tabs to reduce distractions.');
    if (metrics.typingInterruptions > 4) recs.push('Try to focus on one task at a time.');
    if (recs.length === 0) recs.push('Your load is moderate — consider a short break soon.');
  }

  if (level === 'High') {
    recs.push('Take a short break — 5 minutes can reset your focus.');
    recs.push('Close unnecessary tabs and apps.');
    recs.push('Focus on one task at a time.');
    if (metrics.switchesPerMin > 6) recs.push('Stop multitasking — context switching is costly.');
    if (metrics.idleFluctuation > 5) recs.push('Your attention is fragmented. Try a focus timer.');
  }

  return recs;
}

module.exports = { calculateScore, getLevel };
