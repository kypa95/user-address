import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const ThemeModeContext = createContext({ mode: 'light', toggleMode: () => {} });

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

const STORAGE_KEY = 'theme-mode';

function getInitialMode() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#6366f1' },
        },
        shape: { borderRadius: 12 },
      }),
    [mode],
  );

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
