// ─── Country data & phone-formatting helpers ────────────

export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  /** # = digit placeholder, spaces/dashes are formatting chars */
  fmt: string;
}

export const COUNTRIES: Country[] = [
  { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷', fmt: '### ### ## ##' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', fmt: '#### #######' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', fmt: '#### ######' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', fmt: '# ## ## ## ##' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', fmt: '### ### ####' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', fmt: '### ### ###' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', fmt: '# ########' },
  { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪', fmt: '### ## ## ##' },
  { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹', fmt: '#### ######' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭', fmt: '## ### ## ##' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪', fmt: '## ### ## ##' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴', fmt: '### ## ###' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰', fmt: '## ## ## ##' },
  { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮', fmt: '## ### ####' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱', fmt: '### ### ###' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', fmt: '### ### ###' },
  { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷', fmt: '### ### ####' },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪', fmt: '## ### ####' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420', flag: '🇨🇿', fmt: '### ### ###' },
  { code: 'RO', name: 'Romania', dial: '+40', flag: '🇷🇴', fmt: '### ### ###' },
  { code: 'HU', name: 'Hungary', dial: '+36', flag: '🇭🇺', fmt: '## ### ####' },
  { code: 'BG', name: 'Bulgaria', dial: '+359', flag: '🇧🇬', fmt: '### ### ###' },
  { code: 'HR', name: 'Croatia', dial: '+385', flag: '🇭🇷', fmt: '## ### ####' },
  { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦', fmt: '## ### ## ##' },
  { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺', fmt: '### ### ## ##' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', fmt: '### ### ####' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', fmt: '### ### ####' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', fmt: '## ##### ####' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', fmt: '##### #####' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪', fmt: '## ### ####' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', fmt: '## ### ####' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', fmt: '#### ### ###' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', fmt: '## #### ####' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷', fmt: '## #### ####' },
  { code: 'AZ', name: 'Azerbaijan', dial: '+994', flag: '🇦🇿', fmt: '## ### ## ##' },
  { code: 'GE', name: 'Georgia', dial: '+995', flag: '🇬🇪', fmt: '### ## ## ##' },
].sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY: Country = COUNTRIES.find((c) => c.code === 'TR')!;

// ─── Phone formatting helpers ────────────────────────────

export function formatPhone(raw: string, fmt: string): string {
  let result = '';
  let di = 0;
  for (let i = 0; i < fmt.length && di < raw.length; i++) {
    result += fmt[i] === '#' ? raw[di++] : fmt[i];
  }
  return result;
}

export function maxDigits(fmt: string): number {
  let count = 0;
  for (const c of fmt) {
    if (c === '#') count++;
  }
  return count;
}

export function phonePlaceholder(fmt: string): string {
  return fmt.replace(/#/g, '0');
}

export const E164_REGEX = /^\+[1-9]\d{6,14}$/;
