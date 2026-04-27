/**
 * ScoreDisplay — Large cognitive load score with animated ring and level badge.
 */
export default function ScoreDisplay({ score, level }) {
  const colorMap = {
    Low: { ring: 'stroke-green-400', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400 border-green-500/40' },
    Medium: { ring: 'stroke-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    High: { ring: 'stroke-red-400', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/40' },
  };

  const colors = colorMap[level] || colorMap.Low;

  // SVG ring progress (score capped at 100 for display)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const displayScore = Math.min(score, 100);
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular progress ring */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background track */}
          <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor"
            className="text-white/10" strokeWidth="10" />
          {/* Progress arc */}
          <circle cx="80" cy="80" r={radius} fill="none"
            className={colors.ring}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold tabular-nums ${colors.text}`}>{score}</span>
          <span className="text-xs text-white/40 mt-1">/ 100+</span>
        </div>
      </div>

      {/* Level badge */}
      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${colors.badge}`}>
        {level} Load
      </span>
    </div>
  );
}
