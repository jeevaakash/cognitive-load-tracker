import { useState, useEffect } from 'react';
import { useActivityTracker } from '../hooks/useActivityTracker';
import ScoreDisplay from '../components/ScoreDisplay';
import MetricsGrid from '../components/MetricsGrid';
import LoadChart from '../components/LoadChart';
import Recommendations from '../components/Recommendations';
import Notification from '../components/Notification';

/**
 * Dashboard — Main page showing live cognitive load score, metrics, chart, and suggestions.
 */
export default function Dashboard() {
  const { metrics, loadResult } = useActivityTracker();

  // Build chart history (keep last 30 data points)
  const [chartHistory, setChartHistory] = useState([]);

  useEffect(() => {
    if (!loadResult.timestamp) return;
    const time = new Date(loadResult.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setChartHistory((prev) => {
      const next = [...prev, { time, score: loadResult.score, level: loadResult.level }];
      return next.slice(-30); // keep last 30 points
    });
  }, [loadResult.timestamp]);

  const levelGradient = {
    Low: 'from-green-950/40 to-gray-950',
    Medium: 'from-yellow-950/40 to-gray-950',
    High: 'from-red-950/40 to-gray-950',
  };

  return (
    <>
      <Notification level={loadResult.level} score={loadResult.score} />

      <div className={`min-h-screen bg-gradient-to-b ${levelGradient[loadResult.level] || levelGradient.Low} transition-all duration-1000`}>
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Live Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">
              Tracking your cognitive workload in real-time based on browser activity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column — Score + Recommendations */}
            <div className="flex flex-col gap-6">
              {/* Score card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4">
                <h2 className="text-sm font-medium text-white/50 self-start">Cognitive Load Score</h2>
                <ScoreDisplay score={loadResult.score} level={loadResult.level} />
                <p className="text-xs text-white/30 text-center">
                  Updates every 5 seconds based on your activity
                </p>
              </div>

              {/* Recommendations */}
              <Recommendations recommendations={loadResult.recommendations} level={loadResult.level} />
            </div>

            {/* Right column — Metrics + Chart */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Metrics grid */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-medium text-white/50 mb-4">Real-Time Activity Metrics</h2>
                <MetricsGrid metrics={metrics} />
              </div>

              {/* Chart */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-medium text-white/50 mb-4">Load Score Over Time</h2>
                <LoadChart history={chartHistory} />
                <div className="flex gap-4 mt-3 text-xs text-white/30">
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-green-400 inline-block" /> Low (0–20)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-yellow-400 inline-block" /> Medium (21–50)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-400 inline-block" /> High (51+)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formula info */}
          <div className="mt-6 bg-white/3 border border-white/8 rounded-xl p-4 text-xs text-white/30">
            <span className="font-mono">
              Score = (Tabs × 2) + (Switches/min × 5) + (Typing Interruptions × 3) + (Idle Fluctuations × 2)
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
