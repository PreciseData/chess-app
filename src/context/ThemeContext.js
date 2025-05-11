import React, { createContext, useState, useEffect } from 'react';

// Create a context for theme management
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference stored in localStorage
  const storedTheme = localStorage.getItem('chessAppTheme');
  
  // Initialize state with stored theme or default to 'light'
  const [theme, setTheme] = useState(storedTheme || 'light');
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('chessAppTheme', newTheme);
  };
  
  // Apply theme class to body element
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;