import { useContext } from 'react';
import { ThemeModeContext, type ThemeModeContextValue } from '../theme/ThemeModeContext';

export function useThemeMode(): ThemeModeContextValue {
  return useContext(ThemeModeContext);
}
