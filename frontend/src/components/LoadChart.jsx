import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';

/**
 * LoadChart — Line chart showing cognitive load score over time.
 * @param {Array} history - Array of { time, score, level }
 */
export default function LoadChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm">
        Collecting data… interact with the page to see your load trend.
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const level = payload[0]?.payload?.level;
    const levelColor = level === 'High' ? '#f87171' : level === 'Medium' ? '#facc15' : '#4ade80';
    return (
      <div className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-white/50 mb-1">{label}</p>
        <p className="font-bold" style={{ color: levelColor }}>
          Score: {payload[0].value} — {level}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
        <YAxis domain={[0, 'auto']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        {/* Threshold reference lines */}
        <ReferenceLine y={20} stroke="#4ade80" strokeDasharray="4 4" label={{ value: 'Low', fill: '#4ade80', fontSize: 9, position: 'right' }} />
        <ReferenceLine y={50} stroke="#facc15" strokeDasharray="4 4" label={{ value: 'Med', fill: '#facc15', fontSize: 9, position: 'right' }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#818cf8"
          strokeWidth={2}
          dot={{ r: 3, fill: '#818cf8' }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
