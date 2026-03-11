import { useThemeStore } from '../store/themeStore';
import { tokens, type ThemeTokens } from '../lib/theme';

export interface UseThemeReturn extends ThemeTokens {
  theme: 'dark' | 'light';
  light: boolean;
  toggle: () => void;
}

export function useTheme(): UseThemeReturn {
  const { theme, toggle } = useThemeStore();
  const light = theme === 'light';
  return { theme, light, toggle, ...tokens(light) };
}
