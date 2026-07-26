import { useMemo, useState, useCallback, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline, createTheme, type PaletteOptions } from '@mui/material';
import { ThemeModeContext, THEME_STORAGE_KEY, type ThemeMode } from './ThemeModeContext';

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: (mode === 'light'
            ? {
                mode,
                primary: {
                  main: '#3E5C76',
                  dark: '#1D2D44',
                  light: '#C9DCE8',
                  contrastText: '#ffffff',
                },
                secondary: { main: '#1D2D44', contrastText: '#ffffff' },
                background: { default: '#EAF2F8', paper: '#ffffff' },
                text: { primary: '#1D2D44' },
              }
            : {
                mode,
                primary: {
                  // `dark` is what MUI uses for the contained-button hover; keep it
                  // light enough that the dark contrastText stays readable.
                  main: '#8FB3CE',
                  dark: '#6E97B5',
                  light: '#C9DCE8',
                  contrastText: '#12202F',
                },
                secondary: { main: '#C9DCE8', contrastText: '#1D2D44' },
                background: { default: '#12202F', paper: '#1D2D44' },
                text: { primary: '#EAF2F8', secondary: '#AFC2D4' },
                divider: 'rgba(201, 220, 232, 0.16)',
              }) as PaletteOptions,
        shape: { borderRadius: 12 },
        typography: {
          h4: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          subtitle1: { fontWeight: 700 },
        },
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
