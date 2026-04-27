/**
 * Recommendations — Displays smart suggestions based on current load level.
 */
export default function Recommendations({ recommendations, level }) {
  if (!recommendations || recommendations.length === 0) return null;

  const iconMap = {
    Low: '✅',
    Medium: '⚠️',
    High: '🔴',
  };

  const colorMap = {
    Low: 'border-green-500/30 bg-green-500/5',
    Medium: 'border-yellow-500/30 bg-yellow-500/5',
    High: 'border-red-500/30 bg-red-500/5',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[level] || colorMap.Low}`}>
      <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
        <span>{iconMap[level]}</span> Smart Suggestions
      </h3>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/80">
            <span className="mt-0.5 text-white/30">›</span>
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
}
