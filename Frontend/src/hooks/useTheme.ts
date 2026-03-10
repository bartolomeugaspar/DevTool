import { useThemeStore } from '../store/themeStore';
import { tokens, type ThemeTokens } from '../lib/theme';

export interface UseThemeReturn extends ThemeTokens {
  theme: 'dark' | 'light';
  light: boolean;
  toggle: () => void;
}

/**
 * Convenience hook — returns theme state + all resolved color tokens.
 * Usage: const { light, card, accent, toggle } = useTheme();
 */
export function useTheme(): UseThemeReturn {
  const { theme, toggle } = useThemeStore();
  const light = theme === 'light';
  return { theme, light, toggle, ...tokens(light) };
}
