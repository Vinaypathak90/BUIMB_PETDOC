import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize with default, load from localStorage in useEffect
  const [theme, setTheme] = useState('light');
  const [accent, setAccent] = useState('blue');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    const savedAccent = localStorage.getItem('appAccent') || 'blue';
    
    setTheme(savedTheme);
    setAccent(savedAccent);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Remove old classes
    body.classList.remove('light-mode', 'dark-mode', 'blue-mode');
    
    // Add correct theme class based on theme value
    if (theme === 'dark') {
      body.classList.add('dark-mode');
    } else if (theme === 'blue') {
      body.classList.add('blue-mode');
    } else {
      body.classList.add('light-mode');
    }
    
    // Save to local storage
    localStorage.setItem('appTheme', theme);
    localStorage.setItem('appAccent', accent);
  }, [theme, accent, mounted]);

  // Color Map for dynamic styles
  const colors = {
    blue: { primary: 'bg-[#192a56]', text: 'text-[#192a56]', accent: 'bg-[#00d0f1]', textAccent: 'text-[#00d0f1]' },
    emerald: { primary: 'bg-emerald-900', text: 'text-emerald-900', accent: 'bg-emerald-500', textAccent: 'text-emerald-500' },
    violet: { primary: 'bg-violet-900', text: 'text-violet-900', accent: 'bg-violet-500', textAccent: 'text-violet-500' },
    orange: { primary: 'bg-orange-900', text: 'text-orange-900', accent: 'bg-orange-500', textAccent: 'text-orange-500' },
  };

  const currentColors = colors[accent];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, currentColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);