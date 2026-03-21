import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
} from 'date-fns';
import { enUS, tr, de, fr } from 'date-fns/locale';
import { getCurrentLanguage } from '../i18n';

const localeMap: Record<string, Locale> = {
  en: enUS,
  tr,
  de,
  fr,
};

function getLocale(): Locale {
  return localeMap[getCurrentLanguage()] ?? enUS;
}

/** Short relative time: "2m", "1h", "Yesterday", "Mon", "Mar 10" */
export function formatTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  const locale = getLocale();

  if (isToday(d)) {
    return format(d, 'HH:mm', { locale });
  }
  if (isYesterday(d)) {
    return format(d, "'Yesterday'", { locale });
  }
  if (isThisWeek(d)) {
    return format(d, 'EEE', { locale });
  }
  if (isThisYear(d)) {
    return format(d, 'MMM d', { locale });
  }
  return format(d, 'dd.MM.yy', { locale });
}

/** Full date+time: "Mar 10, 2026 at 14:30" */
export function formatFullDateTime(date: Date | string | number): string {
  const d = new Date(date);
  const locale = getLocale();
  return format(d, 'PPp', { locale });
}

/** Date separator in chat: "Today", "Yesterday", "Tuesday, Mar 10" */
export function formatDateSeparator(date: Date | string | number): string {
  const d = new Date(date);
  const locale = getLocale();

  if (isToday(d)) {
    return format(d, "'Today'", { locale });
  }
  if (isYesterday(d)) {
    return format(d, "'Yesterday'", { locale });
  }
  if (isThisYear(d)) {
    return format(d, 'EEEE, MMM d', { locale });
  }
  return format(d, 'EEEE, MMM d, yyyy', { locale });
}

/** Relative time: "2 minutes ago", "1 hour ago" */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const locale = getLocale();
  return formatDistanceToNow(d, { addSuffix: true, locale });
}

/** Message time: "14:30" */
export function formatMessageTime(date: Date | string | number): string {
  const d = new Date(date);
  const locale = getLocale();
  return format(d, 'HH:mm', { locale });
}

/** Call history timestamp: "Today, 14:30" / "Yesterday, 09:15" / "Mar 10, 18:00" */
export function formatCallTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  const locale = getLocale();

  if (isToday(d)) {
    return `Today, ${format(d, 'HH:mm', { locale })}`;
  }
  if (isYesterday(d)) {
    return `Yesterday, ${format(d, 'HH:mm', { locale })}`;
  }
  if (isThisYear(d)) {
    return format(d, 'MMM d, HH:mm', { locale });
  }
  return format(d, 'dd.MM.yy, HH:mm', { locale });
}
