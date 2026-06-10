/** React context that provides the active AppTheme to all components via useTheme(). */
import { createContext, useContext, type ReactNode } from 'react';
import type { AppTheme } from './contract';

const ThemeContext = createContext<AppTheme>(null as unknown as AppTheme);

/** Returns the currently active AppTheme. Call inside any component wrapped by ThemeProvider. */
export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}

/** Provides the given AppTheme to all descendant components. */
export function ThemeProvider({ theme, children }: {
  theme: AppTheme;
  children: ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}