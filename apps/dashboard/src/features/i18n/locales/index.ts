import { BACKEND_ERROR_MAP_EN, en } from './en';
import { vi } from './vi';

export const TRANSLATIONS = {
  vi,
  en,
} as const;

export type TranslationKey = keyof typeof vi;

export { BACKEND_ERROR_MAP_EN, en, vi };

