import { useEffect, useState } from 'react';

/**
 * Notification — Toast-style alert shown when cognitive load is High.
 * Auto-dismisses after 6 seconds.
 */
export default function Notification({ level, score }) {
  const [visible, setVisible] = useState(false);
  const [lastLevel, setLastLevel] = useState(null);

  useEffect(() => {
    // Only show when transitioning TO High
    if (level === 'High' && lastLevel !== 'High') {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(timer);
    }
    setLastLevel(level);
  }, [level]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-2">
      <div className="bg-red-950 border border-red-500/50 rounded-xl p-4 shadow-2xl flex items-start gap-3">
        <span className="text-2xl">🔴</span>
        <div>
          <p className="font-semibold text-red-300 text-sm">High Cognitive Load Detected</p>
          <p className="text-red-400/80 text-xs mt-1">
            Your load score is {score}. Consider taking a break or reducing multitasking.
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-auto text-red-400/60 hover:text-red-300 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
