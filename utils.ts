
import { CyclePhase, UserSettings, DayLog, CycleAnalysis, CycleHistoryItem, AnomalyType, FlowIntensity, Mood } from './types';

// --- Date Helpers ---

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

export const getDayDiff = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isFutureDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const date = new Date(dateStr);
    return date > today;
};

// --- Math & Cycle Logic ---

export const calculateCyclePhase = (today: string, settings: UserSettings): CyclePhase => {
  if (settings.goal === 'pregnancy') {
      // Simple pregnancy logic: Day in cycle = days since LMP
      const start = settings.lastPeriodDate ? new Date(settings.lastPeriodDate) : new Date();
      const now = new Date(today);
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return {
          phase: 'Pregnancy',
          dayInCycle: diffDays,
          daysUntilNextPeriod: 0,
          isFertile: false
      };
  }

  if (settings.goal === 'postpartum') {
      return { phase: 'Postpartum', dayInCycle: 0, daysUntilNextPeriod: 0, isFertile: false };
  }

  if (settings.goal === 'menopause') {
       return { phase: 'Menopause', dayInCycle: 0, daysUntilNextPeriod: 0, isFertile: false };
  }

  if (!settings.lastPeriodDate) {
    return { phase: 'Follicular', dayInCycle: 1, daysUntilNextPeriod: 28, isFertile: false };
  }

  const start = new Date(settings.lastPeriodDate);
  const now = new Date(today);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Basic modulo logic for cycle day
  const dayInCycle = (diffDays % settings.avgCycleLength) + 1;
  const daysUntilNextPeriod = settings.avgCycleLength - dayInCycle;

  let phase: CyclePhase['phase'] = 'Follicular';
  let isFertile = false;

  // Simple Phase Logic
  if (dayInCycle <= settings.avgPeriodLength) {
    phase = 'Menstruation';
  } else if (dayInCycle >= 12 && dayInCycle <= 16) {
    phase = 'Ovulation';
    isFertile = true;
  } else if (dayInCycle > 16) {
    phase = 'Luteal';
  }

  // Fertile window extension (Ovulation +/- 2 days approx)
  if (dayInCycle >= 10 && dayInCycle <= 17) {
    isFertile = true;
  }

  return {
    phase,
    dayInCycle: dayInCycle > 0 ? dayInCycle : 1,
    daysUntilNextPeriod,
    isFertile
  };
};

export const predictNextPeriod = (lastPeriod: string, cycleLength: number): string => {
  return addDays(lastPeriod, cycleLength);
};

export const predictOvulation = (nextPeriod: string): string => {
  // Ovulation is roughly 14 days before the NEXT period
  const date = new Date(nextPeriod);
  date.setDate(date.getDate() - 14);
  return formatDate(date);
};

// --- Smart Analytics Engine ---

export const analyzeCycles = (logs: Record<string, DayLog>, settings: UserSettings): CycleAnalysis => {
    const dates = Object.keys(logs).sort();
    const history: CycleHistoryItem[] = [];
    const anomalies: CycleAnalysis['anomalies'] = [];
    
    // 1. Reconstruct Cycles
    // Identify sequences of Flow > 0 separated by at least 10 days of no flow
    let currentCycleStart: string | null = null;
    let currentPeriodDays = 0;
    
    // Helper to check if date2 is next day of date1
    const isNextDay = (d1: string, d2: string) => getDayDiff(d1, d2) === 1;

    // Scan for period starts
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const log = logs[date];
        
        if (log.flow > FlowIntensity.None) {
            // Check if this is a NEW period
            const prevDate = new Date(date);
            prevDate.setDate(prevDate.getDate() - 1);
            const prevDateStr = formatDate(prevDate);
            const prevLog = logs[prevDateStr];

            // It's a start if no flow yesterday OR gap is huge
            if (!prevLog || prevLog.flow === FlowIntensity.None) {
                // If we have a previous cycle pending, close it
                if (currentCycleStart) {
                    const length = getDayDiff(currentCycleStart, date);
                    // Filter out short bleeding episodes (spotting) < 14 days apart
                    if (length > 14) {
                        history.push({
                            startDate: currentCycleStart,
                            endDate: date, // The start of the NEXT is the end marker
                            length: length,
                            periodLength: currentPeriodDays // Approx
                        });
                    } else {
                        // This might be spotting in the middle of a cycle
                        anomalies.push({ type: 'Spotting', date: currentCycleStart, details: 'Межменструальное кровотечение' });
                    }
                }
                currentCycleStart = date;
                currentPeriodDays = 1;
            } else {
                // Continuation of period
                currentPeriodDays++;
            }
        }
    }

    // 2. Statistics
    let avgLength = settings.avgCycleLength;
    let avgPeriod = settings.avgPeriodLength;
    let variability = 0;

    if (history.length > 0) {
        const totalLen = history.reduce((sum, item) => sum + item.length, 0);
        avgLength = Math.round(totalLen / history.length);
        
        const totalPeriod = history.reduce((sum, item) => sum + item.periodLength, 0);
        avgPeriod = Math.round(totalPeriod / history.length);

        // Standard Deviation
        const variance = history.reduce((sum, item) => sum + Math.pow(item.length - avgLength, 2), 0) / history.length;
        variability = Math.sqrt(variance);
    }

    // 3. Prediction Confidence
    let predictionConfidence: 'High' | 'Medium' | 'Low' = 'High';
    if (variability > 5) predictionConfidence = 'Low';
    else if (variability > 2.5) predictionConfidence = 'Medium';
    if (history.length < 2) predictionConfidence = 'Low'; // Not enough data

    // 4. Anomaly Detection
    if (avgLength < 21) anomalies.push({ type: 'ShortCycle', details: 'Цикл короче 21 дня' });
    if (avgLength > 35) anomalies.push({ type: 'LongCycle', details: 'Цикл длиннее 35 дней' });
    if (variability > 7) anomalies.push({ type: 'Irregular', details: 'Высокая вариабельность цикла' });

    // 5. Correlations (Simple)
    // Example: Avg Mood score when Sleep < 7 vs Sleep >= 7
    let badSleepMoodBad = 0;
    let goodSleepMoodBad = 0;
    let badSleepCount = 0;
    let goodSleepCount = 0;

    dates.forEach(d => {
        const l = logs[d];
        const isBadMood = (l.moods?.includes(Mood.Irritable) || l.moods?.includes(Mood.Sad) || l.moods?.includes(Mood.Anxious) || l.moods?.includes(Mood.Depressed));
        if (l.sleepHours < 7) {
            badSleepCount++;
            if (isBadMood) badSleepMoodBad++;
        } else {
            goodSleepCount++;
            if (isBadMood) goodSleepMoodBad++;
        }
    });

    const sleepEffect = (badSleepCount > 5 && (badSleepMoodBad/badSleepCount > goodSleepMoodBad/Math.max(1, goodSleepCount)))
        ? "Недосып ухудшает настроение" 
        : "Связь сна и настроения в норме";

    return {
        history: history.reverse(), // Newest first
        avgLength,
        avgPeriod,
        variability,
        predictionConfidence,
        anomalies,
        correlations: {
            sleepEffect,
            stressEffect: "Стресс влияет на либидо" // Placeholder logic
        }
    };
};

// --- Haptics (Telegram Wrapper) ---

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        MainButton: {
            text: string;
            color: string;
            textColor: string;
            isVisible: boolean;
            isActive: boolean;
            setText: (text: string) => void;
            show: () => void;
            hide: () => void;
            enable: () => void;
            disable: () => void;
            showProgress: (leaveActive: boolean) => void;
            hideProgress: () => void;
            onClick: (cb: () => void) => void;
            offClick: (cb: () => void) => void;
            setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        BackButton: {
            isVisible: boolean;
            show: () => void;
            hide: () => void;
            onClick: (cb: () => void) => void;
            offClick: (cb: () => void) => void;
        };
        ready: () => void;
        expand: () => void;
        showAlert: (message: string) => void;
        themeParams: any;
      };
    };
  }
}

export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  },
  success: () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  },
  selection: () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  }
};

// --- Local Storage ---
const STORAGE_KEY_SETTINGS = 'femcycle_settings';
const STORAGE_KEY_LOGS = 'femcycle_logs';

export const saveSettings = (s: UserSettings) => localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s));
export const getSettings = (): UserSettings | null => {
  const s = localStorage.getItem(STORAGE_KEY_SETTINGS);
  return s ? JSON.parse(s) : null;
};

export const saveLogs = (logs: Record<string, DayLog>) => localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
export const getLogs = (): Record<string, DayLog> => {
  const l = localStorage.getItem(STORAGE_KEY_LOGS);
  return l ? JSON.parse(l) : {};
};
