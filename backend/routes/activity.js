const express = require('express');
const router = express.Router();
const { calculateScore } = require('../utils/scoreCalculator');

// In-memory store for sessions when MongoDB is not available
const inMemoryStore = new Map();

/**
 * POST /api/activity
 * Receive activity metrics, calculate score, return result + recommendations.
 *
 * Body: { sessionId, appCount, switchesPerMin, typingInterruptions, idleFluctuation }
 */
router.post('/', async (req, res) => {
  try {
    const { sessionId, appCount, switchesPerMin, typingInterruptions, idleFluctuation } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const metrics = { appCount, switchesPerMin, typingInterruptions, idleFluctuation };
    const result = calculateScore(metrics);

    const snapshot = {
      timestamp: new Date().toISOString(),
      score: result.score,
      level: result.level,
      metrics,
    };

    // Persist to in-memory store
    if (!inMemoryStore.has(sessionId)) {
      inMemoryStore.set(sessionId, { sessionId, startTime: new Date(), history: [] });
    }
    inMemoryStore.get(sessionId).history.push(snapshot);

    // Optionally persist to MongoDB if available
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Session = require('../models/Session');
        await Session.findOneAndUpdate(
          { sessionId },
          { $push: { history: snapshot }, $setOnInsert: { startTime: new Date() } },
          { upsert: true, new: true }
        );
      }
    } catch (_) {
      // MongoDB not available — continue with in-memory
    }

    res.json({ ...result, timestamp: snapshot.timestamp });
  } catch (err) {
    console.error('Error processing activity:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/activity/:sessionId
 * Retrieve history for a session.
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Try MongoDB first
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Session = require('../models/Session');
        const session = await Session.findOne({ sessionId });
        if (session) return res.json(session);
      }
    } catch (_) {}

    // Fall back to in-memory
    const session = inMemoryStore.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
