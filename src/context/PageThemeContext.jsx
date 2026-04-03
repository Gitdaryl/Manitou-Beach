import { createContext, useContext, useEffect } from 'react';

// Sets data-theme on <html> so CSS custom properties cascade everywhere,
// including the Navbar and any component using var(--page-accent).
export const PageThemeContext = createContext('home');

export function PageThemeProvider({ theme, children }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  return (
    <PageThemeContext.Provider value={theme}>
      {children}
    </PageThemeContext.Provider>
  );
}

export const usePageTheme = () => useContext(PageThemeContext);
