require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const activityRoutes = require('./routes/activity');
const sessionRoutes = require('./routes/session');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — allow all origins in dev, restrict to frontend domain in prod
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Routes
app.use('/api/activity', activityRoutes);
app.use('/api/session', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB (optional - app works without it)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.warn('MongoDB not connected (running without DB):', err.message));
}

app.listen(PORT, () => {
  console.log(`Cognitive Load Tracker backend running on port ${PORT}`);
});
