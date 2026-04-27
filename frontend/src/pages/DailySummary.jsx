import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { API_BASE } from '../utils/api';

// ── Helpers (defined before use to avoid reference errors) ───────────────────

function buildHourlyData(sessions) {
  const hourMap = {};
  sessions.forEach((s) =>
    (s.history || []).forEach((h) => {
      const hour = new Date(h.timestamp).getHours();
      const key = `${hour}:00`;
      if (!hourMap[key]) hourMap[key] = { scores: [], hour: key };
      hourMap[key].scores.push(h.score);
    })
  );
  return Object.values(hourMap).map((h) => ({
    hour: h.hour,
    avgScore: Math.round(h.scores.reduce((a, b) => a + b, 0) / h.scores.length),
  }));
}

function getDemoSummary() {
  const now = new Date();
  const history = Array.from({ length: 12 }, (_, i) => {
    const score = Math.floor(Math.random() * 70) + 5;
    return {
      timestamp: new Date(now - i * 5 * 60000).toISOString(),
      score,
      level: score <= 20 ? 'Low' : score <= 50 ? 'Medium' : 'High',
    };
  });
  const scores = history.map((h) => h.score);
  return {
    sessions: [{ history }],
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    maxScore: Math.max(...scores),
    totalEntries: scores.length,
  };
}

function LevelBreakdown({ sessions }) {
  const counts = { Low: 0, Medium: 0, High: 0 };
  sessions.forEach((s) =>
    (s.history || []).forEach((h) => {
      if (h.level in counts) counts[h.level]++;
    })
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  const bars = [
    { label: 'Low', count: counts.Low, color: 'bg-green-400' },
    { label: 'Medium', count: counts.Medium, color: 'bg-yellow-400' },
    { label: 'High', count: counts.High, color: 'bg-red-400' },
  ];

  return (
    <div className="space-y-3">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="text-xs text-white/50 w-14">{b.label}</span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <div
              className={`${b.color} h-2 rounded-full transition-all duration-700`}
              style={{ width: `${(b.count / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/40 w-8 text-right">{b.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * DailySummary — Shows aggregated stats and charts for today's sessions.
 * Falls back to demo data when backend/DB is unavailable.
 */
export default function DailySummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/session/daily`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Backend unavailable, using demo data:', err.message);
        setError(err.message);
        setSummary(getDemoSummary());
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white/40">
        Loading summary…
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white/40">
        No data available.
      </div>
    );
  }

  const statCards = [
    { label: 'Avg Load Score', value: summary.avgScore ?? 0, icon: '📊' },
    { label: 'Peak Score', value: summary.maxScore ?? 0, icon: '📈' },
    { label: 'Data Points', value: summary.totalEntries ?? 0, icon: '🔢' },
  ];

  const hourlyData = buildHourlyData(summary.sessions || []);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Daily Summary</h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          {error && (
            <p className="text-yellow-500/60 text-xs mt-1">
              ⚠ Showing demo data (backend: {error})
            </p>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold text-white tabular-nums">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hourly bar chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-medium text-white/50 mb-4">Hourly Load Distribution</h2>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.avgScore > 50 ? '#f87171' : entry.avgScore > 20 ? '#facc15' : '#4ade80'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/30 text-sm text-center py-8">
              No session data yet for today. Use the dashboard to start tracking.
            </p>
          )}
        </div>

        {/* Level breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white/50 mb-4">Load Level Breakdown</h2>
          <LevelBreakdown sessions={summary.sessions || []} />
        </div>
      </div>
    </div>
  );
}
