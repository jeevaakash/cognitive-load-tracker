import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DailySummary from './pages/DailySummary';

/**
 * App — Root component with routing and dark mode state.
 */
export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950 text-white font-sans">
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily" element={<DailySummary />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}
