import { Languages } from 'lucide-react';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  BACKEND_ERROR_MAP_EN,
  TRANSLATIONS,
  TranslationKey,
} from './locales';

export type Locale = 'vi' | 'en';
export type { TranslationKey };
export const LANG_STORAGE_KEY = 'bonzstore_lang';

export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'vi';
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  return saved === 'en' || saved === 'vi' ? saved : 'vi';
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    template,
  );
}

export function translateStatic(
  key: TranslationKey,
  params?: Record<string, string | number>,
  localeOverride?: Locale,
): string {
  const lang = localeOverride || getCurrentLocale();
  const raw = TRANSLATIONS[lang][key] || TRANSLATIONS.vi[key] || key;
  return interpolate(raw, params);
}

export function translateBackendMessage(message: string): string {
  const lang = getCurrentLocale();
  if (lang === 'vi' || !message) return message;
  for (const rule of BACKEND_ERROR_MAP_EN) {
    if (rule.match.test(message)) {
      return rule.replace;
    }
  }
  return message;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getCurrentLocale());

  const setLocale = useCallback((lang: Locale) => {
    setLocaleState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === 'vi' ? 'en' : 'vi';
      localStorage.setItem(LANG_STORAGE_KEY, next);
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  const t = useCallback(
    (
      key: TranslationKey,
      params?: Record<string, string | number>,
    ): string => {
      return translateStatic(key, params, locale);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return ctx;
}

export function LanguageToggle() {
  const { locale, toggleLocale } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="action-btn-secondary px-2.5 py-1.5 font-display text-xs uppercase"
      title="Switch Language (VI / EN)"
    >
      <Languages className="h-3.5 w-3.5 text-foreground dark:text-primary" />
      <span>{locale === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  );
}
