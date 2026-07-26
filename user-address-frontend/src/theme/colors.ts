/**
 * Brand palette and the colour maps derived from it, kept in one place instead
 * of scattered as string literals across components. Anything that needs a
 * brand colour (charts, status chips, avatars) imports it from here.
 */

export const BRAND = {
  primary: '#3E5C76',
  primaryDark: '#1D2D44',
  primaryLight: '#C9DCE8',
  primarySoft: '#8FB3CE',
  surfaceDark: '#4A5A6E',
  textDark: '#AFC2D4',
} as const;

/** Semantic colours for success/error accents. */
export const STATUS = {
  success: '#2E7D32',
  error: '#C62828',
} as const;

export interface ChartColors {
  bar: string;
  grid: string;
  tick: string;
  doughnutTrack: string;
}

/** Chart colours per theme mode, so the charts read well in light and dark. */
export const CHART_COLORS: Record<'light' | 'dark', ChartColors> = {
  light: {
    bar: BRAND.primary,
    grid: 'rgba(29, 45, 68, 0.1)',
    tick: BRAND.primaryDark,
    doughnutTrack: BRAND.primaryLight,
  },
  dark: {
    bar: BRAND.primarySoft,
    grid: 'rgba(201, 220, 232, 0.15)',
    tick: BRAND.textDark,
    doughnutTrack: BRAND.surfaceDark,
  },
};
