'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type TimePeriod = 'morning' | 'afternoon' | 'night';
export type TimeModePreference = 'auto' | TimePeriod;

export interface TimeThemePalette {
  skyTopHex: string;
  skyMidHex: string;
  skyBottomHex: string;
  auroraPrimary: string;
  auroraSecondary: string;
  horizonSilhouette: string;
  cloudTint: string;
}

export interface TimePeriodMeta {
  period: TimePeriod;
  shortName: string;
  badgeText: string;
  label: string;
  timeRange: string;
  greeting: string;
  subGreeting: string;
  farewellQuote: string;
  accentHex: string;
  sceneTitle: string;
  palette: TimeThemePalette;
}

interface TimeModeContextValue {
  mode: TimeModePreference;
  period: TimePeriod;
  hour: number;
  meta: TimePeriodMeta;
  label: string;
  greeting: string;
  subGreeting: string;
  setMode: (mode: TimeModePreference) => void;
  cycleMode: () => void;
}

const STORAGE_KEY = 'kwTimeMode';

export function resolvePeriodFromHour(hour: number): TimePeriod {
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'afternoon';
  return 'night';
}

export const TIME_PERIOD_CONFIG: Record<TimePeriod, TimePeriodMeta> = {
  morning: {
    period: 'morning',
    shortName: 'Sáng',
    badgeText: '☀ BUỔI SÁNG (06:00 – 11:00)',
    label: 'Bình Minh Skyopolis (06:00 – 11:00)',
    timeRange: '06:00 – 11:00',
    sceneTitle: 'Bình Minh Thành Phố Nổi BonzStore',
    greeting: 'Ohayou! Trạm Không Gian BonzStore đón nắng mai ☀️',
    subGreeting:
      'Bầu trời pha lê xanh ngọc và hoa anh đào sớm mai đang mở lối vào khoang Figure & Nendoroid chính hãng mới nhất.',
    farewellQuote:
      '🌅 Chuyến tàu sớm mai tại BonzStore luôn tràn ngập năng lượng sưu tầm!',
    accentHex: '#38BDF8',
    palette: {
      skyTopHex: '#7DD3FC',
      skyMidHex: '#E0F2FE',
      skyBottomHex: '#FFFDF9',
      auroraPrimary: 'rgba(56, 189, 248, 0.32)',
      auroraSecondary: 'rgba(244, 114, 182, 0.22)',
      horizonSilhouette: '#BAE6FD',
      cloudTint: 'rgba(255, 255, 255, 0.85)',
    },
  },
  afternoon: {
    period: 'afternoon',
    shortName: 'Trưa',
    badgeText: '🌅 BUỔI TRƯA (11:00 – 18:00)',
    label: 'Nắng Trưa & Hoàng Hôn (11:00 – 18:00)',
    timeRange: '11:00 – 18:00',
    sceneTitle: 'Thung Lũng Nắng Hổ Phách BonzStore',
    greeting: 'Konnichiwa! Đường chân trời BonzStore rực nắng vàng 🌤️',
    subGreeting:
      'Nắng mật ong phủ ấm đường ray trên không — Tàu tốc hành Bonz Express đang tăng tốc giao Figure hỏa tốc 2H.',
    farewellQuote:
      '🌇 Hoàng hôn dát vàng lên từng hộp Figure sưu tầm tại BonzStore!',
    accentHex: '#F59E0B',
    palette: {
      skyTopHex: '#FDBA74',
      skyMidHex: '#FEF3C7',
      skyBottomHex: '#FFF9EE',
      auroraPrimary: 'rgba(245, 158, 11, 0.30)',
      auroraSecondary: 'rgba(251, 113, 133, 0.24)',
      horizonSilhouette: '#FDE68A',
      cloudTint: 'rgba(255, 247, 237, 0.85)',
    },
  },
  night: {
    period: 'night',
    shortName: 'Tối',
    badgeText: '🌙 BUỔI TỐI (18:00 – 06:00)',
    label: 'Tinh Vân Đêm Sao (18:00 – 06:00)',
    timeRange: '18:00 – 06:00',
    sceneTitle: 'Đài Quan Sát Tinh Vân BonzStore',
    greeting: 'Konbanwa! Tinh vân đêm sao BonzStore đã lên đèn 🌙',
    subGreeting:
      'Bầu trời chòm sao Anime & sao băng tím Indigo đã mở — thời khắc lý tưởng để săn Pre-Order giới hạn và giải mã hồ sơ #4869.',
    farewellQuote:
      '🌌 Chòm sao BonzStore luôn tỏa sáng cùng bộ sưu tập của bạn suốt đêm!',
    accentHex: '#A78BFA',
    palette: {
      skyTopHex: '#070913',
      skyMidHex: '#131836',
      skyBottomHex: '#1F1B3D',
      auroraPrimary: 'rgba(139, 92, 246, 0.28)',
      auroraSecondary: 'rgba(56, 189, 248, 0.18)',
      horizonSilhouette: '#1E1B4B',
      cloudTint: 'rgba(99, 102, 241, 0.16)',
    },
  },
};

const TimeModeContext = createContext<TimeModeContextValue | null>(null);

export function TimeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<TimeModePreference>('auto');
  const [hour, setHour] = useState<number>(9);

  useEffect(() => {
    const nowHour = new Date().getHours();
    setHour(nowHour);

    try {
      const saved = window.localStorage.getItem(
        STORAGE_KEY,
      ) as TimeModePreference | null;
      if (
        saved === 'auto' ||
        saved === 'morning' ||
        saved === 'afternoon' ||
        saved === 'night'
      ) {
        setModeState(saved);
      }
    } catch {
      // ignore localStorage read issues
    }

    const timer = window.setInterval(() => {
      setHour(new Date().getHours());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const period: TimePeriod = useMemo(() => {
    if (mode === 'auto') {
      return resolvePeriodFromHour(hour);
    }
    return mode;
  }, [mode, hour]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const classes = ['is-morning', 'is-afternoon', 'is-night'];
    const activeClass = `is-${period}`;

    root.classList.remove(...classes, 'dark');
    body.classList.remove(...classes);

    root.classList.add(activeClass);
    body.classList.add(activeClass);
    root.setAttribute('data-time-mode', activeClass);
    body.setAttribute('data-time-mode', activeClass);

    if (period === 'night') {
      root.classList.add('dark');
    }

    window.dispatchEvent(
      new CustomEvent('kwTimeChanged', {
        detail: { mode, period, hour },
      }),
    );
  }, [mode, period, hour]);

  const setMode = useCallback((next: TimeModePreference) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore write issues
    }
  }, []);

  const cycleMode = useCallback(() => {
    const order: TimeModePreference[] = ['morning', 'afternoon', 'night', 'auto'];
    const idx = order.indexOf(mode);
    const next = order[(idx + 1) % order.length];
    setMode(next);
  }, [mode, setMode]);

  const meta = TIME_PERIOD_CONFIG[period];

  const value = useMemo<TimeModeContextValue>(
    () => ({
      mode,
      period,
      hour,
      meta,
      label: meta.label,
      greeting: meta.greeting,
      subGreeting: meta.subGreeting,
      setMode,
      cycleMode,
    }),
    [mode, period, hour, meta, setMode, cycleMode],
  );

  return (
    <TimeModeContext.Provider value={value}>{children}</TimeModeContext.Provider>
  );
}

export function useTimeMode(): TimeModeContextValue {
  const ctx = useContext(TimeModeContext);
  if (!ctx) {
    throw new Error('useTimeMode must be used inside TimeModeProvider');
  }
  return ctx;
}
