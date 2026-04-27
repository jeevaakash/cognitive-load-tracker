const mongoose = require('mongoose');

/**
 * Session schema — stores a full tracking session with history of load scores.
 */
const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    // Array of score snapshots recorded during the session
    history: [
      {
        timestamp: { type: Date, default: Date.now },
        score: Number,
        level: String,
        metrics: {
          appCount: Number,
          switchesPerMin: Number,
          typingInterruptions: Number,
          idleFluctuation: Number,
        },
      },
    ],
    // Daily summary stats
    summary: {
      avgScore: Number,
      maxScore: Number,
      minScore: Number,
      totalDuration: Number, // seconds
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
