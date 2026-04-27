const express = require('express');
const router = express.Router();

// In-memory store reference (shared via module-level singleton pattern)
const inMemoryStore = new Map();

/**
 * GET /api/session/daily
 * Returns all sessions from today for the daily summary page.
 */
router.get('/daily', async (req, res) => {
  try {
    // Try MongoDB
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Session = require('../models/Session');
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const sessions = await Session.find({ createdAt: { $gte: startOfDay } });
        return res.json(buildDailySummary(sessions.map((s) => s.toObject())));
      }
    } catch (_) {}

    // In-memory fallback — return empty summary
    res.json({ sessions: [], avgScore: 0, maxScore: 0, totalEntries: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/session/all
 * Returns all stored sessions (for history/charts).
 */
router.get('/all', async (req, res) => {
  try {
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Session = require('../models/Session');
        const sessions = await Session.find().sort({ createdAt: -1 }).limit(50);
        return res.json(sessions);
      }
    } catch (_) {}

    res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

function buildDailySummary(sessions) {
  const allHistory = sessions.flatMap((s) => s.history || []);
  const scores = allHistory.map((h) => h.score).filter(Boolean);
  return {
    sessions,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    maxScore: scores.length ? Math.max(...scores) : 0,
    totalEntries: scores.length,
  };
}

module.exports = router;
