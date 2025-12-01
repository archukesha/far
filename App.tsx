import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { UserSettings, DayLog, CyclePhase, FlowIntensity } from './types';
import { getSettings, saveSettings, getLogs, saveLogs, calculateCyclePhase, haptic, formatDate } from './utils';

// --- Pages Imports ---
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import LogPage from './pages/LogPage';
import InsightsPage from './pages/InsightsPage';
import AdvicePage from './pages/AdvicePage';
import OnboardingPage from './pages/OnboardingPage';
import { FloatingDock } from './components/Components';

// --- Global State ---
interface AppState {
  settings: UserSettings;
  logs: Record<string, DayLog>;
  cyclePhase: CyclePhase;
  updateSettings: (s: Partial<UserSettings>) => void;
  addLog: (date: string, log: DayLog) => void;
  resetData: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const DEFAULT_SETTINGS: UserSettings = {
  isOnboarded: false,
  avgCycleLength: 28,
  avgPeriodLength: 5,
  lastPeriodDate: '',
  isPro: false,
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const s = getSettings();
    const l = getLogs();
    if (s) setSettings(s);
    if (l) setLogs(l);
    setLoading(false);
    
    // Telegram Expand
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
  }, []);

  // Save effects
  useEffect(() => {
    if (!loading) saveSettings(settings);
  }, [settings, loading]);

  useEffect(() => {
    if (!loading) saveLogs(logs);
  }, [logs, loading]);

  const updateSettings = (s: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  };

  const addLog = (date: string, log: DayLog) => {
    setLogs(prev => ({ ...prev, [date]: log }));
    
    // Auto-detect new cycle start
    // Logic: If user logs flow, and it is significantly after the current last period date (e.g. >= 21 days)
    // We treat this as the start of a new cycle.
    if (log.flow > FlowIntensity.None && settings.lastPeriodDate) {
        const logDate = new Date(date);
        const lastPeriod = new Date(settings.lastPeriodDate);
        const diffTime = logDate.getTime() - lastPeriod.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Minimum cycle length check (21 days) to avoid resetting on spotting mid-cycle
        if (diffDays >= 21) {
             updateSettings({ lastPeriodDate: date });
        }
        // Also update if the user is logging a date BEFORE the current lastPeriodDate (correction scenario)
        // or if they are just starting out and settings might be stale.
        // For simplicity, we stick to the forward-moving cycle closure.
    } else if (log.flow > FlowIntensity.None && !settings.lastPeriodDate) {
        // Initial fallback
        updateSettings({ lastPeriodDate: date });
    }
  };

  const resetData = () => {
      setSettings(DEFAULT_SETTINGS);
      setLogs({});
      localStorage.clear();
      window.location.reload();
  };

  const cyclePhase = calculateCyclePhase(formatDate(new Date()), settings);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF2F8] text-primary">Loading...</div>;

  return (
    <AppContext.Provider value={{ settings, logs, cyclePhase, updateSettings, addLog, resetData }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Layout Component ---
const Layout = () => {
  const { settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Background Blobs
  const Background = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
       {/* Primary Blob */}
       <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
       {/* Secondary Blob */}
       <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
       {/* Tertiary Blob */}
       <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
    </div>
  );

  if (!settings.isOnboarded) {
    return (
        <div className="relative min-h-screen bg-[#FDF2F8] text-gray-800 font-sans">
            <Background />
            <div className="relative z-10">
                <OnboardingPage />
            </div>
        </div>
    );
  }

  const getActiveTab = () => {
    const path = location.pathname.substring(1); // remove /
    return path || 'home';
  };

  return (
    <div className="relative min-h-screen bg-[#FDF2F8] text-gray-800 font-sans pb-28">
      <Background />
      <div className="relative z-10 max-w-md mx-auto p-4 animate-in fade-in duration-500">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/advice" element={<AdvicePage />} />
        </Routes>
      </div>
      <FloatingDock activeTab={getActiveTab()} onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </HashRouter>
  );
};

export default App;