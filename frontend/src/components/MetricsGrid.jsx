/**
 * MetricsGrid — Shows real-time activity metrics in a 2×2 card grid.
 */
export default function MetricsGrid({ metrics }) {
  const cards = [
    {
      label: 'Open Tabs / Apps',
      value: metrics.appCount,
      unit: 'tabs',
      icon: '🗂️',
      hint: 'Simulated from tab switches',
    },
    {
      label: 'Tab Switches / Min',
      value: metrics.switchesPerMin.toFixed(1),
      unit: '/min',
      icon: '🔀',
      hint: 'Context switching frequency',
    },
    {
      label: 'Typing Interruptions',
      value: metrics.typingInterruptions,
      unit: 'stops',
      icon: '⌨️',
      hint: 'Times typing paused & resumed',
    },
    {
      label: 'Idle Fluctuations',
      value: metrics.idleFluctuation,
      unit: 'shifts',
      icon: '💤',
      hint: 'Active ↔ idle transitions',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1 hover:bg-white/8 transition-colors"
        >
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span>{card.icon}</span>
            <span>{card.label}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-white tabular-nums">{card.value}</span>
            <span className="text-xs text-white/40">{card.unit}</span>
          </div>
          <p className="text-xs text-white/30 mt-0.5">{card.hint}</p>
        </div>
      ))}

      {/* Idle status indicator spanning full width */}
      <div className={`col-span-2 rounded-xl px-4 py-2 flex items-center gap-2 text-sm border transition-colors
        ${metrics.isIdle
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          : 'bg-green-500/10 border-green-500/30 text-green-300'}`}>
        <span className={`w-2 h-2 rounded-full ${metrics.isIdle ? 'bg-blue-400' : 'bg-green-400 animate-pulse'}`} />
        {metrics.isIdle ? 'Currently idle (no activity detected)' : 'Active — tracking in progress'}
      </div>
    </div>
  );
}
