import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar — Top navigation with dark mode toggle.
 */
export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
        location.pathname === to
          ? 'bg-white/10 text-white'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-gray-950/80 border-b border-white/10 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <span className="font-bold text-white text-sm tracking-tight">Cognitive Load Tracker</span>
      </div>

      <div className="flex items-center gap-1">
        {navLink('/', 'Dashboard')}
        {navLink('/daily', 'Daily Summary')}
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="text-white/50 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        title="Toggle dark mode"
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </nav>
  );
}
